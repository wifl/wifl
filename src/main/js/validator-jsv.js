define(["jquery","validator","json-schema-validate"],function(jQuery,validator,jsv) {

  var resolved = {};

  function resolveJSON(obj,keys,offset) {
    if (typeof obj !== "object") { return obj; }
    if (obj["$ref"] !== undefined) { return resolveURI(obj["$ref"]); }
    keys = keys || Object.keys(obj);
    offset = offset || 0;
    while (offset < keys.length) {
      var key = keys[offset++];
      var value = resolveJSON(obj[key]);
      if (isPromise(value)) {
	return value.pipe(function(evaluated) {
	  obj[key] = evaluated;
	  return resolveJSON(obj,keys,offset);
	});
      } else {
	obj[key] = value;
      }
    }
    return obj;
  }

  function resolveURI(uri) {
    var offset = uri.indexOf("#");
    var base = uri;
    var fragment;
    if (0 <= offset) {
      base = uri.substring(0,offset);
      fragment = uri.substring(offset+1);
    }
    var promise = resolved[base];
    if (!promise) {
      function failed(error) {
        return "Getting JSON from " + base + " failed: " + error.statusText;
      }
      promise = resolved[base] = jQuery.getJSON(base).pipe(resolveJSON,failed);
    }
    if (fragment) {
      return promise.pipe(jsonPointer(fragment));
    } else {
      return promise;
    }
  }

  function jsonPointer(path) {
    var names = path.split("/").filter(id).map(unescape);
    return function(json) {
      for (var i=0; i<names.length && json!==undefined; i++) {
	json = json[names[i]];
      }
      return json;
    };
  }

  function checkJSON(value,type) {
    var json = jQuery.parseJSON(value);
    if (!type) { return true; }
    var result = jQuery.Deferred();
    resolveURI(type).done(function(schema) {
      var report = jsv.validate(json,schema);
      if (report.valid) {
	result.resolve();
      } else {
	result.reject(report.errors.map(errMessage).join("\n"));
      }
    }).fail(function(error) {
      result.reject(error);
    });
    return result;
  }

  function isPromise(obj) {
    return (typeof obj.done === "function");
  }

  function unescape(name) {
    return name.replace(/~1/,"/").replace(/~0/,"~");
  }

  function id(x) {
    return x;
  }

  function errMessage(error) {
    return error.property + ": " + error.message;
  }

  validator.addValidator({
    contentType: /^application\/(\S[+])?json\b/,
    values: checkJSON
  });

  return validator;

});