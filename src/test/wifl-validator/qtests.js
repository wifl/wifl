define(["qunit","uri-template2","validator"],function(qunit,urit,validator) {

  function resolve(uri) {
    var node = document.createElement("a");
    node.href = uri;
    return node.href;
  }

  function under(path,request) {
    var result =jQuery.extend({},request);
    var template = path + request.path;
    result.path = template;
    if (request.queryParams.length) {
      function name(param) { return param.name; }
      var names = request.queryParams.map(name).sort();
      template = template + "{?" + names.join(",") + "}";
    }
    result.uriTemplate = urit.parse(template);
    if (arguments.length > 2) {
      var pathParams = Array.prototype.slice.call(arguments,2);
      result.pathParams = request.pathParams.concat(pathParams);
      result.uriParams = result.pathParams.concat(result.queryParams);
    }
    return result;
  }

  var apikey = {
    "default": undefined,
    "descriptions": [],
    "fixed": undefined,
    "name": "apikey",
    "required": true,
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
    "required": undefined,
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

  var anything = {
    "contentType": "application/*",
    "descriptions": [],
    "type": undefined
  };

  var json = {
    "contentType": "application/json",
    "descriptions": [],
    "type": resolve("test-schema.json#/dog")
  };

  var xml = {
    "contentType": "application/xml",
    "descriptions": [],
    "type": resolve("test-schema.xsd#dog")
  };

  var okay = {
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
    "myResponses": [ okay ],
    "path": "",
    "pathParams": [],
    "queryParams": [ foo, apikey ],
    "representations": [],
    "responses": [ okay ],
    "uriParams": [ foo, apikey ]
    };

  var put = {
    "descriptions": [],
    "headerParams": [],
    "method": "PUT",
    "myHeaderParams": [],
    "myPathParams": [],
    "myQueryParams": [],
    "myResponses": [ okay ],
    "path": "",
    "pathParams": [],
    "queryParams": [ apikey ],
    "representations": [ json ],
    "responses": [ okay ],
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

  var getEx = {
    "descriptions": [],
    "request": {
      "descriptions": [],
      "method": "GET",
      "path": "/bogus/dogs/3?apikey=abc123",
      "uri": "http://api.example.com/bogus/dogs/3?apikey=abc123",
      "headers": {
        "Accept": "application/json",
        "Host": "api.example.com"
      },
      "body": undefined
    },
    "response": {
      "descriptions": [],
      "status": 200,
      "headers": {
        "Content-Type": "application/json"
      },
      "body": "{ \"name\": \"Rover\" }"
    }
  };

  var postEx = {
    "descriptions": [],
    "request": {
      "descriptions": [],
      "method": "POST",
      "path": "/bogus/dogs?apikey=abc123",
      "uri": "http://api.example.com/bogus/dogs?apikey=abc123",
      "headers": {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Host": "api.example.com"
      },
      "body": "{ \"name\": \"Fido\" }"
    },
    "response": {
      "descriptions": [],
      "status": 201,
      "headers": {
        "Content-Type": "application/json",
        "Location": "http://api.example.com/bogus/dogs/52"
      },
      "body": "{ \"name\": \"Fido\" }"
    }
  };

  function succeeds(later) {
    stop();
    later.done(function() {
      ok(true); start();
    }).fail(function(err) {
      ok(false,err); start();
    });
  }

  function fails(later) {
    stop();
    later.done(function() {
      ok(false,"Expected failure"); start();
    }).fail(function(err) {
      ok(true); start();
    });
  }

  test("String",function() {
    succeeds(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#string"));
    succeeds(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#string"));
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#string"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#string"));
    succeeds(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#string"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#string"));
    succeeds(validator.checkValue("","http://www.w3.org/2001/XMLSchema#string"));
    succeeds(validator.checkValue("abcXYZ","http://www.w3.org/2001/XMLSchema#string"));
    succeeds(validator.checkValue("\u0000\u1234","http://www.w3.org/2001/XMLSchema#string"));
  });

  test("Bool",function() {
    succeeds(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#boolean"));
    succeeds(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#boolean"));
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#boolean"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#boolean"));
    fails(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#boolean"));
    fails(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#boolean"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#boolean"));
    fails(validator.checkValue("TRUE","http://www.w3.org/2001/XMLSchema#boolean"));
    fails(validator.checkValue("FALSE","http://www.w3.org/2001/XMLSchema#boolean"));
  });

  test("Decimal",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#decimal"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#decimal"));
    succeeds(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#decimal"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#decimal"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#decimal"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#decimal"));
    succeeds(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#decimal"));
    succeeds(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#decimal"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#decimal"));
  });

  test("Float",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#float"));
    succeeds(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#float"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#float"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#float"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#float"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#float"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#float"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#float"));
  });

  test("Duration",function() {
    succeeds(validator.checkValue("P1234Y01M01DT01H01M01S","http://www.w3.org/2001/XMLSchema#duration"));
    succeeds(validator.checkValue("-P1234Y01M01DT01H01M01S","http://www.w3.org/2001/XMLSchema#duration"));
    succeeds(validator.checkValue("P1234Y01M01DT01H01M01.23S","http://www.w3.org/2001/XMLSchema#duration"));
    succeeds(validator.checkValue("P1Y1M1DT1H1M1S","http://www.w3.org/2001/XMLSchema#duration"));
    succeeds(validator.checkValue("P9876Y98M98DT98H98M98S","http://www.w3.org/2001/XMLSchema#duration"));
    succeeds(validator.checkValue("P1234Y01M01DT01H01M","http://www.w3.org/2001/XMLSchema#duration"));
    succeeds(validator.checkValue("P1234Y01M01DT01H01S","http://www.w3.org/2001/XMLSchema#duration"));
    succeeds(validator.checkValue("P1234Y01M01DT01M01S","http://www.w3.org/2001/XMLSchema#duration"));
    succeeds(validator.checkValue("P1234Y01MT01H01M01S","http://www.w3.org/2001/XMLSchema#duration"));
    succeeds(validator.checkValue("P1234Y01DT01H01M01S","http://www.w3.org/2001/XMLSchema#duration"));
    succeeds(validator.checkValue("P01M01DT01H01M01S","http://www.w3.org/2001/XMLSchema#duration"));
    fails(validator.checkValue("P1234Y01M01DT01H01MS","http://www.w3.org/2001/XMLSchema#duration"));
    fails(validator.checkValue("P1234Y01M01DT01HM01S","http://www.w3.org/2001/XMLSchema#duration"));
    fails(validator.checkValue("P1234Y01M01DTH01M01S","http://www.w3.org/2001/XMLSchema#duration"));
    fails(validator.checkValue("P1234Y01MDT01H01M01S","http://www.w3.org/2001/XMLSchema#duration"));
    fails(validator.checkValue("P1234YM01DT01H01M01S","http://www.w3.org/2001/XMLSchema#duration"));
    fails(validator.checkValue("PY01M01DT01H01M01S","http://www.w3.org/2001/XMLSchema#duration"));
    fails(validator.checkValue("p1234y01m01dt01h01m01s","http://www.w3.org/2001/XMLSchema#duration"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#duration"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#duration"));
  });

  test("DateTime",function() {
    succeeds(validator.checkValue("1234-12-12T12:12:12","http://www.w3.org/2001/XMLSchema#dateTime"));
    succeeds(validator.checkValue("1234-12-12T12:12:12.345","http://www.w3.org/2001/XMLSchema#dateTime"));
    succeeds(validator.checkValue("1234-12-12T12:12:12Z","http://www.w3.org/2001/XMLSchema#dateTime"));
    succeeds(validator.checkValue("1234-12-12T12:12:12.345Z","http://www.w3.org/2001/XMLSchema#dateTime"));
    succeeds(validator.checkValue("1234-12-12T12:12:12+12:00","http://www.w3.org/2001/XMLSchema#dateTime"));
    succeeds(validator.checkValue("1234-12-12T12:12:12.345+12:00","http://www.w3.org/2001/XMLSchema#dateTime"));
    succeeds(validator.checkValue("1234-12-12T12:12:12-12:00","http://www.w3.org/2001/XMLSchema#dateTime"));
    succeeds(validator.checkValue("1234-12-12T12:12:12.345-12:00","http://www.w3.org/2001/XMLSchema#dateTime"));
    fails(validator.checkValue("1-12-12T12:12:12.345","http://www.w3.org/2001/XMLSchema#dateTime"));
    fails(validator.checkValue("1234-1-12T12:12:12.345","http://www.w3.org/2001/XMLSchema#dateTime"));
    fails(validator.checkValue("1234-12-1T12:12:12.345","http://www.w3.org/2001/XMLSchema#dateTime"));
    fails(validator.checkValue("1234-12-12T1:12:12.345","http://www.w3.org/2001/XMLSchema#dateTime"));
    fails(validator.checkValue("1234-12-12T12:1:12.345","http://www.w3.org/2001/XMLSchema#dateTime"));
    fails(validator.checkValue("1234-12-12T12:12:1.345","http://www.w3.org/2001/XMLSchema#dateTime"));
    fails(validator.checkValue("1234-12-12T12:12:12.","http://www.w3.org/2001/XMLSchema#dateTime"));
  });

  test("Time",function() {
    succeeds(validator.checkValue("12:12:12","http://www.w3.org/2001/XMLSchema#time"));
    succeeds(validator.checkValue("12:12:12.345","http://www.w3.org/2001/XMLSchema#time"));
    succeeds(validator.checkValue("12:12:12Z","http://www.w3.org/2001/XMLSchema#time"));
    succeeds(validator.checkValue("12:12:12.345Z","http://www.w3.org/2001/XMLSchema#time"));
    succeeds(validator.checkValue("12:12:12+12:00","http://www.w3.org/2001/XMLSchema#time"));
    succeeds(validator.checkValue("12:12:12.345+12:00","http://www.w3.org/2001/XMLSchema#time"));
    succeeds(validator.checkValue("12:12:12-12:00","http://www.w3.org/2001/XMLSchema#time"));
    succeeds(validator.checkValue("12:12:12.345-12:00","http://www.w3.org/2001/XMLSchema#time"));
    fails(validator.checkValue("1234-12-12T12:12:12","http://www.w3.org/2001/XMLSchema#time"));
    fails(validator.checkValue("T12:12:12","http://www.w3.org/2001/XMLSchema#time"));
    fails(validator.checkValue("1:12:12.345","http://www.w3.org/2001/XMLSchema#time"));
    fails(validator.checkValue("12:1:12.345","http://www.w3.org/2001/XMLSchema#time"));
    fails(validator.checkValue("12:12:1.345","http://www.w3.org/2001/XMLSchema#time"));
    fails(validator.checkValue("12:12:12.","http://www.w3.org/2001/XMLSchema#time"));
  });

  test("Date",function() {
    succeeds(validator.checkValue("1234-12-12","http://www.w3.org/2001/XMLSchema#date"));
    succeeds(validator.checkValue("1234-12-12Z","http://www.w3.org/2001/XMLSchema#date"));
    succeeds(validator.checkValue("1234-12-12+12:00","http://www.w3.org/2001/XMLSchema#date"));
    succeeds(validator.checkValue("1234-12-12-12:00","http://www.w3.org/2001/XMLSchema#date"));
    fails(validator.checkValue("1-12-12","http://www.w3.org/2001/XMLSchema#date"));
    fails(validator.checkValue("1234-1-12","http://www.w3.org/2001/XMLSchema#date"));
    fails(validator.checkValue("1234-12-1","http://www.w3.org/2001/XMLSchema#date"));
    fails(validator.checkValue("1234-12-12+1:00","http://www.w3.org/2001/XMLSchema#date"));
    fails(validator.checkValue("1234-12-12+12:0","http://www.w3.org/2001/XMLSchema#date"));
    fails(validator.checkValue("1234-12-12T12:12:12","http://www.w3.org/2001/XMLSchema#date"));
  });

  test("GYearMonth",function() {
    succeeds(validator.checkValue("1234-12","http://www.w3.org/2001/XMLSchema#gYearMonth"));
    succeeds(validator.checkValue("1234-12Z","http://www.w3.org/2001/XMLSchema#gYearMonth"));
    succeeds(validator.checkValue("1234-12+12:00","http://www.w3.org/2001/XMLSchema#gYearMonth"));
    succeeds(validator.checkValue("1234-12-12:00","http://www.w3.org/2001/XMLSchema#gYearMonth"));
    fails(validator.checkValue("1234-1","http://www.w3.org/2001/XMLSchema#gYearMonth"));
    fails(validator.checkValue("1234-12+1:00","http://www.w3.org/2001/XMLSchema#gYearMonth"));
    fails(validator.checkValue("1234-12+12:0","http://www.w3.org/2001/XMLSchema#gYearMonth"));
    fails(validator.checkValue("1234-12T12:12:12","http://www.w3.org/2001/XMLSchema#gYearMonth"));
  });

  test("GYear",function() {
    succeeds(validator.checkValue("1234","http://www.w3.org/2001/XMLSchema#gYear"));
    succeeds(validator.checkValue("-1234","http://www.w3.org/2001/XMLSchema#gYear"));
    succeeds(validator.checkValue("1234Z","http://www.w3.org/2001/XMLSchema#gYear"));
    succeeds(validator.checkValue("1234+12:00","http://www.w3.org/2001/XMLSchema#gYear"));
    succeeds(validator.checkValue("1234-12:00","http://www.w3.org/2001/XMLSchema#gYear"));
    fails(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#gYear"));
    fails(validator.checkValue("1234-1","http://www.w3.org/2001/XMLSchema#gYear"));
    fails(validator.checkValue("1234+1:00","http://www.w3.org/2001/XMLSchema#gYear"));
    fails(validator.checkValue("1234+12:0","http://www.w3.org/2001/XMLSchema#gYear"));
    fails(validator.checkValue("1234T12:12:12","http://www.w3.org/2001/XMLSchema#gYear"));
  });

  test("GMonthDay",function() {
    succeeds(validator.checkValue("--12-12","http://www.w3.org/2001/XMLSchema#gMonthDay"));
    succeeds(validator.checkValue("--12-12Z","http://www.w3.org/2001/XMLSchema#gMonthDay"));
    succeeds(validator.checkValue("--12-12+12:00","http://www.w3.org/2001/XMLSchema#gMonthDay"));
    succeeds(validator.checkValue("--12-12-12:00","http://www.w3.org/2001/XMLSchema#gMonthDay"));
    fails(validator.checkValue("12-12","http://www.w3.org/2001/XMLSchema#gMonthDay"));
    fails(validator.checkValue("-12-12","http://www.w3.org/2001/XMLSchema#gMonthDay"));
    fails(validator.checkValue("--1-12","http://www.w3.org/2001/XMLSchema#gMonthDay"));
    fails(validator.checkValue("--12-1","http://www.w3.org/2001/XMLSchema#gMonthDay"));
    fails(validator.checkValue("--12-12+1:00","http://www.w3.org/2001/XMLSchema#gMonthDay"));
    fails(validator.checkValue("--12-12+12:0","http://www.w3.org/2001/XMLSchema#gMonthDay"));
    fails(validator.checkValue("--12-12T12:12:12","http://www.w3.org/2001/XMLSchema#gMonthDay"));
  });

  test("GMonth",function() {
    succeeds(validator.checkValue("--12","http://www.w3.org/2001/XMLSchema#gMonth"));
    succeeds(validator.checkValue("--12Z","http://www.w3.org/2001/XMLSchema#gMonth"));
    succeeds(validator.checkValue("--12+12:00","http://www.w3.org/2001/XMLSchema#gMonth"));
    succeeds(validator.checkValue("--12-12:00","http://www.w3.org/2001/XMLSchema#gMonth"));
    fails(validator.checkValue("12","http://www.w3.org/2001/XMLSchema#gMonth"));
    fails(validator.checkValue("-12","http://www.w3.org/2001/XMLSchema#gMonth"));
    fails(validator.checkValue("--1","http://www.w3.org/2001/XMLSchema#gMonth"));
    fails(validator.checkValue("--12+1:00","http://www.w3.org/2001/XMLSchema#gMonth"));
    fails(validator.checkValue("--12+12:0","http://www.w3.org/2001/XMLSchema#gMonth"));
    fails(validator.checkValue("--12T12:12:12","http://www.w3.org/2001/XMLSchema#gMonth"));
  });

  test("GDay",function() {
    succeeds(validator.checkValue("---12","http://www.w3.org/2001/XMLSchema#gDay"));
    succeeds(validator.checkValue("---12Z","http://www.w3.org/2001/XMLSchema#gDay"));
    succeeds(validator.checkValue("---12+12:00","http://www.w3.org/2001/XMLSchema#gDay"));
    succeeds(validator.checkValue("---12-12:00","http://www.w3.org/2001/XMLSchema#gDay"));
    fails(validator.checkValue("12","http://www.w3.org/2001/XMLSchema#gDay"));
    fails(validator.checkValue("-12","http://www.w3.org/2001/XMLSchema#gDay"));
    fails(validator.checkValue("---1","http://www.w3.org/2001/XMLSchema#gDay"));
    fails(validator.checkValue("---12+1:00","http://www.w3.org/2001/XMLSchema#gDay"));
    fails(validator.checkValue("---12+12:0","http://www.w3.org/2001/XMLSchema#gDay"));
    fails(validator.checkValue("---12T12:12:12","http://www.w3.org/2001/XMLSchema#gDay"));
  });

  test("HexBinary",function() {
    succeeds(validator.checkValue("1234567890abcdefABCDEF","http://www.w3.org/2001/XMLSchema#hexBinary"));
    succeeds(validator.checkValue("","http://www.w3.org/2001/XMLSchema#hexBinary"));
    succeeds(validator.checkValue("00","http://www.w3.org/2001/XMLSchema#hexBinary"));
    fails(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#hexBinary"));
    fails(validator.checkValue("01 23","http://www.w3.org/2001/XMLSchema#hexBinary"));
    fails(validator.checkValue("-1234567890abcdefABCDEF","http://www.w3.org/2001/XMLSchema#hexBinary"));
    fails(validator.checkValue("0x12","http://www.w3.org/2001/XMLSchema#hexBinary"));
  });

  test("Base64Binary",function() {
    succeeds(validator.checkValue("","http://www.w3.org/2001/XMLSchema#base64Binary"));
    succeeds(validator.checkValue("Zg==","http://www.w3.org/2001/XMLSchema#base64Binary"));
    succeeds(validator.checkValue("Zm8=","http://www.w3.org/2001/XMLSchema#base64Binary"));
    succeeds(validator.checkValue("Zm9v","http://www.w3.org/2001/XMLSchema#base64Binary"));
    succeeds(validator.checkValue("Zm9vYg==","http://www.w3.org/2001/XMLSchema#base64Binary"));
    succeeds(validator.checkValue("Zm9vYmE=","http://www.w3.org/2001/XMLSchema#base64Binary"));
    succeeds(validator.checkValue("Zm9vYmFy","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("=","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zg","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zm8==","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zm9v=","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zm9vYg","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zm9vYmE==","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zm9vYmFy=","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("==","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zg=","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zm8","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zm9v==","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zm9vYg=","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zm9vYmE","http://www.w3.org/2001/XMLSchema#base64Binary"));
    fails(validator.checkValue("Zm9vYmFy==","http://www.w3.org/2001/XMLSchema#base64Binary"));
  });

  test("AnyURI",function() {
    succeeds(validator.checkValue("http://example.com/foo","http://www.w3.org/2001/XMLSchema#anyURI"));
    succeeds(validator.checkValue("%10","http://www.w3.org/2001/XMLSchema#anyURI"));
    succeeds(validator.checkValue("","http://www.w3.org/2001/XMLSchema#anyURI"));
    fails(validator.checkValue("%","http://www.w3.org/2001/XMLSchema#anyURI"));
    fails(validator.checkValue("%a","http://www.w3.org/2001/XMLSchema#anyURI"));
    fails(validator.checkValue("%1z","http://www.w3.org/2001/XMLSchema#anyURI"));
  });

  test("QName",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#QName"));
    succeeds(validator.checkValue("foo-bar.123","http://www.w3.org/2001/XMLSchema#QName"));
    succeeds(validator.checkValue("foo:bar","http://www.w3.org/2001/XMLSchema#QName"));
    succeeds(validator.checkValue("foo:bar-baz.123","http://www.w3.org/2001/XMLSchema#QName"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#QName"));
    fails(validator.checkValue(" ","http://www.w3.org/2001/XMLSchema#QName"));
    fails(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#QName"));
    fails(validator.checkValue("foo:bar:baz","http://www.w3.org/2001/XMLSchema#QName"));
    fails(validator.checkValue("foo:","http://www.w3.org/2001/XMLSchema#QName"));
    fails(validator.checkValue(":bar","http://www.w3.org/2001/XMLSchema#QName"));
  });

  test("NOTATION",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#NOTATION"));
    succeeds(validator.checkValue("foo-bar.123","http://www.w3.org/2001/XMLSchema#NOTATION"));
    succeeds(validator.checkValue("foo:bar","http://www.w3.org/2001/XMLSchema#NOTATION"));
    succeeds(validator.checkValue("foo:bar-baz.123","http://www.w3.org/2001/XMLSchema#NOTATION"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#NOTATION"));
    fails(validator.checkValue(" ","http://www.w3.org/2001/XMLSchema#NOTATION"));
    fails(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#NOTATION"));
    fails(validator.checkValue("foo:bar:baz","http://www.w3.org/2001/XMLSchema#NOTATION"));
    fails(validator.checkValue("foo:","http://www.w3.org/2001/XMLSchema#NOTATION"));
    fails(validator.checkValue(":bar","http://www.w3.org/2001/XMLSchema#NOTATION"));
  });

  test("NormalizedString",function() {
    succeeds(validator.checkValue("","http://www.w3.org/2001/XMLSchema#normalizedString"));
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#normalizedString"));
    succeeds(validator.checkValue("foo bar 123","http://www.w3.org/2001/XMLSchema#normalizedString"));
    succeeds(validator.checkValue(" foo  bar ","http://www.w3.org/2001/XMLSchema#normalizedString"));
    fails(validator.checkValue("foo\tbar","http://www.w3.org/2001/XMLSchema#normalizedString"));
    fails(validator.checkValue("foo\rbar","http://www.w3.org/2001/XMLSchema#normalizedString"));
    fails(validator.checkValue("foo\nbar","http://www.w3.org/2001/XMLSchema#normalizedString"));
  });

  test("Token",function() {
    succeeds(validator.checkValue("","http://www.w3.org/2001/XMLSchema#token"));
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#token"));
    succeeds(validator.checkValue("foo bar 123","http://www.w3.org/2001/XMLSchema#token"));
    fails(validator.checkValue("foo bar ","http://www.w3.org/2001/XMLSchema#token"));
    fails(validator.checkValue("foo  bar","http://www.w3.org/2001/XMLSchema#token"));
    fails(validator.checkValue(" foo bar","http://www.w3.org/2001/XMLSchema#token"));
    fails(validator.checkValue("foo\tbar","http://www.w3.org/2001/XMLSchema#token"));
    fails(validator.checkValue("foo\rbar","http://www.w3.org/2001/XMLSchema#token"));
    fails(validator.checkValue("foo\nbar","http://www.w3.org/2001/XMLSchema#token"));
  });

  test("Language",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#language"));
    succeeds(validator.checkValue("foo-bar-123","http://www.w3.org/2001/XMLSchema#language"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#language"));
    fails(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#language"));
    fails(validator.checkValue("-foo","http://www.w3.org/2001/XMLSchema#language"));
    fails(validator.checkValue("foo-","http://www.w3.org/2001/XMLSchema#language"));
    fails(validator.checkValue("foobarbaz-foo","http://www.w3.org/2001/XMLSchema#language"));
    fails(validator.checkValue("foo-123456789","http://www.w3.org/2001/XMLSchema#language"));
  });

  test("NMTOKEN",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    succeeds(validator.checkValue("foo-bar.123","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    succeeds(validator.checkValue("foo:bar","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    succeeds(validator.checkValue("foo:bar-baz.123","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    succeeds(validator.checkValue("foo:bar:baz","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    succeeds(validator.checkValue("foo:","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    succeeds(validator.checkValue(":bar","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    succeeds(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    fails(validator.checkValue("foo bar","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    fails(validator.checkValue("foo ","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    fails(validator.checkValue(" bar","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
    fails(validator.checkValue(" ","http://www.w3.org/2001/XMLSchema#NMTOKEN"));
  });

  test("NMTOKENS",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    succeeds(validator.checkValue("foo-bar.123","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    succeeds(validator.checkValue("foo:bar","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    succeeds(validator.checkValue("foo:bar-baz.123","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    succeeds(validator.checkValue("foo:bar:baz","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    succeeds(validator.checkValue("foo:","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    succeeds(validator.checkValue(":bar","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    succeeds(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    succeeds(validator.checkValue("foo bar","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    fails(validator.checkValue("foo ","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    fails(validator.checkValue(" bar","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
    fails(validator.checkValue(" ","http://www.w3.org/2001/XMLSchema#NMTOKENS"));
  });

  test("Name",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#Name"));
    succeeds(validator.checkValue("foo-bar.123","http://www.w3.org/2001/XMLSchema#Name"));
    succeeds(validator.checkValue("foo:bar","http://www.w3.org/2001/XMLSchema#Name"));
    succeeds(validator.checkValue("foo:bar-baz.123","http://www.w3.org/2001/XMLSchema#Name"));
    succeeds(validator.checkValue("foo:bar:baz","http://www.w3.org/2001/XMLSchema#Name"));
    succeeds(validator.checkValue("foo:","http://www.w3.org/2001/XMLSchema#Name"));
    succeeds(validator.checkValue(":bar","http://www.w3.org/2001/XMLSchema#Name"));
    fails(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#Name"));
    fails(validator.checkValue("foo bar","http://www.w3.org/2001/XMLSchema#Name"));
    fails(validator.checkValue("foo ","http://www.w3.org/2001/XMLSchema#Name"));
    fails(validator.checkValue(" bar","http://www.w3.org/2001/XMLSchema#Name"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#Name"));
    fails(validator.checkValue(" ","http://www.w3.org/2001/XMLSchema#Name"));
  });

  test("NCName",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#NCName"));
    succeeds(validator.checkValue("foo-bar.123","http://www.w3.org/2001/XMLSchema#NCName"));
    fails(validator.checkValue("foo:bar","http://www.w3.org/2001/XMLSchema#NCName"));
    fails(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#NCName"));
    fails(validator.checkValue("foo bar","http://www.w3.org/2001/XMLSchema#NCName"));
    fails(validator.checkValue("foo ","http://www.w3.org/2001/XMLSchema#NCName"));
    fails(validator.checkValue(" bar","http://www.w3.org/2001/XMLSchema#NCName"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#NCName"));
    fails(validator.checkValue(" ","http://www.w3.org/2001/XMLSchema#NCName"));
  });

  test("ID",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#ID"));
    succeeds(validator.checkValue("foo-bar.123","http://www.w3.org/2001/XMLSchema#ID"));
    fails(validator.checkValue("foo:bar","http://www.w3.org/2001/XMLSchema#ID"));
    fails(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#ID"));
    fails(validator.checkValue("foo bar","http://www.w3.org/2001/XMLSchema#ID"));
    fails(validator.checkValue("foo ","http://www.w3.org/2001/XMLSchema#ID"));
    fails(validator.checkValue(" bar","http://www.w3.org/2001/XMLSchema#ID"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#ID"));
    fails(validator.checkValue(" ","http://www.w3.org/2001/XMLSchema#ID"));
  });

  test("IDREF",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#IDREF"));
    succeeds(validator.checkValue("foo-bar.123","http://www.w3.org/2001/XMLSchema#IDREF"));
    fails(validator.checkValue("foo:bar","http://www.w3.org/2001/XMLSchema#IDREF"));
    fails(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#IDREF"));
    fails(validator.checkValue("foo bar","http://www.w3.org/2001/XMLSchema#IDREF"));
    fails(validator.checkValue("foo ","http://www.w3.org/2001/XMLSchema#IDREF"));
    fails(validator.checkValue(" bar","http://www.w3.org/2001/XMLSchema#IDREF"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#IDREF"));
    fails(validator.checkValue(" ","http://www.w3.org/2001/XMLSchema#IDREF"));
  });

  test("ENTITY",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#ENTITY"));
    succeeds(validator.checkValue("foo-bar.123","http://www.w3.org/2001/XMLSchema#ENTITY"));
    fails(validator.checkValue("foo:bar","http://www.w3.org/2001/XMLSchema#ENTITY"));
    fails(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#ENTITY"));
    fails(validator.checkValue("foo bar","http://www.w3.org/2001/XMLSchema#ENTITY"));
    fails(validator.checkValue("foo ","http://www.w3.org/2001/XMLSchema#ENTITY"));
    fails(validator.checkValue(" bar","http://www.w3.org/2001/XMLSchema#ENTITY"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#ENTITY"));
    fails(validator.checkValue(" ","http://www.w3.org/2001/XMLSchema#ENTITY"));
  });

  test("IDREFS",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#IDREFS"));
    succeeds(validator.checkValue("foo-bar.123","http://www.w3.org/2001/XMLSchema#IDREFS"));
    succeeds(validator.checkValue("foo bar","http://www.w3.org/2001/XMLSchema#IDREFS"));
    fails(validator.checkValue("foo:bar","http://www.w3.org/2001/XMLSchema#IDREFS"));
    fails(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#IDREFS"));
    fails(validator.checkValue("foo ","http://www.w3.org/2001/XMLSchema#IDREFS"));
    fails(validator.checkValue(" bar","http://www.w3.org/2001/XMLSchema#IDREFS"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#IDREFS"));
    fails(validator.checkValue(" ","http://www.w3.org/2001/XMLSchema#IDREFS"));
  });

  test("ENTITIES",function() {
    succeeds(validator.checkValue("foo","http://www.w3.org/2001/XMLSchema#ENTITIES"));
    succeeds(validator.checkValue("foo-bar.123","http://www.w3.org/2001/XMLSchema#ENTITIES"));
    succeeds(validator.checkValue("foo bar","http://www.w3.org/2001/XMLSchema#ENTITIES"));
    fails(validator.checkValue("foo:bar","http://www.w3.org/2001/XMLSchema#ENTITIES"));
    fails(validator.checkValue("123-foo","http://www.w3.org/2001/XMLSchema#ENTITIES"));
    fails(validator.checkValue("foo ","http://www.w3.org/2001/XMLSchema#ENTITIES"));
    fails(validator.checkValue(" bar","http://www.w3.org/2001/XMLSchema#ENTITIES"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#ENTITIES"));
    fails(validator.checkValue(" ","http://www.w3.org/2001/XMLSchema#ENTITIES"));
  });

  test("Integer",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#integer"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#integer"));
    succeeds(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#integer"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#integer"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#integer"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#integer"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#integer"));
  });

  test("Long",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#long"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#long"));
    succeeds(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#long"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#long"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#long"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#long"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#long"));
  });

  test("Int",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#int"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#int"));
    succeeds(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#int"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#int"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#int"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#int"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#int"));
  });

  test("Short",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#short"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#short"));
    succeeds(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#short"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#short"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#short"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#short"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#short"));
  });

  test("Byte",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#byte"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#byte"));
    succeeds(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#byte"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#byte"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#byte"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#byte"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#byte"));
  });

  test("NonNegativeInteger",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
  });

  test("UnsignedLong",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#unsignedLong"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#unsignedLong"));
  });

  test("UnsignedInt",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#unsignedInt"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#unsignedInt"));
  });

  test("UnsignedShort",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#unsignedShort"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#unsignedShort"));
  });

  test("UnsignedByte",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#unsignedByte"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#unsignedByte"));
  });

  test("NonPositiveInteger",function() {
    succeeds(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    succeeds(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    succeeds(validator.checkValue("-2","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    succeeds(validator.checkValue("-0123","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    succeeds(validator.checkValue("-0129","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-123.0","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-123.5","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-true","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-false","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-0x123","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-123a","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-NaN","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-INF","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-1.2E34","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
    fails(validator.checkValue("-1E2.3","http://www.w3.org/2001/XMLSchema#nonPositiveInteger"));
  });


  test("PositiveInteger",function() {
    succeeds(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    succeeds(validator.checkValue("2","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    succeeds(validator.checkValue("0123","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    succeeds(validator.checkValue("0129","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("123.0","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("123.5","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("true","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("false","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("0x123","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("123a","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("NaN","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("INF","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("1E2","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("1.2E34","http://www.w3.org/2001/XMLSchema#positiveInteger"));
    fails(validator.checkValue("1E2.3","http://www.w3.org/2001/XMLSchema#positiveInteger"));
  });

  test("NegativeInteger",function() {
    succeeds(validator.checkValue("-1","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    succeeds(validator.checkValue("-2","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    succeeds(validator.checkValue("-0123","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    succeeds(validator.checkValue("-0129","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("0","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("1","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-123.0","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-123.5","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-true","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-false","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-0x123","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-123a","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-NaN","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-INF","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("+1E2","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-1E2","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-1.2E34","http://www.w3.org/2001/XMLSchema#negativeInteger"));
    fails(validator.checkValue("-1E2.3","http://www.w3.org/2001/XMLSchema#negativeInteger"));
  });

  test("Unspecified representations",function() {
    succeeds(validator.checkRepr(undefined,undefined,[]));
    fails(validator.checkRepr('',undefined,[]));
  });

  test("Arbitrary Representations",function() {
    succeeds(validator.checkRepr('abc','application/vnd.dog',[anything]));
    succeeds(validator.checkRepr('<stuff/>','application/vnd.dog+xml',[anything]));
    succeeds(validator.checkRepr('<stuff foo="1" bar="2"><fish/><fowl/></stuff>','application/vnd.dog+xml',[anything]));
    succeeds(validator.checkRepr('{}','application/vnd.dog+json',[anything]));
    fails(validator.checkRepr('abc','application/vnd.dog',[]));
    fails(validator.checkRepr('abc','application/vnd.dog+xml',[anything]));
    fails(validator.checkRepr('abc','application/vnd.dog+json',[anything]));
  });

  test("JSON Representations",function() {
    succeeds(validator.checkRepr('{ "name": "Fido" }','application/json',[json,xml]));
    succeeds(validator.checkRepr('{ "name": "Fido", "age": 5 }','application/json',[json,xml]));
    succeeds(validator.checkRepr('{ "name": "Fido" }','application/vnd.dog+json',[json,xml]));
    fails(validator.checkRepr('','application/json',[json,xml]));
    fails(validator.checkRepr('}{','application/json',[json,xml]));
    fails(validator.checkRepr('{}','application/json',[json,xml]));
    fails(validator.checkRepr('{}','application/vnd.dog+json',[json,xml]));
    fails(validator.checkRepr('{ "name": 5 }','application/json',[json,xml]));
    fails(validator.checkRepr('{ name: "Fido" }','application/json',[json,xml]));
    fails(validator.checkRepr('{ "name": "Fido", "age": "5" }','application/json',[json,xml]));
    fails(validator.checkRepr('{ "name": "Fido", "age": -1 }','application/json',[json,xml]));
    fails(validator.checkRepr('{ "name": "Fido" }','application/*',[json,xml]));
    fails(validator.checkRepr('{ "name": "Fido" }','application/json',[]));
  });

  test("XML Representations",function() {
    succeeds(validator.checkRepr('<dog><name>Fido</name></dog>','application/xml',[json,xml]));
    succeeds(validator.checkRepr('<dog><name>Fido</name><age>5</age></dog>','application/xml',[json,xml]));
    succeeds(validator.checkRepr('<dog><name>Fido</name></dog>','application/vnd.dog+xml',[json,xml]));
    fails(validator.checkRepr('','application/xml',[json,xml]));
    fails(validator.checkRepr('><','application/xml',[json,xml]));
    fails(validator.checkRepr('<dog/>','application/xml',[json,xml]));
    fails(validator.checkRepr('<dog/>','application/vnd.dog+xml',[json,xml]));
    fails(validator.checkRepr('<DOG><NAME>Fido</NAME></DOG>','application/xml',[json,xml]));
    fails(validator.checkRepr('<dog><name>Fido</name><age>five</age></dog>','application/xml',[json,xml]));
    fails(validator.checkRepr('<dog><name>Fido</name><age>-1</age></dog>','application/xml',[json,xml]));
    fails(validator.checkRepr('<dog><name>Fido</name></dog>','application/*',[]));
    fails(validator.checkRepr('<dog><name>Fido</name></dog>','application/xml',[]));
  });

  test("Examples",function() {
    succeeds(validator.checkExample(getEx,dog.requests[2]));
    succeeds(validator.checkExample(postEx,dogs.requests[0]));
    fails(validator.checkExample(getEx,dog.requests[0]));
    fails(validator.checkExample(getEx,dogs.requests[1]));
  });

});
