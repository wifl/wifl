define(["validator","json-schema-validate"],function(validator,jsv) {

  var unresolved = {};
  var resolved = {};

  function resolveURI(uri) {
    if (resolved[uri]) { return resolved[uri]; }
    var offset = uri.indexOf("#");
    var base = (offset<0? uri: uri.substring(0,offset));
    if (!unresolved[base]) {
      unresolved[base] = validator.get(base).done(function(text) {
        var json = JSON.parse(text);
        resolved[base] = resolveJSON(base,base+"#",json);
      });
    }
    if (resolved[uri]) { return resolved[uri]; }
    var marker = unresolved[base].pipe(function() { 
      if (resolved[uri] === marker) {
        return validator.failure("Failed to resolve " + uri);
      } else {
        return resolved[uri];
      }
    });
    return resolved[uri] = marker;
  }

  // TODO: Resolve relative URIs properly
  function resolveJSON(base,uri,json) {
    if (typeof json !== "object") { 
      return resolved[uri] = validator.success(json); 
    } else if (json["$ref"] !== undefined) { 
      var target = json["$ref"];
      if (target.charAt(0) === "#") { target = base + target; }
      return resolved[uri] = resolveURI(target);
    } else {
      var keys = Object.keys(json);
      var result = {};
      return resolved[uri] = validator.allMap(keys,function(key) {
        return resolveJSON(base,uri+"/"+key,json[key]).done(function(value) {
          result[key] = value;
        });
      }).pipe(function () { return result; });
    }
  }

  function errMessage(error) {
    return error.property + ": " + error.message;
  }

  return function(value,type) {
    var json = JSON.parse(value);
    if (!type) { return validator.success(); }
    return resolveURI(type).pipe(function(schema) {
      if (!schema) { return validator.failure("Failed to resolve schema for type " + type); }
      var report = jsv.validate(json,schema);
      if (report.valid) {
	return validator.success();
      } else {
	return validator.failure(report.errors.map(errMessage).join("\n"));
      } 
    });
  }

});