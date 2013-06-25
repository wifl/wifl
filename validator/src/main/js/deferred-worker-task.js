importScripts("require.js");

function succ(id,results) {
  try {
    self.postMessage({ id: id, results: results });
  } catch (exn) {
    fail(id,[exn]);
  }
}

function fail(id,failures) {
  try {
    self.postMessage({ id: id, failures: failures });
  } catch (exn) { 
    failures = failures.map(function(failure) { return failure.toString(); });
    self.postMessage({ id: id, failures: failures });
  }
}

self.addEventListener("message",function(event) {
  var id = event.data.id;
  var module = event.data.module;
  var args = event.data.args;
  require([module],function(fun) {
    try {
      fun.apply(self,args)
        .done(function() { succ(id,Array.prototype.slice.call(arguments)); })
        .fail(function() { fail(id,Array.prototype.slice.call(arguments)); });
    } catch(exn) {
      fail(id,[exn]);
    }
  });
},false);
