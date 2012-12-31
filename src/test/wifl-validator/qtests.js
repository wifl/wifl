define(["qunit","validator"],function(qunit,validator) {

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

});
