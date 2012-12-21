define(["qunit","wifl"],function(qunit,wifl) {

  function resolve(uri) {
    var node = document.createElement("a");
    node.href = uri;
    return node.href;
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
    prefix = prefix || "this";
    if (jQuery.isArray(expected)) {
      if (jQuery.isArray(actual)) {
        equal(actual.length,expected.length,prefix+".length");
        var len = Math.min(actual.length,expected.length);
        for (var i=0; i<len; i++) {
          compare(actual[i],expected[i],prefix+"["+i+"]");
        }
      } else {
        equal(typeof actual,"array","type of " + prefix);
      }
    } else if (typeof expected === "object") {
      if (typeof actual === "object") {
        for (var key in expected) {
          compare(actual[key],expected[key],prefix+"."+key);
        }
      } else {
        equal(typeof actual,"object","type of " + prefix);
      }
    } else if (typeof actual === "object" || typeof actual === "function") {
      equal(typeof actual,typeof expected,"type of " + prefix);
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

  var foo = {
    "default": "abc",
    "descriptions": [ "remarkably pointless" ],
    "fixed": undefined,
    "name": "foo",
    "required": true,
    "type": undefined
  };

  var location = {
    "default": undefined,
    "descriptions": [],
    "fixed": undefined,
    "name": "Location",
    "required": true,
    "type": "http://www.w3.org/2001/XMLSchema#anyURI"
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
    "statuses": [ 200 ]
  };

  var created = {
    "descriptions": [],
    "headerParams": [ location ],
    "representations": [ json ],
    "statuses": [ 201 ]
  };

  var noContent = {
    "descriptions": [],
    "headerParams": [],
    "representations": [],
    "statuses": [ 204 ]
  };

  var get = {
    "descriptions": [],
    "headerParams": [],
    "method": "GET",
    "myHeaderParams": [],
    "myPathParams": [],
    "myQueryParams": [ foo ],
    "myResponses": [ ok ],
    "path": "",
    "pathParams": [],
    "queryParams": [ foo, apikey ],
    "representations": [],
    "responses": [ ok ],
    "uriParams": [ foo, apikey ]
    };

  var put = {
    "descriptions": [],
    "headerParams": [],
    "method": "PUT",
    "myHeaderParams": [],
    "myPathParams": [],
    "myQueryParams": [],
    "myResponses": [ ok ],
    "path": "",
    "pathParams": [],
    "queryParams": [ apikey ],
    "representations": [ json ],
    "responses": [ ok ],
    "uriParams": [ apikey ]
    };

  var post = {
    "descriptions": [],
    "headerParams": [],
    "method": "POST",
    "myHeaderParams": [],
    "myPathParams": [],
    "myQueryParams": [],
    "myResponses": [ created ],
    "path": "",
    "pathParams": [],
    "queryParams": [ apikey ],
    "representations": [ json ],
    "responses": [ created ],
    "uriParams": [ apikey ]
    };

  var deleet = {
    "descriptions": [],
    "headerParams": [],
    "method": "DELETE",
    "myHeaderParams": [],
    "myPathParams": [],
    "myQueryParams": [],
    "myResponses": [ noContent ],
    "path": "",
    "pathParams": [],
    "queryParams": [ apikey ],
    "representations": [],
    "responses": [ noContent ],
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
    "myRequests": [ under("http://api.example.com/bogus/dogs",post) ],
    "myResponses": [],
    "parent": root,
    "path": "http://api.example.com/bogus/dogs",
    "pathParams": [],
    "queryParams": [ apikey ],
    "requests": [ 
      under("http://api.example.com/bogus/dogs",post),
      under("http://api.example.com/bogus/dogs",get)
    ],
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
    "myRequests": [
      under("http://api.example.com/bogus/dogs/{dogID}",put,dogID),
      under("http://api.example.com/bogus/dogs/{dogID}",deleet,dogID)
    ],
    "myResponses": [],
    "parent": dogs,
    "path": "http://api.example.com/bogus/dogs/{dogID}",
    "pathParams": [ dogID ],
    "queryParams": [ apikey ],
    "requests": [ 
      under("http://api.example.com/bogus/dogs/{dogID}",put,dogID),
      under("http://api.example.com/bogus/dogs/{dogID}",deleet,dogID),
      under("http://api.example.com/bogus/dogs/{dogID}",get,dogID)
    ],
    "responses": [],
    "supers": [ sooper ],
    "uriParams": [ dogID, apikey ]
  };

  wifl.build(document).wait(function(api) {
    test("resources",function() {
      compare(api.resources,[sooper,dogs,dog,root]);
    });
    test("examples",function() {
      compare(api.examples,[]);
    });
    test("lookup",function() {
      compare(api.lookup("GET","http://api.example.com/bogus"),root.requests[0]);
      compare(api.lookup("POST","http://api.example.com/bogus/dogs"),dogs.requests[0]);
      compare(api.lookup("GET","http://api.example.com/bogus/dogs"),dogs.requests[1]);
      compare(api.lookup("PUT","http://api.example.com/bogus/dogs/123"),dog.requests[0]);
      compare(api.lookup("DELETE","http://api.example.com/bogus/dogs/123"),dog.requests[1]);
      compare(api.lookup("GET","http://api.example.com/bogus/dogs/123"),dog.requests[2]);
    });
    test("uri template expansion",function() {
      equal(api.resources[1].uriTemplate.expand({}),"http://api.example.com/bogus/dogs");
      equal(api.resources[2].uriTemplate.expand({}),"http://api.example.com/bogus/dogs/");
      equal(api.resources[2].uriTemplate.expand({ dogID: 3 }),"http://api.example.com/bogus/dogs/3");
      equal(api.resources[2].uriTemplate.expand({ dogID: "abc" }),"http://api.example.com/bogus/dogs/abc");
      equal(api.resources[2].uriTemplate.expand({ dogID: "a b" }),"http://api.example.com/bogus/dogs/a%20b");
      equal(api.resources[2].uriTemplate.expand({ dogID: "a/b" }),"http://api.example.com/bogus/dogs/a%2Fb");
      equal(api.resources[3].uriTemplate.expand({}),"http://api.example.com/bogus");
    });
    test("uri template parsing",function() {
      deepEqual(api.resources[1].uriTemplate.parse("http://api.example.com/bogus/dogs"),{});
      deepEqual(api.resources[2].uriTemplate.parse("http://api.example.com/bogus/dogs/"),{});
      deepEqual(api.resources[2].uriTemplate.parse("http://api.example.com/bogus/dogs/3"),{ dogID: ["3"] });
      deepEqual(api.resources[2].uriTemplate.parse("http://api.example.com/bogus/dogs/abc"),{ dogID: ["abc"] });
      deepEqual(api.resources[2].uriTemplate.parse("http://api.example.com/bogus/dogs/a%20b"),{ dogID: ["a b"] });
      deepEqual(api.resources[2].uriTemplate.parse("http://api.example.com/bogus/dogs/a%2Fb"),{ dogID: ["a/b"] });
      deepEqual(api.resources[3].uriTemplate.parse("http://api.example.com/bogus"),{});
      equal(api.resources[1].uriTemplate.parse("http://api.example.com/boogus/dogs"),undefined);
      equal(api.resources[2].uriTemplate.parse("http://api.example.com/boogus/dogs/"),undefined);
      equal(api.resources[2].uriTemplate.parse("http://api.example.com/boogus/dogs/3"),undefined);
      equal(api.resources[3].uriTemplate.parse("http://api.example.com/boogus"),undefined);
      equal(api.resources[1].uriTemplate.parse("http://api.example.com/bogus/dogs/abc"),undefined);
      equal(api.resources[3].uriTemplate.parse("http://api.example.com/bogus/dogs/abc"),undefined);
      equal(api.resources[1].uriTemplate.parse("http://api.example.com/bogus"),undefined);
      equal(api.resources[2].uriTemplate.parse("http://api.example.com/bogus"),undefined);
    });
  });

});
