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

// The main code, which gets the WIFL and validates each example.
requirejs(["wifl","validator"],function(wifl,validator) {
  for (var i=2; i<process.argv.length; i++) {
    var arg = process.argv[i];
    wifl.get(arg).done(function(api) {
      console.log("Found " + api.resources.length + " resources and " + api.examples.length + " examples.");
      api.examples.forEach(function(example) {
        var method = example.request.method;
        var uri = example.request.uri;
        var request = api.lookup(method,uri);
        if (request) {
          validator.checkExample(example,request).done(function() {
            console.log("Example " + method + " " + uri + " OK.");
          }).fail(function(error) {
            console.log("Example " + method + " " + uri + " Failed.");
            console.log(error);
          });
        } else {
          console.log("Example " + method + " " + uri + " not found.");
        }
      });
    });
  }
});
