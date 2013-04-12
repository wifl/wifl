define([], function() {

  function stringify(opts,uri,api,results) {
    var s = [header(uri,api)];
    results.forEach(function (result) {
      s.push(result.isOk() ? passed(result.example) :
             result.isFailed() ? failed(result.example, result.error) :
             result.isNotFound() ? notFound(result.example) : "")
    })
    s.push(footer(uri,api));
    return s.join('\n');
  }

  function header(uri,api) {
    return "<?xml version='1.0'?><examples " +
      attr("uri", uriEscape(uri)) +
      attr("resources", api.resources.length) +
      ">";
  }

  function footer(uri,api) { 
    return "</examples>";
  }

  function passed(example) {
    return "  <ok " +
      attr("about", uriEscape(example.about)) + 
      attr("method", example.request.method) + 
      attr("uri", uriEscape(example.request.uri)) + 
      "/>";
  }

  function failed(example, error) {
    return "  <failed " +
      attr("about", uriEscape(example.about)) + 
      attr("method", example.request.method) + 
      attr("uri", uriEscape(example.request.uri)) + 
      ">\n" +
      "    <![CDATA[" + error + "]]>\n" +
      "  </failed>";
  }

  function notFound(example) {
    return "  <not-found " + 
      attr("about", uriEscape(example.about)) + 
      attr("method", example.request.method) + 
      attr("uri", uriEscape(example.request.uri)) + 
      "/>";
  }

  function attr(name, value) {
    return name + "=\"" + value + "\" ";
  }

  function uriEscape(uri) {
    return uri.replace(/\&/g, "&amp;");
  }

  return {
    stringify: stringify
  }
});
