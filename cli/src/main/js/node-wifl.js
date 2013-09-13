// A command-line version of the WIFL validator, using node.js.

var requirejs = require("requirejs");
var jsdom = require("jsdom");
var xhr = require("xmlhttprequest");

// We add the browser context required by WIFL.
global.XMLHttpRequest = xhr.XMLHttpRequest;
global.document = jsdom.jsdom();
global.window = global.document.createWindow();
global.Element = global.window.Element;
global.Node = global.window.Node;

// The jsdom DOM implementation is missing createHTMLDocument
global.document.implementation.createHTMLDocument = function() { 
  return jsdom.jsdom();
}

// The jsdom DOM implementation is missing baseURI
Object.defineProperty(global.window.Node.prototype,"baseURI",{
  get: function() {
    var root = this.ownerDocument || this;
    var bases = root.getElementsByTagName("base");
    for (var i=0; i<bases.length; i++) {
      var uri = bases[i].getAttribute("href");
      if (uri) { return uri; }
    }
    return root.URL;
  }
});

// We add node-specific shims for the rdfa and xmllint libraries.
requirejs.config({ 
  paths: {
    rdfa: "node-rdfa",
    xmllint: "node-xmllint"
  }
})

// Partition command-line arguments between options (prefixed with "--")
// and URIs to be visited.
var uris = [];
var opts = {"--formatter": "node-txt-formatter"};
for (var i=2; i<process.argv.length; i++) {
  var arg = process.argv[i];
  if (arg.indexOf("--") == 0) {
    opts[arg] = process.argv[++i];
  } else {
    uris.push(arg);
  }
}

var formatter = opts["--formatter"];

// The main code, which gets the WIFL and validates each example.
requirejs(["wifl","validator","deferred",formatter],function(wifl,validator,deferred,formatter) {

  function Collector(uri, api) {
    this.uri = uri;
    this.api = api;
    this.remaining = api.examples.length; 
    this.results = new Array(this.remaining);
    this.promise = deferred.Deferred();
    return this;
  }

  Collector.prototype.done = function(callback) {
    this.promise.done(callback);
    return this;
  }

  Collector.prototype.addResult = function(result) {
    this.results[this.api.examples.indexOf(result.example)] = result;
    if (--this.remaining <= 0) {
      return this.promise.resolve(this);
    }
    return this;
  }

  function Result(example, status, error) {
    this.example = example;
    this.status = status;
    this.error = error;
    return this;
  }

  Result.Status = {
    OK : "OK",
    FAILED : "Failed",
    NOT_FOUND : "Not Found"
  }

  Result.prototype.isOk = function() {
    return this.status == Result.Status.OK;
  }

  Result.prototype.isFailed = function() {
    return this.status == Result.Status.FAILED;
  }

  Result.prototype.isNotFound = function() {
    return this.status == Result.Status.NOT_FOUND;
  }
  
  for(var i=0; i<uris.length; i++) {
    var arg = uris[i];
    wifl.get(arg).done(function(api) {
      var collector = new Collector(arg,api).done(function(collector) {
        console.log(formatter.stringify(opts,arg,api,collector.results));
      });
      api.examples.forEach(function(example) {
        var method = example.request.method;
        var uri = example.request.uri;
        var request = api.lookup(method,uri);
        if (request) {
          validator.checkExample(example,request).done(function() {
            collector.addResult(new Result(example, Result.Status.OK));
          }).fail(function(error) {
            collector.addResult(new Result(example, Result.Status.FAILED, error));
          });
        } else {
          collector.addResult(new Result(example, Result.Status.NOT_FOUND));
        }
      });
    });
  }
});
