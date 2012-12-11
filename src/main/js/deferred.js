// jQuery can't be loaded in a Web Worker, since it uses
// window (even for jQuery code that never touches the DOM)
// so we reimplement a subset of the deferred API for use
// in non-browser contexts.
define(function() {

  var self = this;

  function Deferred() {
    if (!(this instanceof Deferred)) { 
      return new Deferred(); 
    }
  }

  Deferred.prototype.done = function(callback) {
    if (this.results) {
      try { callback.apply(this,this.results); }
      catch (exn) {}
    } else if (this.failures) {
    } else if (this.callbacks) {
      this.callbacks.push(callback);
    } else {
      this.callbacks = [callback];
    }
    return this;
  }

  Deferred.prototype.fail = function(fallback) {
    if (this.results) {
    } else if (this.failures) {
      try { fallback.apply(this,this.failures); }
      catch (exn) {}
    } else if (this.fallbacks) {
      this.fallbacks.push(fallback);
    } else {
      this.fallbacks = [fallback];
    }
    return this;
  }
  
  Deferred.prototype.resolve = function() {
    if (!this.results && !this.failures) {
      this.results = arguments;
      if (this.callbacks) {
        for (var i=0; i<this.callbacks.length; i++) {
          try { this.callbacks[i].apply(this,arguments); } 
          catch(exn) {}
        }
        delete this.callbacks;
      }
      delete this.fallbacks;
    } 
    return this;
  }

  Deferred.prototype.reject = function() {
    if (!this.results && !this.failures) {
      this.failures = arguments;
      if (this.fallbacks) {
        for (var i=0; i<this.fallbacks.length; i++) {
          try { this.fallbacks[i].apply(this,arguments); }
          catch(exn) {}
        }
        delete this.fallbacks;
      }
      delete this.callbacks;
    }
    return this;
  }

  Deferred.prototype.state = function() {
    if (this.results) { return "resolved"; }
    else if (this.failures) { return "rejected"; }
    else { return "pending"; }
  }

  Deferred.prototype.pipe = function(yes,no) {
    var result = new Deferred();
    this.done(function() {
      if (yes) {
        try {
          var value = yes.apply(result,arguments);
          if (value instanceof Deferred) {
            value.done(function() { result.resolve.apply(result,arguments); });
          } else {
            result.resolve(value);
          }
        } catch (exn) {
          result.reject(exn);
        }
      } else {
        result.resolve.apply(result,arguments);
      }
    });
    this.fail(function() {
      if (no) {
        try {
          var value = no.apply(result,arguments);
          if (value instanceof Deferred) {
            value.fail(function() { result.reject.apply(result,arguments); });
          } else {
            result.reject(value);
          }
        } catch (exn) {
          result.reject(exn);
        }
      } else {
        result.reject.apply(result,arguments);
      }
    });
    return result;
  }

  function getText(uri) {
    var result = new Deferred();
    try {
      var xhr = new XMLHttpRequest();
      xhr.onLoad = function() { result.resolve(xhr.responseText); }
      xhr.onLoadEnd = function() { result.reject(xhr); }
      xhr.open("GET",uri);
      xhr.send();
    } catch (exn) {
      result.reject(exn);
    }
    return result;
  }
  
  function getJSON(uri) {
    return getText(uri).pipe(JSON.parse);
  }
  
  return {
    Deferred: Deferred,
    getText: getText,
    getJSON: getJSON
  };

});