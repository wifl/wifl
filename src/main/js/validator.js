define(["jquery"],function(jQuery) {

  function checkExample(query) {
    return checkRequest({
      message: query.example.request,
      request: query.request,
      invalid: query.invalid,
      valid: function() { return checkResponse({
        message: query.example.response,
        responses: query.request.responses,
        invalid: query.invalid,
        valid: query.valid
      }); }
    });
  }

  function checkRequest(query) {
    return checkParams({
      values: query.message.headers,
      params: query.request.headerParams,
      invalid: query.invalid,
      valid: function() { return checkParams({
        values: query.request.uriTemplate.parse(query.message.uri),
        params: query.request.uriParams,
        invalid: query.invalid,
        valid: function() { return checkRepresentation({
          body: query.message.body,
          contentType: query.message.headers["Content-Type"],
          representations: query.request.representations,
          invalid: query.invalid,
          valid: query.valid
        }); }
      }); }
    });
  }

  function checkResponse(query) {
    for (var i=0; i<query.responses.length; i++) {
      var response = query.responses[i];
      if (response.statuses.indexOf(query.message.status) !== -1) {
        return checkParams({
          values: query.message.headers,
          params: response.headerParams,
          invalid: query.invalid,
          valid: function() { return checkRepresentation({
            body: query.message.body,
            contentType: query.message.headers["Content-Type"],
            representations: response.representations,
            invalid: query.invalid,
            valid: query.valid
          }); }
        });
      }
    }
    return query.invalid("Unrecognized status code " + query.message.status);
  }

  function checkParams(query,offset) {
    offset = offset || 0;
    while (offset < query.params.length) {
      var param = query.params[offset++];
      var value = query.values[param.name];
      if (value) {
        if (param.dataType) {
          return checkParam({
            value: value,
            param: param,
            invalid: query.invalid,
            valid: function() { checkParams(query,offset); }
          });
        }
      } else if (param.required) {
        return query.invalid("No value for required parameter " + name);
      }
    }
    return query.valid();
  }

  var reprValidators = [];

  // TODO: Support subtyping (e.g. application/foo+xml <: application/xml <: application/*)
  // TODO: Better error reporting from representation validators
  function checkRepresentation(query) {
    if (query.body === undefined) {
      return query.valid();
    } else if (query.contentType === undefined) {
      return query.invalid("Missing content type.")
    } else {
      for (var i=0; i<query.representations.length; i++) {
        var representation = query.representations[i];
        if (representation.contentType === query.contentType) {
          for (var j=0; j<reprValidators.length; j++) {
            try { if (reprValidators[j].contentType(query.contentType)) {
              try { if (reprValidators[j].values(query.body,representation.type)) {
                return query.valid();
              } else {
                return query.invalid
                ("Representation is not of type " + query.contentType);
              } } catch (exn) {
                return query.invalid
                ("Representation is not of type " + query.contentType +
                 "\n" + exn);
              }
            } } catch (exn) {}
          }
          return query.invalid
          ("No validator found for content type " + query.contentType);
        }
      }
      return query.invalid
      ("Unrecognized content type " + query.contentType);
    }
  }

  var paramValidators = [];

  function checkParam(query) {
    for (var i=0; i<paramValidators.length; i++) {
      var validator = paramValidators[i];
      try { if (paramValidators[i].dataType(query.param.dataType)) {
        try { if (paramValidators[i].values(query.value)) {
          return query.valid();
        } else {
          return query.invalid
          (query.param.name + ': "' + 
           query.value + '" is not of type <' +
           query.param.dataType + '>');
        } } catch (exn) {
          return query.invalid
          (query.param.name + ': "' + 
           query.value + '" is not of type <' +
           query.param.dataType + '>\n' + 
           exn);
        }
      } } catch (exn) {}
    }
    return query.invalid
    ("No validator found for data type <" + query.param.dataType + ">");
  }

  function isMember(values) {
    switch (typeof values) {
    case "function": return values;
    case "string": return function(value) { return value === values; };
    case "boolean": return function(value) { return values; };
    case "object": 
      if (values instanceof Array) {
        return function(value) { return values.indexOf(value) !== -1; };
      } else {
        return function(value) { return values.test(value); }
      }
    }
  }

  function addValidator(validator) {
    if (validator.dataType && validator.values) {
      paramValidators.push({
        dataType: isMember(validator.dataType),
        values: isMember(validator.values)
      });
    } else if (validator.contentType && validator.values) {
      reprValidators.push({
        contentType: isMember(validator.contentType),
        values: isMember(validator.values)
      });
    }
  }

  // Validators for text/uri-list, application/json and application/xml

  addValidator({
    contentType: "text/uri-list",
    values: /^([#][^\r\n]*)?([a-zA-Z0-9-_.!~*'();?:@&=+$,#\/]|[%][a-fA-F0-9]{2}|[\r\n]([#][^\r\n]*)?)*$/
  });

  addValidator({
    contentType: /^application\/(\S[+])?json\b/,
    values: function(value) { jQuery.parseJSON(value); return true; }
  });

  addValidator({
    contentType: /^(application|text)\/(\S[+])?xml\b/,
    values: function(value) { jQuery.parseXML(value); return true; }
  });

  // Validators for built-in XML Schema datatypes

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#string",
    values: true
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#boolean",
    values: ["true","false","0","1"]
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#decimal",
    values: /^[+-]?\d+(\.\d+)?$/
  });

  addValidator({ 
    dataType: [
      "http://www.w3.org/2001/XMLSchema#float",
      "http://www.w3.org/2001/XMLSchema#double"
    ],
    values: /^[+-]?(\d+(\.\d+)?([eE]\d+)?|NaN|INF)$/
  });

  // TODO: value restrictions on dates/times
  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#duration",
    values: /^[-]?P(\d+Y)?(\d+M)?(\d+DT)?(\d+H)?(\d+M)?(\d+(\.\d+)?S)?$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#timeDate",
    values: /^[-]?\d{4,}\-\d\d\-\d\dT\d\d\:\d\d\:\d\d(\.\d+)?(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#time",
    values: /^\d\d\:\d\d\:\d\d(\.\d+)?(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#date",
    values: /^[-]?\d{4,}\-\d\d\-\d\d(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#gYearMonth",
    values: /^[-]?\d{4,}\-\d\d(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#gYear",
    values: /^[-]?\d{4,}(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#gMonthDay",
    values: /^\-\-\d\d\-\d\d(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#gMonth",
    values: /^\-\-\d\d(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#gDay",
    values: /^\-\-\-\d\d(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#hexBinary",
    values: /^[0-9a-fA-F]*$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#base64Binary",
    values: /^(([A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*)*(([A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*[A-Za-z0-9+\/])|([A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*[AEIMQUYcgkosw048]\s*[=])|([A-Za-z0-9+\/]\s*[AQgw]\s*[=]\s*[=])))?$/
  });

  // TODO: Validate URIs properly
  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#anyURI",
    values: /^([a-zA-Z0-9-_.!~*'();?:@&=+$,#\/]|[%][a-fA-F0-9]{2})+$/
  });

  // TODO: Unicode QNames
  addValidator({ 
    dataType: [
      "http://www.w3.org/2001/XMLSchema#QName",
      "http://www.w3.org/2001/XMLSchema#NOTATION"
    ],
    values: /^[a-zA-Z_][a-zA-Z0-9_.\-]*([:][a-zA-Z_][a-zA-Z0-9_.\-]*)?$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#normalizedString",
    values: /^[^\n\r\t]*$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#token",
    values: /^(\S+([ ]\S+)*)?$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#language",
    values: /^[a-zA-Z]{1,8}([-][a-zA-Z0-9]{1,8})*$/
  });

  // TODO: Unicode NMTOKENs
  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#NMTOKEN",
    values: /^[a-zA-Z0-9_.\-:]+$/
  });

  // TODO: Unicode NMTOKENS
  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#NMTOKENS",
    values: /^[a-zA-Z0-9_.\-:]+([ ]+[a-zA-Z0-9_.\-:]+)*$/
  });

  // TODO: Unicode Names
  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#Name",
    values: /^[a-zA-Z_:][a-zA-Z0-9_.\-:]*$/
  });

  // TODO: Unicode NCNames
  addValidator({ 
    dataType: [
      "http://www.w3.org/2001/XMLSchema#NCName",
      "http://www.w3.org/2001/XMLSchema#ID",
      "http://www.w3.org/2001/XMLSchema#IDREF",
      "http://www.w3.org/2001/XMLSchema#ENTITY"
    ],
    values: /^[a-zA-Z_][a-zA-Z0-9_.\-]*$/
  });

  // TODO: Unicode IDREFS
  addValidator({ 
    dataType: [
      "http://www.w3.org/2001/XMLSchema#IDREFS",
      "http://www.w3.org/2001/XMLSchema#ENTITIES"
    ],
    values: /^[a-zA-Z_][a-zA-Z0-9_.\-]*([ ]+[a-zA-Z_][a-zA-Z0-9_.\-]*)$/
  });

  // TODO: Range validation
  addValidator({ 
    dataType: [
      "http://www.w3.org/2001/XMLSchema#integer",
      "http://www.w3.org/2001/XMLSchema#long",
      "http://www.w3.org/2001/XMLSchema#int",
      "http://www.w3.org/2001/XMLSchema#short",
      "http://www.w3.org/2001/XMLSchema#byte"
    ],
    values: /^[+-]?\d+$/
  });

  // TODO: Range validation
  addValidator({ 
    dataType: [
      "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
      "http://www.w3.org/2001/XMLSchema#unsignedLong",
      "http://www.w3.org/2001/XMLSchema#unsignedInt",
      "http://www.w3.org/2001/XMLSchema#unsignedShort",
      "http://www.w3.org/2001/XMLSchema#unsignedByte"
    ],
    values: /^[+]?\d+$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#nonPositiveInteger",
    values: /^[-]\d+$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#positiveInteger",
    values: /^[+]?0*[1-9]\d*$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#negativeInteger",
    values: /^[-]0*[1-9]\d*$/
  });

  return {
    checkExample: function(query) { setTimeout(function() {
      checkExample(query);
    },0); },
    checkParam: function(query) { setTimeout(function() {
      checkParam(query);
    },0); }
  };

});