define(["qunit","wifl"],function(qunit,wifl) {

  function resolve(uri) {
    var node = document.createElement("a");
    node.href = uri;
    return node.href;
  }

  function mkObject(array) {
    var result = {};
    array.forEach(function (thing) {
      var fragment = thing.toString().replace(/^[^#]*/,"");
      result[fragment] = thing;
    });
    return result;
  }

  function under(path,request) {
    var result =jQuery.extend({},request);
    result.path = path + request.path;
    if (arguments.length > 2) {
      var pathParams = Array.prototype.slice.call(arguments,2);
      result.pathParams = request.pathParams.concat(pathParams);
      result.uriParams = result.pathParams.concat(result.queryParams);
    }
    return result;
  }

  function compare(actual,expected,prefix) {
    prefix = prefix || "";
    if (jQuery.isArray(actual) && jQuery.isArray(expected)) {
      equal(actual.length,expected.length,prefix+"length.");
      var len = Math.min(actual.length,expected.length);
      for (var i=0; i<len; i++) {
        compare(actual[i],expected[i],prefix+"["+i+"].");
      }
    } else if (jQuery.isPlainObject(actual) && jQuery.isPlainObject(expected)) {
      for (var key in expected) {
        compare(actual[key],expected[key],prefix+key+".");
      }
    } else {
      equal(actual,expected,prefix);
    }
  }

  var apikey = {
    "default": undefined,
    "descriptions": [],
    "fixed": undefined,
    "name": "apikey",
    "required": undefined,
    "type": "http://www.w3.org/2001/XMLSchema#hexBinary"
  };

  var dogID = {
    "default": undefined,
    "descriptions": [],
    "fixed": undefined,
    "name": "dogID",
    "required": undefined,
    "type": "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"
  };

  var json = {
    "contentType": "application/json",
    "descriptions": [],
    "type": resolve("test-schema.json")
  };

  var ok = {
    "descriptions": [],
    "headerParams": [],
    "representations": [ json ],
    "statuses": [ "200" ]
  };

  var get = {
    "descriptions": [],
    "headerParams": [],
    "method": "GET",
    "myHeaderParams": [],
    "myPathParams": [],
    "myQueryParams": [],
    "myResponses": [ ok ],
    "path": "",
    "pathParams": [],
    "queryParams": [ apikey ],
    "representations": [],
    "responses": [ ok ],
    "uriParams": [ apikey ]
    };

  var sooper = {
    "descriptions": [],
    "headerParams": [],
    "myHeaderParams": [],
    "myPath": undefined,
    "myPathParams": [],
    "myQueryParams": [ apikey ],
    "myRequests": [ get ],
    "myResponses": [],
    "parent": undefined,
    "path": "",
    "pathParams": [],
    "queryParams": [ apikey ],
    "requests": [ get ],
    "responses": [],
    "supers": [],
    "uriParams": [ apikey ]
  };

  var root = {
    "descriptions": [],
    "headerParams": [],
    "myHeaderParams": [],
    "myPath": "http://api.example.com/bogus",
    "myPathParams": [],
    "myQueryParams": [],
    "myRequests": [],
    "myResponses": [],
    "parent": undefined,
    "path": "http://api.example.com/bogus",
    "pathParams": [],
    "queryParams": [ apikey ],
    "requests": [ under("http://api.example.com/bogus",get) ],
    "responses": [],
    "supers": [ sooper ],
    "uriParams": [ apikey ]
  };

  var dogs = {
    "descriptions": [],
    "headerParams": [],
    "myHeaderParams": [],
    "myPath": "/dogs",
    "myPathParams": [],
    "myQueryParams": [],
    "myRequests": [],
    "myResponses": [],
    "parent": root,
    "path": "http://api.example.com/bogus/dogs",
    "pathParams": [],
    "queryParams": [ apikey ],
    "requests": [ under("http://api.example.com/bogus/dogs",get) ],
    "responses": [],
    "supers": [ sooper ],
    "uriParams": [ apikey ]
  };

  var dog = {
    "descriptions": [],
    "headerParams": [],
    "myHeaderParams": [],
    "myPath": "/{dogID}",
    "myPathParams": [ dogID ],
    "myQueryParams": [],
    "myRequests": [],
    "myResponses": [],
    "parent": dogs,
    "path": "http://api.example.com/bogus/dogs/{dogID}",
    "pathParams": [ dogID ],
    "queryParams": [ apikey ],
    "requests": [ under("http://api.example.com/bogus/dogs/{dogID}",get,dogID) ],
    "responses": [],
    "supers": [ sooper ],
    "uriParams": [ dogID, apikey ]
  };

  wifl.build(document).wait(function(api) {
    var resources = mkObject(api.resources);
    var examples = mkObject(api.examples);
    test("resources",function() { equal(api.resources.length,4); });
    test("examples",function() { equal(api.examples.length,0); });
    test("super",function() { compare(resources["#Super"],sooper); });
    test("root",function() { compare(resources["#Root"],root); });
    test("dogs",function() { compare(resources["#Dogs"],dogs); });
    test("dog",function() { compare(resources["#Dog"],dog); });
  });

});
