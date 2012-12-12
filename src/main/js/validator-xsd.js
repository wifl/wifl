require.config({
    shim: { "xmllint": { exports: "validateXML" } }
});

define(["validator","xmllint"],function(validator,validateXML) {

  // The DOM isn't available in web workers, so we use regexes
  // to approximate XML parsing

  function elementName(schema,id) {
    var regex1 = new RegExp('[<][^>]+\\bid\\s*=\\s*["]' + id + '["][^>]*[>]');
    var match1 = regex1.exec(schema);
    if (match1) {
      var regex2 = /\bname\s*=\s*["]([^"]+)["]/;
      var match2 = regex2.exec(match1[0]);
      if (match2) { return match2[1]; }
    }
  }

  function rootElement(xml) {
    var regex = /^([<][?].*[?][>]|[<][-][-].*[-][-][>]|\s)*[<](\w+[:])?(\w+)[ \r\n\t>]/;
    var match = regex.exec(xml);
    if (match) { return match[3]; }
  }

  return function(xml,uri) {
    var offset = uri.indexOf("#");
    var base = (offset<0? uri: uri.substring(0,offset));
    var fragment = (offset<0? undefined: uri.substring(offset+1));
    return validator.get(base).pipe(function(schema) {
      if (fragment) {
	// TODO: Handle namespacing properly
	// TODO: Allow complex types, not just elements
	var name = elementName(schema,fragment);
	if (name) {
	  var root = rootElement(xml);
	  if (name !== root) {
	    return validator.failure("Root element is " + root + " not " + name);
	  }
	} else {
	  return validator.failure("Failed to find " + fragment + " in " + base);
	}
      }
      var result = validateXML(xml,schema);
      if (/\bvalidates\s*$/.test(result)) {
	return validator.success();
      } else {
	return validator.failure("<" + result + ">");
      }
    });
  };

});