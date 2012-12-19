define(["rdfa-ld","uri-template2"], function (rdfaLD,uriTemplate) {
  
  // Extract WIFL from a collection of documents
  // Note that this will go into an infinite loop if
  // there are cycles in the RDFa.
  function Wifl(docs) {
    this.docs = docs;
    docs.setMapping("wifl","http://wifl.org/spec/#");
  }
  // Remove any duplicate entries from an array of strings
  Wifl.prototype.uniquify = function(arr) {
    var cache = {};
    return arr.filter(function (str) {
      if (cache[str]) {
        return false;
      } else {
        cache[str] = true;
        return true;
      }
    });
  }
  // Extract all targets, and apply a function to them
  Wifl.prototype.targets = function(uri,rel,fun) {
    var result = this.docs.getValues(uri,rel);
    result = this.uniquify(result);
    if (fun) { result = result.map(fun,this); }
    return result;
  };
  // Extract an API description
  Wifl.prototype.api = function() {
    return {
      resources: this.uniquify(
        this.docs.getSubjects("rdf:type","wifl:Resource")
          .concat(this.docs.getSubjects("wifl:request"))
          .concat(this.docs.getSubjects("wifl:path"))
          .concat(this.docs.getValues(null,"wifl:super"))
          .concat(this.docs.getValues(null,"wifl:parent"))
      ).map(this.resource,this),
      examples: this.uniquify(
        this.docs.getSubjects("rdf:type","wifl:Example")
          .concat(this.docs.getSubjects("wifl:exampleRequest"))
          .concat(this.docs.getSubjects("wifl:exampleResponse"))
      ).map(this.example,this),
      lookup: function(method,uri) {
        if (!this.dfas) {
          this.dfas = {};
          for (var i=0; i<this.resources.length; i++) {
            var resource = this.resources[i];
            for (var j=0; j<resource.requests.length; j++) {
              var request = resource.requests[j];
              var nfa = request.uriTemplate.nfa.constant(request);
              if (this.dfas[request.method]) {
                this.dfas[request.method] = this.dfas[request.method].or(nfa);
              } else {
                this.dfas[request.method] = nfa;
              }
            }
          }
          for (var key in this.dfas) {
            this.dfas[key] = this.dfas[key].determinize();
          }
        }
        if (this.dfas[method]) {
          return this.dfas[method].exec(uriTemplate.tokenize(uri));
        }
      }
    };
  }
  // Extract a resource description
  Wifl.prototype.resource = function(uri) {
    return this.inherit({
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      supers: this.targets(uri,"wifl:super",this.resource),
      parent: this.targets(uri,"wifl:parent",this.resource)[0],
      myRequests: this.targets(uri,"wifl:request",this.request),
      myResponses: this.targets(uri,"wifl:response",this.response),
      myHeaderParams: this.targets(uri,"wifl:headerParam",this.parameter),
      myPathParams: this.targets(uri,"wifl:pathParam",this.parameter),
      myQueryParams: this.targets(uri,"wifl:queryParam",this.parameter),
      myPath: this.targets(uri,"wifl:path",this.trim)[0]
    });
  };
  // Extract a request description
  Wifl.prototype.request = function(uri) {
    return {
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      myResponses: this.targets(uri,"wifl:response",this.response),
      myHeaderParams: this.targets(uri,"wifl:headerParam",this.parameter),
      myPathParams: this.targets(uri,"wifl:pathParam",this.parameter),
      myQueryParams: this.targets(uri,"wifl:queryParam",this.parameter),
      method: this.targets(uri,"wifl:method",this.trim)[0],
      representations: this.targets(uri,"wifl:representation",this.representation),
    };
  };
  // Extract a response description
  Wifl.prototype.response = function(uri) {
    return {
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      headerParams: this.targets(uri,"wifl:headerParam",this.parameter),
      statuses: this.targets(uri,"wifl:status",this.trim),
      representations: this.targets(uri,"wifl:representation",this.representation),
    };
  };
  // Extract a parameter
  Wifl.prototype.parameter = function(uri) {
    return {
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      name: this.targets(uri,"wifl:name",this.trim)[0],
      required: this.targets(uri,"wifl:required",this.trim)[0],
      fixed: this.targets(uri,"wifl:fixed",this.trim)[0],
      "default": this.targets(uri,"wifl:default",this.trim)[0],
      type: this.targets(uri,"wifl:type",this.trim)[0]
    };
  };
  // Extract a representation
  Wifl.prototype.representation = function(uri) {
    return {
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      contentType: this.targets(uri,"wifl:contentType",this.trim)[0],
      type: this.targets(uri,"wifl:type",this.trim)[0]
    };
  };
  // Extract an example
  Wifl.prototype.example = function(uri) {
    return this.exInherit({
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      request: this.targets(uri,"wifl:exampleRequest",this.exRequest)[0],
      response: this.targets(uri,"wifl:exampleResponse",this.exResponse)[0]
    });
  };
  // Extract an example request
  Wifl.prototype.exRequest = function(uri) {
    return {
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      headerParams: this.targets(uri,"wifl:exampleHeader",this.exHeader),
      method: this.targets(uri,"wifl:method",this.trim)[0],
      verb: this.targets(uri,"wifl:verb",this.trim)[0],
      path: this.targets(uri,"wifl:uri",this.trim)[0],
      body: this.targets(uri,"wifl:body",this.trim)[0]
    };
  };
  // Extract an example response
  Wifl.prototype.exResponse = function(uri) {
    return {
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      headerParams: this.targets(uri,"wifl:exampleHeader",this.exHeader),
      status: this.targets(uri,"wifl:status",this.trim)[0],
      body: this.targets(uri,"wifl:body",this.trim)[0]
    };
  };
  // Extract an example header
  Wifl.prototype.exHeader = function(uri) {
    return {
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      name: this.targets(uri,"wifl:name",this.trim)[0],
      value: this.targets(uri,"wifl:value",this.trim)[0]
    };
  };
  // Trim a string
  Wifl.prototype.trim = function(str) {
    return str.trim();
  }
  // A constant function
  Wifl.prototype.constant = function(result) { return function() {
    return result;
  }; };

  // Perform inheritance on a resource
  Wifl.prototype.inherit = function (resource) {
    if (resource.parent === undefined) {
      resource.pathParams = resource.myPathParams;
      if (resource.myPath === undefined) {
        resource.path = "";
      } else {
        resource.path = resource.myPath;
      }
    } else {
      resource.pathParams = resource.myPathParams.concat(resource.parent.pathParams);
      if (resource.myPath === undefined) {
        resource.path = resource.parent.path;
      } else {
        resource.path = resource.parent.path + resource.myPath;
      }
    }
    resource.queryParams = resource.myQueryParams;
    resource.headerParams = resource.myHeaderParams;
    resource.requests = resource.myRequests;
    resource.responses = resource.myResponses;
    for (var i=0; i<resource.supers.length; i++) {
      resource.queryParams = resource.queryParams.concat(resource.supers[i].queryParams);
      resource.headerParams = resource.headerParams.concat(resource.supers[i].headerParams);
      resource.requests = resource.requests.concat(resource.supers[i].requests);
      resource.responses = resource.responses.concat(resource.supers[i].responses);
    }
    resource.uriParams = resource.pathParams.concat(resource.queryParams);
    resource.uriTemplate = this.uriTemplate(resource);
    for (var j=0; j<resource.requests.length; j++) {
      var request = resource.requests[j];
      request.resource = resource;
      request.path = resource.path;
      request.pathParams = request.myPathParams.concat(resource.pathParams);
      request.queryParams = request.myQueryParams.concat(resource.queryParams);
      request.headerParams = request.myHeaderParams.concat(resource.headerParams);
      request.responses = request.myResponses.concat(resource.responses);
      request.uriParams = request.pathParams.concat(request.queryParams);
      request.uriTemplate = this.uriTemplate(request);
    }
    return resource;
  };
  Wifl.prototype.uriTemplate = function(obj) {
    var template = obj.path;
    if (obj.queryParams.length) {
      function name(param) { return param.name; }
      var names = obj.queryParams.map(name).sort();
      template = template + "{?" + names.join(",") + "}";
    }
    return uriTemplate.parse(template);
  };

  // Perform inheritance on an example
  Wifl.prototype.exInherit = function(example) {
    if (example.request) {
      example.request.headers = {};
      for (var i=0; i<example.request.headerParams.length; i++) {
        example.request.headers[example.request.headerParams[i].name]
          = example.request.headerParams[i].value;
      }
      if (example.request.headers.Host) {
        example.request.uri = "http://" + example.request.headers.Host + example.request.path;
      } else {
        example.request.uri = example.request.path;
      }
    }
    if (example.response) {
      example.response.headers = {};
      for (var i=0; i<example.response.headerParams.length; i++) {
        example.response.headers[example.response.headerParams[i].name]
          = example.response.headerParams[i].value;
      }
    }
    return example;
  };

  // To create a WIFL object we resolve wrt all the properties
  // which can refer from one WIFL object to another.
  return {
    build: function(doc) {
      return rdfaLD.create(doc).setMapping("wifl","http://wifl.org/spec/#").resolveTargets(
	"wifl:parent",
	"wifl:super",
	"wifl:pathParam",
	"wifl:queryParam",
	"wifl:headerParam",
        "wifl:example",
        "wifl:resource",
	"wifl:request",
	"wifl:response",
	"wifl:representation",
	"wifl:seeAlso",
	"rdfs:seeAlso"
      ).map(function(docs) {
	return new Wifl(docs).api();
      });
    }
  };

});
