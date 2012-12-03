define(function() {

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
        valid: function() { 
          if (query.message.body === undefined) {
            query.valid();
          } else { return checkRepresentation({
            body: query.message.body,
            contentType: query.message.headers["Content-Type"],
            representations: query.request.representations,
            invalid: query.invalid,
            valid: query.valid
          }); }
        }
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
          valid: function() { 
            if (query.message.body === undefined) {
              query.valid();
            } else { return checkRepresentation({
              body: query.message.body,
              contentType: query.message.headers["Content-Type"],
              representations: response.representations,
              invalid: query.invalid,
              valid: query.valid
            }); }
          }
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

  function checkRepresentation(query) {
    return query.valid();
  }

  function checkParam(query) {
    for (var i=0; i<paramValidators.length; i++) {
      if (query.param.dataType == paramValidators[i].dataType) {
        if (!paramValidators[i].regex.test(query.value)) {
          return query.invalid
          (query.param.name + ': "' + 
           query.value + '" is not of type <' +
           query.param.dataType + '>');
        }
      }
    }
    return query.valid();
  }

  var paramValidators = [];

  function addValidator(validator) {
    if (validator.dataType && validator.regex) {
      paramValidators.push(validator);
    }
  }

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#integer",
    regex: /^[+-]?\d+$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
    regex: /^[+]?\d+$/
  });

  addValidator({ 
    dataType: "http://www.w3.org/2001/XMLSchema#positiveInteger",
    regex: /^[+]?0*[1-9]\d*$/
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