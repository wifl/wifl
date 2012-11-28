define(["rdfa"], function (rdfa) {

  // A future value.
  function Future() {
    this.value = undefined;
    this.callbacks = [];
  }
  // Get the current value.
  Future.prototype.get = function() {
    return this.value;
  };
  // Set the current value.
  // Do nothing if the value already exists.
  // Notify all the callbacks of the new value.
  Future.prototype.set = function(value) {
    if (value !== undefined && this.value === undefined) {
      this.value = value;
      for (var i=0; i<this.callbacks.length; i++) {
        this.callbacks[i](value);
      }
      this.callbacks = undefined;
    }
    return this;
  };
  // Wait for the value to be set.
  // Calls the callbacks immediately if the value has already been set.
  Future.prototype.wait = function() {
    if (this.value === undefined) {
      Array.prototype.push.apply(this.callbacks,arguments);
    } else {
      for (var i=0; i<arguments.length; i++) {
        arguments[i](this.value);
      }
    }
    return this;
  };
  // Map a function over a future.
  Future.prototype.map = function(f) {
    var result = new Future();
    this.wait(function(x) { result.set(f(x)); });
    return result;
  }

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
  }
  // Clone a collection
  Documents.prototype.clone = function() {
    var result = new Documents();
    result.docs = this.docs.slice();
    for (var uri in this.uris) { 
      result.uris[uri] = this.uris[uri];
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
        result.docs.push(doc);
      }
    }
    return result;
  };
  // Build an XHR to fetch a document from a given URI.
  // When all XHRs are finished, set the future to be this.
  Documents.prototype.xhr = function(uri,future) {
    var xhr = new XMLHttpRequest();
    var doc = document.implementation.createHTMLDocument(uri);
    var docs = this;
    this.xhrs = this.xhrs+1 || 1;
    this.uris[uri] = doc;
    xhr.onloadend = function() {
      try {
        docs.xhrs--;
        if (xhr.responseText) {
          doc.documentElement.innerHTML = xhr.responseText;
          setURI(doc,uri);
          rdfa.attach(doc);
          docs.docs.push(doc);
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (docs.xhrs === 0) { future.set(docs); }
      }
    }
    xhr.open("GET",uri);
    xhr.send();
  }
  // Returns a future new collection given by adding URIs.
  // Returns a future whose value is 
  // this if all the URIs were already present.
  // We strip any #values off the URI.
  Documents.prototype.resolve = function() {
    var docs = this.clone();
    var result = new Future();
    for (var i=0; i<arguments.length; i++) {
      var uri = arguments[i].split("#")[0];
      if (uri.charAt(0) !== "_" && !docs.uris[uri]) {
        docs.xhr(uri,result);
      }
    }
    if (!docs.xhrs) { result.set(this); }
    return result;
  }
  // Find the fixed point of a function f
  // which maps documents to future documents.
  Documents.prototype.fix = function(step,result) {
    var result = result || new Future();
    var curr = this;
    step(curr).wait(function(next) {
      if (curr === next) {
	result.set(curr);
      } else {
	next.fix(step,result);
      }
    });
    return result;
  }
  // Get all subjects in a (subject,property,value) relation.
  Documents.prototype.getSubjects = function(property,value) {
    return flatten(this.docs.map(function (doc) {
      return doc.data.getSubjects(property,value);
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
    create: function(doc) {
      return empty.add(doc);
    }
  };

});