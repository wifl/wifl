define(["rdfa-ld"], function (rdfaLD) {
  
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
  // Extract all sources, and apply a function to them
  Wifl.prototype.sources = function(rel,uri,fun) {
    var result = this.docs.getSubjects(rel,uri);
    result = this.uniquify(result);
    if (fun) { result = result.map(fun,this); }
    return result;
  };
  // Extract all targets, and apply a function to them
  Wifl.prototype.targets = function(uri,rel,fun) {
    var result = this.docs.getValues(uri,rel);
    result = this.uniquify(result);
    if (fun) { result = result.map(fun,this); }
    return result;
  };
  // Extract an API description document
  Wifl.prototype.document = function(uri) {
    uri = uri || this.docs.getURI();
    return this.imports({
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      seeAlso: this.targets(uri,"wifl:seeAlso",this.api)
        .concat(this.targets(uri,"rdfs:seeAlso",this.api)),
      myResources: this.targets(uri,"wifl:resource",this.resource),
      myExamples: this.targets(uri,"wifl:example",this.example),
    });
  }
  // Extract a resource description
  Wifl.prototype.resource = function(uri) {
    return this.inherit({
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      supers: this.targets(uri,"wifl:super",this.resource),
      parent: this.targets(uri,"wifl:parent",this.resource)[0],
      examples: this.targets(uri,"wifl:example",this.example),
      myRequests: this.targets(uri,"wifl:request",this.request),
      myResponses: this.targets(uri,"wifl:response",this.request),
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
      default: this.targets(uri,"wifl:default",this.trim)[0],
      dataType: this.targets(uri,"wifl:dataType",this.trim)[0]
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
    return {
      about: uri,
      toString: this.constant(uri),
      descriptions: this.targets(uri,"dc:description",this.trim),
      request: this.targets(uri,"wifl:exampleRequest",this.exRequest)[0],
      response: this.targets(uri,"wifl:exampleResponse",this.exResponse)[0]
    };
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
      uri: this.targets(uri,"wifl:uri",this.trim)[0],
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
    resource.uriTemplate = this.uriTemplate(resource);
    for (var j=0; j<resource.requests.length; j++) {
      var request = resource.requests[j];
      request.path = resource.path;
      request.pathParams = request.myPathParams.concat(resource.pathParams);
      request.queryParams = request.myQueryParams.concat(resource.queryParams);
      request.headerParams = request.myHeaderParams.concat(resource.headerParams);
      request.responses = request.myResponses.concat(resource.responses);
      request.uriTemplate = this.uriTemplate(request);
    }
    for (var k=0; k<resource.examples.length; k++) {
      resource.examples[k].resource = resource;
    }
    return resource;
  };
  Wifl.prototype.uriTemplate = function(obj) {
    if (obj.queryParams.length) {
      function name(param) { return param.name; }
      var names = obj.queryParams.map(name).sort();
      return obj.path + "{?" + names.join(",") + "}";
    } else {
      return obj.path;
    }
  };

  // Resolve the seeAlsos of an API
  Wifl.prototype.imports = function (doc) {
    doc.resources = doc.myResources;
    doc.examples = doc.myExamples;
    for (var i=0; i<doc.seeAlso.length; i++) {
      this.imports(doc.seeAlso[i],cache);
      doc.resources = doc.resources.concat(doc.seeAlso[i].resources);
      doc.examples = doc.examples.concat(doc.seeAlso[i].examples);
    }
    for (var i=0; i<doc.myResources.length; i++) {
      doc.myResources[i].document = doc;
      doc.examples = doc.examples.concat(doc.myResources[i].examples);
    }
    for (var i=0; i<doc.myExamples.length; i++) {
      doc.myExamples[i].document = doc;
    }
    doc.resources = this.uniquify(doc.resources);
    doc.examples = this.uniquify(doc.examples);
    return doc;
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
	return new Wifl(docs).document();
      });
    }
  };

});
