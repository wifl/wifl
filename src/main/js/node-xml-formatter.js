define([], function() {

  function stringify(opts,uri,api,results) {
    var root = new Element("examples").
      attr("uri",uri).
      attr("resources",api.resources.length);
    results.forEach(function(result) {
      root.elements(result.isOk() ? passed(result.example) :
       result.isFailed() ? failed(result.example, result.error) :
       result.isNotFound() ? notFound(result.example) : 
       unsupported(result));
    })
    var indent = opts["--indent"] || "  ";
    return "<?xml version='1.0'?>" + root.format("", indent);
  }

  function passed(example) {
    return new Element("ok").
      attr("about",example.about).
      attr("method",example.request.method).
      attr("uri",example.request.uri);
  }

  function failed(example, error) {
    return new Element("failed").
      attr("about",example.about).
      attr("method",example.request.method).
      attr("uri",example.request.uri).
      elements(buildError(error)); 
  }

  function notFound(example) {
    return new Element("not-found").
      attr("about",example.about).
      attr("method",example.request.method).
      attr("uri",example.request.uri);
  }

  function buildError(error) {
    return new Element("error").
      attr("location",error.subject ? error.subject.about : error.subject).
      elements(new Element("message").text(error.message),
               new Element("property").text(error.property),
               buildValue(error.value));
  }

  function buildValue(value) {
    return value && value.message ? buildError(value) : 
      new Element("error").text(value);
  }

  function unsupported(result) {
    throw "Unsupported result: "+JSON.stringify(result);
  }

  function Element(name) {
    this.name = name;
    this.attrs = [];
    this.content = [];
    this.children = [];
    return this;
  }

  Element.prototype.format = function(indent,increment) {
    var result = indent+"<"+this.name;
    if (this.attrs.length) {
      result += " "+this.attrs.map(function(attr) {
        return attr.name + "=\"" + attr.value + "\"";
      }).join(" ");
    }
    if (this.content.length || this.children.length) {
      result += ">";
      if (this.content.length) {
        result += 
          this.content.map(function(content) {
            return content;
          }).join("\n"+indent+increment);
      }
      if (this.children.length) {
        result += "\n" + 
          this.children.map(function(child) {
            return child.format(indent+increment,increment);
          }).join("")+indent; 
      }
      result += "</"+this.name+">\n";
    } else {
      result += "/>\n";
    }
    return result;
  }

  Element.prototype.attr = function(name, value) {
    if (value) {
      this.attrs.push({name:name,value:this.escape(value)});
    }
    return this;
  }

  Element.prototype.text = function(s) {
    if (s) {
      this.content.push(this.escape(s));
    }
    return this;
  }

  Element.prototype.escape = function(s) {
    return s ?
      s.toString().
        replace(/&/g, '&amp;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;').
        replace(/"/g, '&quot;') :
      s;
  }

  Element.prototype.isEmpty = function() {
    return !this.attrs.length && !this.content.length && !this.children.length;
  }

  Element.prototype.elements = function() {
    var e = Array.prototype.slice.call(arguments);
    for(var i=0; i<e.length; i++) {
      if (e[i].isEmpty()) continue;
      this.children.push(e[i]);
    }
    return this;
  }

  return {
    stringify: stringify
  }
});
