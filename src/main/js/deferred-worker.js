define(["deferred"],function(deferred) {

  if (this.Worker) {

    // If the browser has support for Web Workers, then
    // we fork off a worker for each module.
    return function(module) {
      var workerURL = require.toUrl("deferred-worker-task.js");
      var worker = new Worker(workerURL);
      var ids = 0;
      var results = {};
      worker.addEventListener("message",function(event) {
        var result = results[event.data.id];
        if (result) { 
          delete results[event.data.id];
          if (event.data.hasOwnProperty("results")) {
            result.resolve.apply(result,event.data.results);
          } else {
            result.reject.apply(result,event.data.failures);
          }
        }
      },false);
      return function() {
        var id = ids++;
        var result = deferred.Deferred();
        var args = Array.prototype.slice.call(arguments);
        results[id] = result;
        worker.postMessage({ id: id, module: module, args: args });
        return result;
      };
    };

  } else {

    // If there is no support for Web Workers, we just
    // run the module in the main thread.
    return function(module) {
      var result = deferred.Deferred();
      require([module],function(fun) { result.resolve(fun); })
      return function() {
        var args = arguments;
        return result.pipe(function(fun) {
          return fun.apply(this,args);
        });
      };
    }

  }

});
