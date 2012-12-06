define(function() {

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

  // Exports.  
  return {
    build: function() { return new Future(); }
  };

});