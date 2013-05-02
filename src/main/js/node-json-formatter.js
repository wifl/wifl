define(function() {

  function stringify(opts,uri,api,results) {
    return JSON.stringify(
      objectify(opts,uri,api,results), 
      null, 
      opts["--indent"]);
  }

  function objectify(opts,uri,api,results) {
    return {
      uri: stringEscape(uri),
      resources: api.resources.length,
      examples: (function() {
        var o = {};
        results.forEach(function (result) {
          o[result.example.about] = 
            result.isOk() ?  passed(result) :
            result.isFailed() ? failed(result) :
            result.isNotFound() ? notFound(result) :
            unsupported(result) 
        });
        return o;
      })()
    }
  }

  function passed(result) {
    return {
      status: result.status,
      method: result.example.request.method,
      uri: stringEscape(result.example.request.uri)
    }
  }

  function failed(result) {
    result.error.message = stringEscape(result.error.message);
    return {
      status: result.status,
      error: buildError(result.error),
      method: result.example.request.method,
      uri: stringEscape(result.example.request.uri)
    }
  }

  function notFound(result) {
    return {
      status: result.status,
      method: result.example.request.method,
      uri: stringEscape(result.example.request.uri)
    }
  }

  function buildError(error) {
    return {
      "location": error.subject ? error.subject.about : error.subject,
      "property": error.property,
      "message" : error.message,
      "error"   : error.value && error.value.message ? buildError(error.value) : error.value
   }
  }

  function unsupported(result) {
    throw "Unsupported result: "+JSON.stringify(result);
  }

  function stringEscape(s) {
    return s.replace(/"/g,'\\"').replace(/\\/g,"\\\\");
  }

  return {
    stringify: stringify
  }
});
