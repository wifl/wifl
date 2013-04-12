define(function() {

  function stringify(opts,uri,api,results) {
    var s = [header(uri,api)];
    results.forEach(function (result) {
      s.push(result.isOk() ? passed(result.example) :
             result.isFailed() ? failed(result.example, result.error) :
             result.isNotFound() ? notFound(result.example) : 
             "")
    })
    return s.join('\n');
  }

  function header(uri,api) {
    return "Found " + api.resources.length + " resources and " + api.examples.length + " examples at " + uri;
  }

  function passed(example) {
    return "OK. " + example.request.method + " " + example.request.uri;
  }

  function failed(example, error) {
    return "Failed. " + example.request.method + " " + example.request.uri +
      "\n  " + error;
  }

  function notFound(example) {
    return "Not Found. " + example.request.method + " " + example.request.uri; 
  }

  return {
    stringify: stringify
  }
});
