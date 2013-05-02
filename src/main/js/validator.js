define(["deferred","deferred-worker"],function(deferred,deferredWorker) {

  var SUCCESS = deferred.Deferred().resolve();

  function Failure(subject,property,message,value) {
    this.subject = subject;
    this.property = property;
    this.message = message;
    this.value = value;
  }
  
  Failure.prototype.deepest = function(pname) {
    var result = this[pname];
    var v = this.value;
    while (v instanceof Failure) {
      result = v[pname] || result;
      v = v.value;
    }
    return result;
  }

  function success(value) {
    if (value === undefined) {
      return SUCCESS;
    } else {
      return deferred.Deferred().resolve(value);
    }
  }

  function failure(property,message,value) {
    return deferred.Deferred().reject(new Failure(undefined,property,message,value));
  }

  function prepend(contextSubject,contextProperty,contextMessage) {
    return function(failure) {
      return (failure.message != undefined || typeof failure == "string") ? 
        new Failure(contextSubject,contextProperty,contextMessage,failure) :
        (function() {
          failure.subject = contextSubject; 
          failure.property = contextProperty;
          failure.message = contextMessage;
          return failure;
        })();
    };
  }

  function allMap(args,fun) {
    var count = 0;
    var promise = SUCCESS;
    function yes() { if (!--count) { promise.resolve(); } }
    function no(error) { promise.reject(error); }
    for (var i=0; i<args.length; i++) {
      var arg = args[i];
      if (fun) { arg = fun(arg); }
      switch (arg.state()) {
        case "rejected":
  	  return arg;
	case "pending":
	  if (!count++) { promise = deferred.Deferred(); }
	  arg.done(yes).fail(no);
      }
    }
    return promise;
  }

  function all() { return allMap(arguments); }

  function checkExample(example,request) {
    return all(
      checkRequest(example.request,request).pipe(undefined,prepend(example.request,undefined,"Request")),
      checkResponse(example.response,request.responses).pipe(undefined,prepend(example.response,undefined,"Response"))
    );
  }

  function checkRequest(message,request) {
    var uriParams = request.uriTemplate.parse(message.uri);
    if (message.method !== request.method) {
      return failure("method", "Method should be " + request.method, message.method);
    } else if (!uriParams) {
      return failure("uri", "Failed to match uri against " + request.uriTemplate, message.uri);
    } else {
      return all(
        checkHeaders(message.headerParams,request.headerParams),
        checkParams(uriParams,request.uriParams).pipe(undefined,prepend(undefined,"uri","URI parameter")),
        checkRepr(message.body,message.headers["Content-Type"],request.representations)
      );
    }
  }

  function checkResponse(message,responses) {
    for (var i=0; i<responses.length; i++) {
      var response = responses[i];
      if (response.statuses.indexOf(message.status) !== -1) {
	return all(
	  checkHeaders(message.headerParams,response.headerParams),
	  checkRepr(message.body,message.headers["Content-Type"],response.representations)
	);
      }
    }
    return failure("status", "Unrecognized status code", message.status);
  }

  function checkHeaders(headers,headerParams) {
    return allMap(headerParams,function(headerParam) {
      var header = headers.filter(function(h) { return h.name == headerParam.name; })[0];
      return checkParam(header ? header.value : header,headerParam).pipe(undefined,prepend(header,undefined,"Header"));
    });
  }

  function checkParams(values,params) {
    return allMap(params,function(param) {
      return checkParam(values[param.name],param);
    });
  }

  function checkParam(value,param) {
    if (value) {
      return checkValue(value,param.type).pipe(undefined,prepend(undefined,undefined,param.name));
    } else if (param.required) {
      return failure(undefined,param.name + " is required");
    } else {
      return success();
    }
  }

  var reprValidators = [];

  function isSubtype(subType,superType) {
    if (subType === superType) { return true; }
    // application/foo+xml is a subtype of application/xml
    subType = subType.replace(/[/]\S+[+]/,"/");
    if (subType === superType) { return true; }
    // application/xml is a subtype of application/*
    subType = subType.replace(/[/]\S+/,"/*");
    return (subType === superType);
  }

  function checkRepr(body,contentType,reprs) {
    if (body === undefined) {
      return success();
    } else if (contentType === undefined) {
      return failure(undefined,"Missing content type.");
    } else {
      for (var i=0; i<reprs.length; i++) {
	var repr = reprs[i];
	if (isSubtype(contentType,repr.contentType)) {
	  return allMap(reprValidators,function(validator) {
	    return validator.contentType(contentType).pipe(
	      function() { return validator.values(body,repr.type); },
	      function() { return success(); }
	    );
	  }).pipe(undefined,prepend(undefined,"body","Representation must be of type " + contentType));
	}
      }
      return failure("Content-Type","Unrecognized content type", contentType);
    }
  }

  var paramValidators = [];

  function checkValue(value,type) {
    return allMap(paramValidators,function(validator) {
      return validator.type(type).pipe(
        function() { return validator.values(value); },
        function() { return success(); }
      );
    }).pipe(undefined,prepend(undefined,undefined,"Must be of type " + type));
  }

  function checkBool(bool,value) {
    return (bool? SUCCESS: failure(undefined,undefined,value));
  }

  function isMember(values) {
    switch (typeof values) {
    case "function": return function(value,type) {
      try { return values(value,type); }
      catch (exn) { return failure(undefined,exn,value); }
    };
    case "string": return function(value) { return checkBool(value === values,value); };
    case "boolean": return function(value) { return checkBool(values,value); };
    case "object": 
      if (values instanceof Array) {
        return function(value) { return checkBool(values.indexOf(value) !== -1,value); };
      } else {
        return function(value) { return checkBool(values.test(value),value); }
      }
    }
  }

  function addValidator(validator) {
    if (validator.type && validator.values) {
      paramValidators.unshift({
        type: isMember(validator.type),
        values: isMember(validator.values)
      });
    } else if (validator.contentType && validator.values) {
      reprValidators.unshift({
        contentType: isMember(validator.contentType),
        values: isMember(validator.values)
      });
    }
  }

  // Validators for text/uri-list, application/json and application/xml

  addValidator({
    contentType: "text/uri-list",
    values: /^([#][^\r\n]*)?([a-zA-Z0-9-_.!~*'();?:@&=+$,#\/]|[%][a-fA-F0-9]{2}|[\r\n]([#][^\r\n]*)?)*$/
  });

  addValidator({
    contentType: /^application\/(\S+[+])?json\b/,
    values: deferredWorker("validator-jsv")
  });

  addValidator({
    contentType: /^(application|text)\/(\S+[+])?xml\b/,
    values: deferredWorker("validator-xsd")
  });

  // Validators for built-in XML Schema datatypes

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#string",
    values: true
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#boolean",
    values: ["true","false","0","1"]
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#decimal",
    values: /^[+-]?\d+(\.\d+)?$/
  });

  addValidator({ 
    type: [
      "http://www.w3.org/2001/XMLSchema#float",
      "http://www.w3.org/2001/XMLSchema#double"
    ],
    values: /^[+-]?(\d+(\.\d+)?([eE]\d+)?|NaN|INF)$/
  });

  // TODO: value restrictions on dates/times
  // TODO: incorrectly allows T separator without a following H M or S value
  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#duration",
    values: /^[-]?P(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#dateTime",
    values: /^[-]?\d{4,}\-\d\d\-\d\dT\d\d\:\d\d\:\d\d(\.\d+)?(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#time",
    values: /^\d\d\:\d\d\:\d\d(\.\d+)?(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#date",
    values: /^[-]?\d{4,}\-\d\d\-\d\d(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#gYearMonth",
    values: /^[-]?\d{4,}\-\d\d(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#gYear",
    values: /^[-]?\d{4,}(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#gMonthDay",
    values: /^\-\-\d\d\-\d\d(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#gMonth",
    values: /^\-\-\d\d(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#gDay",
    values: /^\-\-\-\d\d(([+-]\d\d\:\d\d)|Z)?$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#hexBinary",
    values: /^([0-9a-fA-F][0-9a-fA-F])*$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#base64Binary",
    values: /^(([A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*)*(([A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*[A-Za-z0-9+\/])|([A-Za-z0-9+\/]\s*[A-Za-z0-9+\/]\s*[AEIMQUYcgkosw048]\s*[=])|([A-Za-z0-9+\/]\s*[AQgw]\s*[=]\s*[=])))?$/
  });

  // TODO: Validate URIs properly
  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#anyURI",
    values: /^([a-zA-Z0-9-_.!~*'();?:@&=+$,#\/]|[%][a-fA-F0-9]{2})*$/
  });

  // TODO: Unicode QNames
  addValidator({ 
    type: [
      "http://www.w3.org/2001/XMLSchema#QName",
      "http://www.w3.org/2001/XMLSchema#NOTATION"
    ],
    values: /^[a-zA-Z_][a-zA-Z0-9_.\-]*([:][a-zA-Z_][a-zA-Z0-9_.\-]*)?$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#normalizedString",
    values: /^[^\n\r\t]*$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#token",
    values: /^(\S+([ ]\S+)*)?$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#language",
    values: /^[a-zA-Z]{1,8}([-][a-zA-Z0-9]{1,8})*$/
  });

  // TODO: Unicode NMTOKENs
  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#NMTOKEN",
    values: /^[a-zA-Z0-9_.\-:]+$/
  });

  // TODO: Unicode NMTOKENS
  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#NMTOKENS",
    values: /^[a-zA-Z0-9_.\-:]+([ ]+[a-zA-Z0-9_.\-:]+)*$/
  });

  // TODO: Unicode Names
  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#Name",
    values: /^[a-zA-Z_:][a-zA-Z0-9_.\-:]*$/
  });

  // TODO: Unicode NCNames
  addValidator({ 
    type: [
      "http://www.w3.org/2001/XMLSchema#NCName",
      "http://www.w3.org/2001/XMLSchema#ID",
      "http://www.w3.org/2001/XMLSchema#IDREF",
      "http://www.w3.org/2001/XMLSchema#ENTITY"
    ],
    values: /^[a-zA-Z_][a-zA-Z0-9_.\-]*$/
  });

  // TODO: Unicode IDREFS
  addValidator({ 
    type: [
      "http://www.w3.org/2001/XMLSchema#IDREFS",
      "http://www.w3.org/2001/XMLSchema#ENTITIES"
    ],
    values: /^[a-zA-Z_][a-zA-Z0-9_.\-]*([ ]+[a-zA-Z_][a-zA-Z0-9_.\-]*)*$/
  });

  // TODO: Range validation
  addValidator({ 
    type: [
      "http://www.w3.org/2001/XMLSchema#integer",
      "http://www.w3.org/2001/XMLSchema#long",
      "http://www.w3.org/2001/XMLSchema#int",
      "http://www.w3.org/2001/XMLSchema#short",
      "http://www.w3.org/2001/XMLSchema#byte"
    ],
    values: /^[+-]?\d+$/
  });

  // TODO: Range validation
  addValidator({ 
    type: [
      "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
      "http://www.w3.org/2001/XMLSchema#unsignedLong",
      "http://www.w3.org/2001/XMLSchema#unsignedInt",
      "http://www.w3.org/2001/XMLSchema#unsignedShort",
      "http://www.w3.org/2001/XMLSchema#unsignedByte"
    ],
    values: /^[+]?\d+$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#nonPositiveInteger",
    values: /^0+|[-]\d+$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#positiveInteger",
    values: /^[+]?0*[1-9]\d*$/
  });

  addValidator({ 
    type: "http://www.w3.org/2001/XMLSchema#negativeInteger",
    values: /^[-]0*[1-9]\d*$/
  });

  return {
    checkExample: checkExample,
    checkRequest: checkRequest,
    checkResponse: checkResponse,
    checkParams: checkParams,
    checkParam: checkParam,
    checkRepr: checkRepr,
    checkValue: checkValue,
    addValidator: addValidator,
    success: success,
    failure: failure,
    all: all,
    allMap: allMap,
    get: deferred.get
  };

});
