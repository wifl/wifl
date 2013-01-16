// A node.js program to read RDFa and write graphviz.

var requirejs = require("requirejs");
var fs = require("fs");
var jsdom = require("jsdom");
var xhr = require("xmlhttprequest");
var url = require("url");

// We add the browser context required by RDFa.
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

// Convert a relative URI to an absolute URI by resoving wrt cwd.
var cwd = "file://" + process.cwd() + "/";
function absoluteURI(uri) {
  return url.resolve(cwd,uri);
}

// Write text
function Writer(base,vocab) {
  if (base) {
    this.base = base;
    this.baseDir = url.resolve(base,"./");
    this.baseHash = base + "#";
  }
  this.vocab = vocab;
}

Writer.prototype.write = function() {
  for (var i=0; i<arguments.length; i++) {
    process.stdout.write(arguments[i]);
  }
}

// Rather annoyingly, the RDF library doesn't export the default
// prefix map, so we recreate it here.

var rdfaPrefixes = {
  "http://creativecommons.org/ns#": "cc",
  "http://www.w3.org/2008/content#": "cnt",
  "http://commontag.org/ns#": "ctag",
  "http://purl.org/dc/terms/": "dc",
  "http://www.w3.org/ns/dcat#": "dcat",
  "http://purl.org/dc/terms/": "dcterms",
  "http://www.w3.org/ns/earl#": "earl",
  "http://xmlns.com/foaf/0.1/": "foaf",
  "http://www.w3.org/ns/people#": "gldp",
  "http://purl.org/goodrelations/v1#": "gr",
  "http://www.w3.org/2003/g/data-view#": "grddl",
  "http://www.w3.org/2006/http#": "ht",
  "http://www.w3.org/2002/12/cal/icaltzd#": "ical",
  "http://www.w3.org/ns/ma-ont#": "ma",
  "http://ogp.me/ns#": "og",
  "http://www.w3.org/ns/org#": "org",
  "http://www.w3.org/2002/07/owl#": "owl",
  "http://www.w3.org/2009/pointers#": "ptr",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#": "rdf",
  "http://www.w3.org/ns/rdfa#": "rdfa",
  "http://www.w3.org/2000/01/rdf-schema#": "rdfs",
  "http://purl.org/stuff/rev#": "rev",
  "http://www.w3.org/2007/rif#": "rif",
  "http://schema.org/": "schema",
  "http://www.w3.org/ns/sparql-service-description#": "sd",
  "http://rdfs.org/sioc/ns#": "sioc",
  "http://www.w3.org/2004/02/skos/core#": "skos",
  "http://www.w3.org/2008/05/skos-xl#": "skosxl",
  "http://rdf.data-vocabulary.org/#": "v",
  "http://www.w3.org/2006/vcard/ns#": "vcard",
  "http://rdfs.org/ns/void#": "void",
  "http://www.w3.org/2007/05/powder#": "wdr",
  "http://www.w3.org/2007/05/powder-s#": "wdrs",
  "http://www.w3.org/1999/xhtml/vocab#": "xhv",
  "http://www.w3.org/XML/1998/namespace": "xml",
  "http://www.w3.org/2001/XMLSchema#": "xsd"
};

var rdfaTerms = {   
  "http://www.w3.org/1999/xhtml/vocab#alternate": "alternate",
  "http://www.w3.org/1999/xhtml/vocab#appendix": "appendix",
  "http://www.w3.org/1999/xhtml/vocab#bookmark": "bookmark",
  "http://www.w3.org/1999/xhtml/vocab#chapter": "chapter",
  "http://www.w3.org/1999/xhtml/vocab#cite": "cite",
  "http://www.w3.org/1999/xhtml/vocab#contents": "contents",
  "http://www.w3.org/1999/xhtml/vocab#copyright": "copyright",
  "http://www.w3.org/2007/05/powder-s#describedby": "describedby",
  "http://www.w3.org/1999/xhtml/vocab#first": "first",
  "http://www.w3.org/1999/xhtml/vocab#glossary": "glossary",
  "http://www.w3.org/1999/xhtml/vocab#help": "help",
  "http://www.w3.org/1999/xhtml/vocab#icon": "icon",
  "http://www.w3.org/1999/xhtml/vocab#index": "index",
  "http://www.w3.org/1999/xhtml/vocab#last": "last",
  "http://www.w3.org/1999/xhtml/vocab#license": "license",
  "http://www.w3.org/1999/xhtml/vocab#meta": "meta",
  "http://www.w3.org/1999/xhtml/vocab#next": "next",
  "http://www.w3.org/1999/xhtml/vocab#p3pv1": "p3pv1",
  "http://www.w3.org/1999/xhtml/vocab#prev": "prev",
  "http://www.w3.org/1999/xhtml/vocab#previous": "previous",
  "http://www.w3.org/1999/xhtml/vocab#related": "related",
  "http://www.w3.org/1999/xhtml/vocab#role": "role",
  "http://www.w3.org/1999/xhtml/vocab#role": "role",
  "http://www.w3.org/1999/xhtml/vocab#section": "section",
  "http://www.w3.org/1999/xhtml/vocab#start": "start",
  "http://www.w3.org/1999/xhtml/vocab#stylesheet": "stylesheet",
  "http://www.w3.org/1999/xhtml/vocab#subsection": "subsection",
  "http://www.w3.org/1999/xhtml/vocab#top": "top",
  "http://www.w3.org/1999/xhtml/vocab#transformation": "transformation",
  "http://www.w3.org/1999/xhtml/vocab#up": "up"
}

// Shorthand for a URI
Writer.prototype.shorthand = function(uri) {
  if (uri === this.base) {
    return ".";
  } else if (uri === this.baseDir) {
    return "..";
  } else if (uri.indexOf(this.vocab) === 0) {
    return uri.substring(this.vocab.length);
  } else if (uri.indexOf(this.baseHash) === 0) {
    return uri.substring(this.base.length);
  } else if (uri.indexOf(this.baseDir) === 0) {
    return uri.substring(this.baseDir.length);
  } else if (rdfaTerms[uri]) {
    return rdfaTerms[uri];
  } else {
    for (prefix in rdfaPrefixes) {
      if (uri.indexOf(prefix) === 0) {
        return rdfaPrefixes[prefix] + ":" + uri.substring(prefix.length);
      }
    }
    return uri;
  }
}

// HTML-escape a string
Writer.prototype.escape = function(string) {
  return string.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// Write a graph in dot format
Writer.prototype.writeGraph = function(graph) {
  this.write('digraph rdfa {');
  for (subject in graph.subjects) {
    var subj = this.shorthand(subject);
    this.write('\n  "',subj,'" [ shape="none", margin="0", label=<<table cellborder="1" cellspacing="-1">');
    this.write('\n    <tr><td border="1">',this.escape(subj));
    var types = Object.keys(graph.types[subject]);
    if (types.length) {
      this.write(' : ',types.map(this.shorthand,this).join(' &amp; '));
    }
    this.write('</td></tr>\n    <tr><td><table cellspacing="0" border="0">');
    for (attribute in graph.attributes[subject]) {
      var values = Object.keys(graph.attributes[subject][attribute]);
      this.write('\n    <tr><td align="right">',this.shorthand(attribute),' =</td><td align="left">');
      if (values.length === 1) {
        this.write(this.shorthand(values[0]));
      } else {
        this.write('[',values.map(this.shorthand,this).join(','),']');
      }
      this.write('</td></tr>');
    }
    this.write('\n    </table></td></tr></table>> ]');
    for (var property in graph.properties[subject]) {
      var prop = this.shorthand(property);
      for (var object in graph.properties[subject][property]) {
        var obj = this.shorthand(object);
        this.write('\n  "',subj,'" -> "',obj,'" [ label=<',this.escape(prop),'> ]');
      }
    }
  }
  this.write('\n}\n');
}

// A graph
function Graph() {
  this.subjects = {};
  this.attributes = {};
  this.properties = {};
  this.types = {};
}

// Add a subject
Graph.prototype.addSubject = function(subject) {
  if (!this.subjects[subject]) {
    this.subjects[subject] = true;
    this.attributes[subject] = {};
    this.properties[subject] = {};
    this.types[subject] = {};
  }
}

// Add an attribute
Graph.prototype.addAttribute = function(subject,attribute,value) {
  this.addSubject(subject);
  var attributes = this.attributes[subject];
  var values = attributes[attribute];
  if (!values) { attributes[attribute] = values = {}; }
  values[value] = true;
}

// Add a property
Graph.prototype.addProperty = function(subject,property,object) {
  this.addSubject(subject);
  var properties = this.properties[subject];
  var objects = properties[property];
  if (!objects) { properties[property] = objects = {}; }
  objects[object] = true;
}

// Add a type
Graph.prototype.addType = function(subject,type) {
  this.addSubject(subject);
  var types = this.types[subject];
  types[type] = true;
}

// Load the node-wrapped rdfa library.
requirejs.config({ paths: { rdfa: "node-rdfa" } });

// The main program, which reads an RDFa file and writes dot.
requirejs(["rdfa-ld"],function(rdfaLD) {
  var nodejs = process.argv.shift();
  var script = process.argv.shift();
  var uris = process.argv.map(absoluteURI);
  rdfaLD.get.apply(rdfaLD,uris).done(function(docs) {
    try {
      var base = uris[0].replace(/#.*/,"");
      var vocab = docs.getValues(base,"rdfa:usesVocabulary")[0];
      var out = new Writer(base,vocab);
      var graph = new Graph();
      var subjects = {};
      docs.getSubjects().forEach(function(subject) {
        subjects[subject] = true;
      });
      while (uris.length) {
        var subject = uris.shift();
        if (!graph.subjects[subject]) {
          graph.addSubject(subject);
          docs.getProperties(subject).forEach(function(property) {
            if (property === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
              docs.getValues(subject,property).forEach(function (type) {
                graph.addType(subject,type);
              });
            } else {
              docs.getValues(subject,property).forEach(function(value) {
                if (subjects[value]) {
                  graph.addProperty(subject,property,value);
                  uris.push(value);
                } else {
                  graph.addAttribute(subject,property,value);
                }
              });
            }
          });
        }
      }
      out.writeGraph(graph);
    } catch (err) {
      process.stderr.write(err);
      process.exit(1);
    }
  }).fail(function(err) {
    process.stderr.write(err);
    process.exit(1);
  });
});  

  // for (var i=2; i<process.argv.length; i++) {
  //   var filename = process.argv[i];
  //   var html = fs.readFileSync(filename);
  //   var doc = jsdom.jsdom(html);
  //   rdfa.attach(doc);
  //   var vocab = doc.data.getValues(null,"rdfa:usesVocabulary")[0];
  //   var vocabHash = vocab + "#";
  //   var baseURI = doc.baseURI;
  //   var baseURIHash = baseURI + "#";
  //   var baseDir = url.resolve(doc.baseURI,"..");
  //   var baseDirSlash = baseDir + "/";
  //   function shorthand(uri) {
  //     if (uri.indexOf(vocabHash) === 0) {
  //       return uri.substring(vocab.length);
  //     } else if (uri.indexOf(baseURIHash) === 0) {
  //       return uri.substring(baseURI.length);
  //     } else if (uri.indexOf(baseDirSlash) === 0) {
  //       return uri.substring(baseDirSlash.length);
  //     } else {
  //       return uri;
  //     }
  //   }
  //   doc.data.getSubjects().forEach(function(subject) {
  //     subject = shorthand(subject);
  //     graph.addSubject(subject);
  //     doc.data.get.forEach
  //   });

  // });
  //   subjects.forEach(function(subject) {
  //     var properties = doc.data.getProperties(subject);
  //     var types = [];
  //     var labels = [];
  //     properties.forEach(function(property) {
  //       var values = doc.data.getValues(subject,property);
  //       values.forEach(function(value) {
  //         if (property === "http://www.w3.org/ns/rdfa#usesVocabulary") {
  //         } else if (property === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
  //           types.push(shorthand(value));
  //         } else if (0 <= subjects.indexOf(value)) {
  //           var edge = graph.addEdge(subject,value);
  //           edge.set("label",shorthand(property));
  //         } else {
  //           labels.push(shorthand(property) + " = " + escape(value));
  //         }
  //       });
  //     });
  //     var node = graph.addNode(subject);
  //     var label = shorthand(subject);
  //     if (types.length) {
  //       label = label + " : " + types.join("&");
  //     }
  //     if (labels.length) {
  //       label = label + "\\l" + labels.join("\\l");
  //     }
  //     node.set("label",label);
  //     node.set("shape","box");
  //   });
  // }
// });

