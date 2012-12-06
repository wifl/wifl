define(["jquery"],function(jQuery) {

  var success = jQuery.Deferred().resolve();
  var failure = jQuery.Deferred().reject("");

  function prepend() {
    var context = arguments;
    return function(error) {
      return Array.prototype.join.call(context,"") + error;
    };
  }

  function allMap(args,fun) {
    var count = 0;
    var promise;
    function yes() { if (!--count) { promise.resolve(); } }
    function no(error) { promise.reject(error); }
    for (var i=0; i<args.length; i++) {
      var arg = args[i];
      if (fun) { arg = fun(arg); }
      switch (arg.state()) {
        case "rejected":
  	  return arg;
	case "pending":
	  if (!count++) { promise = jQuery.Deferred(); }
	  arg.done(yes).fail(no);
      }
    }
    return (count? promise: success);
  }

  function all() { return allMap(arguments); }

  function checkExample(example,request) {
    return all(
      checkRequest(example.request,request).pipe(undefined,prepend("Request: ")),
      checkResponse(example.response,request.responses).pipe(undefined,prepend("Response: "))
    );
  }

  function checkRequest(message,request) {
    return all(
      checkParams(message.headers,request.headerParams),
      checkParams(request.uriTemplate.parse(message.uri),request.uriParams),
      checkRepr(message.body,message.headers["Content-Type"],request.representations)
    );
  }

  function checkResponse(message,responses) {
    for (var i=0; i<responses.length; i++) {
      var response = responses[i];
      if (response.statuses.indexOf(message.status) !== -1) {
	return all(
	  checkParams(message.headers,response.headerParams),
	  checkRepr(message.body,message.headers["Content-Type"],response.representations)
	);
      }
    }
    return failure.pipe(undefined,prepend("Unrecognized status code ", message.status));
  }

  function checkParams(values,params) {
    return allMap(params,function(param) {
      return checkValue(values[param.name],param).pipe(undefined,prepend(param.name,": "));
    });
  }

  var reprValidators = [];

  // TODO: Support subtyping (e.g. application/foo+xml <: application/xml <: application/*)
  function checkRepr(body,contentType,reprs) {
    if (body === undefined) {
      return success;
    } else if (contentType === undefined) {
      return failure.pipe(undefined,prepend("Missing content type."))
    } else {
      for (var i=0; i<reprs.length; i++) {
	var repr = reprs[i];
	if (repr.contentType === contentType) {
	  return allMap(reprValidators,function(validator) {
	    return validator.contentType(contentType).pipe(
              function() { return validator.values(body,repr.type); },
	      function() { return success; }
	    );
	  }).pipe(undefined,prepend("Reresentation is not of type ", contentType));
	}
      }
      return failure.pipe(undefined,prepend("Unrecongized content type ", contentType));
    }
  }

  var paramValidators = [];

  function checkValue(value,dataType) {
    return allMap(paramValidators,function(validator) {
      return validator.dataType(dataType).pipe(
        function() { return validator.values(value); },
        function() { return success; }
      );
    }).pipe(undefined,prepend(value," should be of type ",dataType));
  }

  function checkBool(bool) {
    return (bool? success: failure);
  }

  function constant(value) { 
    return function() { return value; };
  }

  function isMember(values) {
    switch (typeof values) {
    case "function": return function(value) {
      try { return values(value); }
      catch (exn) { return failure.pipe(undefined,prepend(exn)); }
    };
    case "string": return function(value) { return checkBool(value === values); };
    case "boolean": return constant(checkBool(values));
    case "object": 
      if (values instanceof Array) {
        return function(value) { return checkBool(values.indexOf(value) !== -1); };
      } else {
        return function(value) { return checkBool(values.test(value)); }
      }
    }
  }

  function addValidator(validator) {
    if (validator.dataType && validator.values) {
      paramValidators.unshift({
        dataType: isMember(validator.dataType),
        values: isMember(validator.values)
      });
    } else if (validator.contentType && validator.values) {
      reprValidators.unshift({
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
    values: function(value) { jQuery.parseJSON(value); return success; }
  });

  addValidator({
    contentType: /^(application|text)\/(\S[+])?xml\b/,
    values: function(value) { jQuery.parseXML(value); return success; }
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
    checkExample: checkExample,
    checkRequest: checkRequest,
    checkResponse: checkResponse,
    checkRepr: checkRepr,
    checkValue: checkValue,
    addValidator: addValidator
  };

});