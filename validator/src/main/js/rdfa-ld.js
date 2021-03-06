require.config({
    shim: { "rdfa": { exports: "RDFa" } }
});

define(["rdfa","deferred"], function (rdfa,deferred) {

  // Find the base URI of a document
  function getURI(doc) {
    var bases = doc.getElementsByTagName("base");
    for (var i=0; i<bases.length; i++) {
      var uri = bases[i].getAttribute("href");
      if (uri) { return uri; }
    }
    return doc.URL;
  }
  // Set the URI of a document
  function setURI(doc,uri) {
    var base = doc.createElement("base");
    base.setAttribute("href",uri);
    doc.documentElement.children[0].appendChild(base);
  }

  // Flatten an array of arrays to an array
  var emptyArray = [];
  function flatten(arrays) {
    return emptyArray.concat.apply(emptyArray,arrays);
  }

  // A collection of documents
  function Documents() {
    this.docs = [];
    this.uris = {};
    this.mapping = {};
  }
  // Clone a collection
  Documents.prototype.clone = function() {
    var result = new Documents();
    result.docs = this.docs.slice();
    for (var uri in this.uris) { 
      result.uris[uri] = this.uris[uri];
    }
    for (var from in this.mapping) {
      result.mapping[from] = this.mapping[from];
    }
    return result;
  };
  // Returns a new collection given by adding documents.
  // Returns this if all the documents were already present.
  Documents.prototype.add = function() {
    var result = this;
    for (var i=0; i<arguments.length; i++) {
      var doc = arguments[i];
      var uri = getURI(doc);
      if (!result.uris[uri]) {
        if (result === this) { result = this.clone(); }
        result.uris[uri] = doc;
        rdfa.attach(doc);
        for (from in this.mapping) {
          var to = this.mapping[from];
          doc.data.setMapping(from,to);
        }
        result.docs.push(doc);
      }
    }
    return result;
  };
  // Build an XHR to fetch a document from a given URI.
  // When all XHRs are finished, set the future to be this.
  // We silently ignore any failed XHRs.
  Documents.prototype.xhr = function(uri,result) {
    var xhr = new XMLHttpRequest();
    var doc = document.implementation.createHTMLDocument(uri);
    var docs = this;
    var loading = true;
    result = result || deferred.Deferred();
    this.xhrs = this.xhrs+1 || 1;
    this.uris[uri] = doc;
    function loaded() {
      if (loading) { try {
        loading = false;
        docs.xhrs--;
        if (xhr.responseText) {
          doc.documentElement.innerHTML = xhr.responseText;
          setURI(doc,uri);
          rdfa.attach(doc);
          for (from in docs.mapping) {
            var to = docs.mapping[from];
            doc.data.setMapping(from,to);
          }
          docs.docs.push(doc);
        }
      } catch (e) {
        console.log("RDFa-LD failed GET: " + uri);
        console.log(e);
      } finally {
        if (docs.xhrs === 0) { result.resolve(docs); }
      } }
    };
    try {
      xhr.addEventListener("load",loaded);
      xhr.addEventListener("error",loaded);
      xhr.addEventListener("abort",loaded);
      xhr.open("GET",uri);
      xhr.send();
    } catch (e) {
      console.log("RDFa-LD failed GET: " + uri);
      console.log(e);
      loaded();
    } finally {
      return result;
    }
  }
  // Returns a future new collection given by adding URIs.
  // Returns a future whose value is 
  // this if all the URIs were already present.
  // We strip any #values off the URI.
  Documents.prototype.resolve = function() {
    var docs = this.clone();
    var result = deferred.Deferred();
    for (var i=0; i<arguments.length; i++) {
      var uri = arguments[i].split("#")[0];
      if (uri.charAt(0) !== "_" && !docs.uris[uri]) {
        docs.xhr(uri,result);
      }
    }
    if (!docs.xhrs) { result.resolve(this); }
    return result;
  }
  // Find the fixed point of a function f
  // which maps documents to future documents.
  Documents.prototype.fix = function(step,result) {
    var curr = this;
    result = result || deferred.Deferred();
    step(curr).done(function(next) {
      if (curr === next) {
	result.resolve(curr);
      } else {
	next.fix(step,result);
      }
    }).fail(function(err) {
      result.reject(err);
    });
    return result;
  }
  // Get all subjects in a (subject,property,value) relation.
  Documents.prototype.getSubjects = function(property,value) {
    return flatten(this.docs.map(function (doc) {
      return doc.data.getSubjects(property,value);
    }));
  }
  // Get all properties of a subject
  Documents.prototype.getProperties = function(subject) {
    return flatten(this.docs.map(function (doc) {
      return doc.data.getProperties(subject);
    }));
  }
  // Get all values in a (subject,property,value) relation.
  Documents.prototype.getValues = function(subject,property) {
    return flatten(this.docs.map(function (doc) {
      return doc.data.getValues(subject,property);
    }));
  }
  // Get all targets of the given properties.
  Documents.prototype.getTargets = function() {
    var properties = Array.prototype.slice.call(arguments);
    return flatten(properties.map(function (property) {
      return this.getValues(null,property);
    },this));
  }
  // Recursively resolve all targets of a set of properties.
  Documents.prototype.resolveTargets = function() {
    var properties = arguments;
    return this.fix(function (docs) {
      var targets = docs.getTargets.apply(docs,properties);
      return docs.resolve.apply(docs,targets);
    });
  }
  // Add a vocabulary prefix
  Documents.prototype.setMapping = function(from,to) {
    this.docs.forEach(function(doc) {
      doc.data.setMapping(from,to);
    });
    this.mapping[from] = to;
    return this;
  };
  // Get the base URIs of each docment
  Documents.prototype.getURIs = function() {
    return this.docs.map(getURI);
  };
  // Get the base URI of the document used to create this
  // document collection.
  Documents.prototype.getURI = function() {
    if (this.docs.length) {
      return getURI(this.docs[0]);
    }
  };

  var empty = new Documents();

  return {
    build: function() { return empty.add.apply(empty,arguments); },
    get: function() { return empty.resolve.apply(empty,arguments); }
  };

});