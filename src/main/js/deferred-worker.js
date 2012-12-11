define(["deferred"],function(deferred) {

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
    });
    return function() {
      var id = ids++;
      var result = deferred.Deferred();
      var args = Array.prototype.slice.call(arguments);
      results[id] = result;
      worker.postMessage({ id: id, module: module, args: args });
      return result;
    };
  };

});
