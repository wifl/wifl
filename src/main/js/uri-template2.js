define(["nfa"],function(nfa) {
  // "URI Templates are for expansion and not parsing, so the use case of
  // trying to figure out which value goes with which variable is not a
  // supported use case." 
  // -- Joe Gregorio http://lists.w3.org/Archives/Public/uri/2011Aug/0024.html
  function URITemplate() {
    this.nfa = nfa.succ;
    this.vars = [];
  }
  URITemplate.prototype.expand = function(bindings) {
    var state = {};
    for (var i=0; i<this.vars.length; i++) {
      var key = this.vars[i];
      if (bindings[key] instanceof Array) {
        var array = bindings[key].filter(function(x) { 
          return x !== null && x !== undefined;
        });
        if (array.length) { state[key] = array; }
      } else if (bindings[key] !== null && bindings[key] !== undefined) {
        state[key] = [bindings[key]];
      }
    }
    var tokens = this.nfa.walk(state);
    return untokenize(tokens);
  }
  URITemplate.prototype.parse = function(string) {
    var tokens = tokenize(string);
    return this.nfa.exec(tokens);
  }
  // Tokenizer.
  // Recognizes special characters (&.=#{?};+*/) and lumps everything else together.
  // This is possibly too generous, as it allows malformed URIs, for example
  // ones containing space characters, or non-ASCII characters,
  // or incorrect uses of %.
  function tokenize(value) {
    if (value !== undefined) {
      return value.toString().match(/[&,.=#{?};+*/]|[^&,.=#{?};+*/]+/g) || [];
    }
  }
  function untokenize(tokens) {
    if (tokens) {
      return tokens.join("");
    }
  }
  // Encode and decode
  function encodeChar(chr) {
    return "%"+chr.charCodeAt(0).toString(16).toUpperCase();
  }
  function encTokens(string) {
    // Magic from http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.htm
    // for translating a UTF16 string to UTF8
    var utf8 = unescape(encodeURIComponent(string));
    var escaped = utf8.replace(/[^a-zA-Z0-9-._~]/g,encodeChar);
    return tokenize(escaped);
  }
  function encReservedTokens(string) {
    var utf8 = unescape(encodeURIComponent(string));
    var escaped = utf8.replace(/[^a-zA-Z0-9-._~:\/?#\[\]@!$&'()*+,;=]/g,encodeChar);
    return tokenize(escaped);
  }
  function decTokens(tokens) {
    if (tokens) {
      return decodeURIComponent(untokenize(tokens));
    }
  }
  // Automata for URI Templates.
  // Atoms -- again we're being generous here, and allowing any non-special
  // character to occur in a string, not just unreserved characters.
  // Note that *, +, { and } aren't special in URIs (just in URI templates).
  var WORD = nfa.tokenNot("&",",","=","#","?",";","/").plus();
  var VARNAME = nfa.tokenNot("&",",",".","=","#","{","?","}",";","+","*","/");
  var ANYTHING = nfa.tokenNot().plus();
  var AMPERSAND = nfa.token("&");
  var COMMA = nfa.token(",");
  var DOT = nfa.token(".");
  var EQUALS = nfa.token("=");
  var HASH = nfa.token("#");
  var LBRACE = nfa.token("{");
  var PLUS = nfa.token("+");
  var QUERY = nfa.token("?");
  var RBRACE = nfa.token("}");
  var SEMI = nfa.token(";");
  var SLASH = nfa.token("/");
  var STAR = nfa.token("*");
  // Regex which matches URI templates,
  // and builds a NFA for that template.
  var constant = nfa.transform(function(state,token) {
    state.nfa = nfa.token(token).then(state.nfa);
    return state;
  });
  var lbrace = nfa.transform(function(state) {
    var result = state.rest;
    result.vars = state.vars.map(function(varr){return varr.name;}).concat(result.vars);
    result.nfa = state.modifier(state.vars).then(result.nfa);
    return result;
  });
  var rbrace = nfa.transform(function(state) { return { 
    vars: [], 
    exploded: false, 
    modifier: simpleVars, 
    rest: state 
  }; });
  var variable = nfa.transform(function(state,token) {
    state.vars.unshift({ name: token, exploded: state.exploded });
    state.exploded = false;
    return state;
  });
  var star = nfa.transform(function(state) {
    state.exploded = true;
    return state;
  });
  var accept = nfa.transform(function() {
    return new URITemplate();
  });
  function modify(modifier) { return nfa.transform (function(state) {
    state.modifier = modifier;
    return state;
  }); }
  var modifier =
    HASH.onTransition(modify(fragmentVars)) 
       .or(PLUS.onTransition(modify(reservedVars)))
       .or(DOT.onTransition(modify(dotVars)))
       .or(SLASH.onTransition(modify(slashVars)))
       .or(SEMI.onTransition(modify(pathVars)))
       .or(QUERY.onTransition(modify(queryVars)))
       .or(AMPERSAND.onTransition(modify(contVars)));
  var uritRegex =
       nfa.tokenNot("{","}").onTransition(constant)
       .or(LBRACE.onTransition(lbrace)
           .then(modifier.optional())
           .then(VARNAME.onTransition(variable).then(STAR.onTransition(star).optional()).plus(COMMA))
           .then(RBRACE.onTransition(rbrace)))
       .star().onAccept(accept);
  // Simple String expansion {var}
  function simpleVars(vars,PRE,OUTER,VALUE,enc,dec) {
    OUTER = OUTER || PRE || COMMA;
    PRE = PRE || nfa.succ;
    VALUE = VALUE || WORD;
    enc = enc || encTokens;
    dec = dec || decTokens;
    var result = nfa.fail;
    while (vars.length) {
      var varr = vars.pop();
      var INNER = (varr.exploded? OUTER: COMMA);
      result = 
        VALUE.optional().bind(varr.name,enc,dec).plus(INNER)
        .then(OUTER.then(result).optional())
        .or(result);
    }
    return PRE.then(result).optional();
  };
  // Reserved expansion {+var}
  function reservedVars(vars) {
    return simpleVars(vars,nfa.succ,COMMA,ANYTHING,encReservedTokens);
  }
  // Fragment expansion {#var}
  function fragmentVars(vars) {
    return simpleVars(vars,HASH,COMMA,ANYTHING,encReservedTokens);
  }
  // Label expansion with dot-prefix {.var}
  function dotVars(vars) {
    return simpleVars(vars,DOT);
  }
  // Path segment expansion {/var}
  function slashVars(vars) {
    return simpleVars(vars,SLASH);
  }
  // Path-style parameter epansion {;var}
  function pathVars(vars,exploded) {
    return SEMI.then(queryField(vars,true)).star();
  }
  // Form-style query expansion {?var}
  function queryVars(vars) {
    return QUERY.then(queryField(vars).star(AMPERSAND)).optional();
  }
  // Form-style query continuation {&var}
  function contVars(vars) {
    return AMPERSAND.then(queryField(vars)).star();
  }
  // Query fields
  function queryField(vars,equalsOptional) {
    var result = nfa.fail;
    for (var i=0; i<vars.length; i++) {
      var varr = vars[i];
      var field = EQUALS.then(WORD.optional().bind(varr.name,encTokens,decTokens).plus(COMMA));
      if (equalsOptional) { field = field.or(nfa.succ.bind(varr.name,encTokens,decTokens)); }
      field = nfa.token(varr.name).then(field);
      if (varr.exploded) {
        field = field.priority("&",";",",","=");
      } else {
        field = field.priority(",","&",";","=");
      }
      result = result.or(field);
    }
    return result;
  }
  // Exports
  return {
    regex: uritRegex,
    parse: function(string) { 
      var result = uritRegex.exec(tokenize(string));
      if (result) {
        result.text = string;
        return result;
      }
    }
  };
});