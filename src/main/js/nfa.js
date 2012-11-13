define(function() {
  // Test an object for emptiness
  function isEmpty(obj) {
    for (key in obj) { return false; }
    return true;
  }
  // Lookup tables with multiple entries per value, and a default
  function Lookup() {
    this.values = {};
    this.dfault = [];
  }
  Lookup.prototype.get = function(key) {
    if (this.values.hasOwnProperty(key)) {
      return this.values[key];
    } else {
      return this.dfault;
    }
  }
  Lookup.prototype.clone = function(target) {
    target = target || new Lookup();
    for (var key in this.values) {
      target.values[key] = target.get(key).concat(this.values[key]);
    }
    if (this.dfault.length) {
      for (var key in target.values) {
        if (!this.values.hasOwnProperty(key)) {
          target.values[key] = target.values[key].concat(this.dfault);
        }
      }
      target.dfault = target.dfault.concat(this.dfault);
    }
  }
  Lookup.prototype.map = function(f) {
    var result = new Lookup();
    for (key in this.values) {
      result.values[key] = this.values[key].map(f);
    }
    result.dfault = this.dfault.map(f);
    return result;
  }
  // Transforms should have three functions:
  // apply(state,token) applies the transform, and returns the new state.
  //   It should have no effect and return undefined if the transform was unsuccessful.
  // undo(state,token) unapplies the transform, and returns the new state.
  //   It should have no effect and return undefined if the undo was unsuccessful.
  //   undo(apply(state,token),token) should return the origianl state if the appy succeeded.
  //   apply(undo(state,token),token) should return the original state if the undo succeeded.
  // token(state) should return a guess for a token for undo(state,token).
  function Transform() {
    var self = this;
    this.apply = function(state) { return state; }
    this.undo = function(state) { return state; }
    this.token = function() {}
    this.then = function(other) {
      if (other === noop) { return self; }
      var result = new Transform();
      result.apply = function(state,token) {
        state = other.apply(state,token);
        if (state) {
          var applied = self.apply(state,token);
          if (applied) {
            return applied;
          } else {
            other.undo(state,token);
          }
        }
      };
      result.undo = function(state,token) {
        state = self.undo(state,token);
        if (state) {
          var undone = other.undo(state,token);
          if (undone) {
            return undone;
          } else {
            self.apply(state,token);
          }
        }
      };
      result.token = function(state) {
        var result = self.token(state);
        if (result) { return result; }
        state = self.undo(state);
        if (state) {
          result = other.token(state);
          self.apply(state);
          return result;
        }
      };
      return result;
    }; 
  }
  // Bulid a transform
  function transform(apply,undo,token) {
    var result = new Transform();
    result.apply = apply;
    result.undo = undo;
    if (token) { result.token = token; }
    return result;
  }
  // A no-action transform
  var noop = new Transform();
  noop.then = function(other) { return other; }
  // A nondeterministic automaton with a transition table,
  // a transform to be applied whenever we enter this nfa,
  // and a list of acceptor transforms.
  var automata = 0;
  function Automaton() {
    this.uid = automata++;
    this.transitions = new Lookup();
    this.transform = noop;
    this.acceptors = [];
  }
  // Execute an automaton.
  // Returns undefined if the automaton does not accept,
  // otherwise returns the transformed state.
  Automaton.prototype.exec = function(tokens,index) {
    index = index || 0;
    if (index < tokens.length) {
      var token = tokens[index];
      var targets = this.transitions.get(token);
      for (var i=0; i<targets.length; i++) {
        var state = targets[i].exec(tokens,index+1);
        if (state) {
          state = targets[i].transform.apply(state,token);
          if (state) { return state; }
        }
      }
    } else {
      for (var i=0; i<this.acceptors.length; i++) {
        var state = this.acceptors[i].apply({});
        if (state) { return state; }
      }
    }
  }
  // Walk through an automaton.
  // Tries to find a string of tokens which generates the given state.
  Automaton.prototype.walk = function(state) {
    for (var i=0; i<this.acceptors.length; i++) {
      var undone = this.acceptors[i].undo(state);
      if (undone) {
        if (isEmpty(undone)) {
          return [];
        } else {
          state = this.acceptors[i].apply(undone);
        }
      }
    }
    var tokens = this.tokens(state);
    for (var i=0; i<tokens.length; i++) {
      var token = tokens[i];
      var targets = this.transitions.get(token);
      for (var j=0; j<targets.length; j++) {
        var target = targets[j];
        var undone = target.transform.undo(state,token);
        if (undone) {
          var result = target.walk(undone);
          if (result) {
            result.unshift(token);
            return result;
          } else {
            state = target.transform.apply(undone,token);
          }
        }
      }
    }
  };
  // The initial tokens of an automaton in a given state.
  Automaton.prototype.tokens = function(state) {
    function token(nfa) { return nfa.transform.token(state); }
    function defined(token) { return token; }
    return this.transitions.dfault.map(token).filter(defined)
      .concat(Object.keys(this.transitions.values));
  };
  // A failing automaton
  var fail = new Automaton();
  fail.text = "fail";
  fail.exec = function() { return undefined; }
  fail.walk = fail.exec;
  // An accepting automaton
  var succ = new Automaton();
  succ.acceptors = [noop];
  succ.text = "succ";
  // Deep clone of an automaton
  Automaton.prototype.deepClone = function(cache) {
    cache = cache || {};
    if (cache[this.uid]) { return cache[this.uid]; }
    var result = new Automaton();
    cache[this.uid] = result;
    result.transitions = this.transitions.map(function (x) { return x.deepClone(cache); });
    result.transform = this.transform;
    result.acceptors = this.acceptors;
    result.text = this.text;
    return result;
  }
  // Choice between two automata.
  // Throws an exception if the result is nondeterministic.
  Automaton.prototype.or = function(other) {
    if (other === fail) {
      return this;
    } else {
      var result = new Automaton();
      this.transitions.clone(result.transitions);
      other.transitions.clone(result.transitions);
      result.acceptors = this.acceptors.concat(other.acceptors);
      result.text = this.text + ".or(" + other.text + ")";
      return result;
    }
  }
  fail.or = function(other) {
    return other;
  }
  // Sequential composition of automata.
  Automaton.prototype.then = function(other) {
    if (other === fail) {
      return fail;
    } else if (other === succ) {
      return this;
    } else {
      var cache = {};
      var result = this.deepClone(cache);
      for (var uid in cache) {
        var to = cache[uid];
        var acceptors = [];
        for (var i=0; i<to.acceptors.length; i++) {
          other.onFirstTransition(to.acceptors[i]).transitions.clone(to.transitions);
          acceptors = acceptors.concat(other.acceptors.map(to.acceptors[i].then));
        }
        to.acceptors = acceptors;
        to.text = to.text + ".then(" + other.text + ")";
      }
      return result;
    }
  };
  fail.then = function(other) {
    return fail;
  };
  succ.then = function(other) {
    return other;
  };
  // Kleene closure.
  Automaton.prototype.plus = function(sep) {
    sep = sep || succ;
    var cache = {};
    var result = this.deepClone(cache);
    result.text = this.text + ".plus(" + sep.text + ")";
    var cont = sep.then(result);
    for (var uid in cache) {
      var to = cache[uid];
      for (var i=0; i<to.acceptors.length; i++) {
        cont.onFirstTransition(to.acceptors[i]).transitions.clone(to.transitions);
      }
      to.text = to.text + ".seq(" + sep.text + ".seq(" + this.text + ".plus(" + sep.text + ").optional()))";
    }
    result.text = this.text + ".plus(" + sep.text + ")";
    return result;
  };
  fail.plus = function() {
    return fail;
  };
  succ.plus = function() {
    return succ;
  };
  Automaton.prototype.star = function(sep) {
    sep = sep || succ; 
    var result = this.plus(sep);
    result.acceptors = [noop];
    result.text = this.text + ".star(" + sep.text + ")";
    return result;
  };
  fail.star = fail.plus;
  succ.star = succ.plus;
  // Optional automaton
  Automaton.prototype.optional = function() {
    var result = new Automaton();
    result.transitions = this.transitions;
    result.acceptors = [noop].concat(this.acceptors);
    result.text = this.text + ".optional()";
    return result;
  }
  fail.optional = function() { return succ; }
  succ.optional = function() { return succ; }
  // Set the priority of tokens, high to low.
  // When walking through an automaton, we look over keys in ECMAScript
  // order, that is oldest key first. So if we want to change the priority
  // of a token, we remove it from the transition table then
  // add it back in again.
  Automaton.prototype.priority = function() {
    var cache = {};
    var result = this.deepClone(cache);
    for (var uid in cache) {
      var nfa = cache[uid];
      for (var i=0; i<arguments.length; i++) {
        var token = arguments[i];
        var values = nfa.transitions.get(token);
        delete nfa.transitions.values[token];
        nfa.transitions.values[token] = values;
      }
    }
    return result;
  }
  // Apply a transform to every transition
  Automaton.prototype.onTransition = function(tr) {
    cache = {};
    var result = this.deepClone(cache);
    for (uid in cache) {
      cache[uid].transform = tr.then(cache[uid].transform);
    }
    result.text = this.text + ".onTransition(" + tr.text + ")";
    return result;
  };
  // Apply a transform to the first transition
  Automaton.prototype.onFirstTransition = function(tr) {
    if (tr === noop) {
      return this;
    } else {
      var cache = {};
      var result = new Automaton();
      result.transitions = this.transitions.map(function (target) {
        if (cache[target.uid]) {
          return cache[target.uid];
        } else {
          var copy = new Automaton();
          cache[target.uid] = copy;
          copy.transitions = target.transitions;
          copy.transform = tr.then(target.transform);
          copy.acceptors = target.acceptors;
          return copy;
        }
      });
      result.transform = noop;
      result.acceptors = this.acceptors;
      result.text = this.text + ".onFirstTransition(" + tr.text + ")";
      return result;
    }
  };
  // Apply a transform to the acceptor
  Automaton.prototype.onAccept = function(tr) {
    cache = {};
    var result = this.deepClone(cache);
    for (uid in cache) {
      cache[uid].acceptors = cache[uid].acceptors.map(tr.then);
    }
    result.text = this.text + ".onAccept(" + tr.text + ")";
    return result;    
  };
  // Apply a transform on initialization
  Automaton.prototype.onInit = function(tr) {
    return succ.onAccept(tr).then(this);
  }
  // Transform to initalize a variable
  function varInit(x) { 
    var result = new Transform();
    result.apply = function(state) {
      state[x] = state[x] || [];
      state[x].unshift([]);
      return state;
    };
    result.undo = function(state) {
      if (state[x] && state[x][0] && state[x][0].length === 0) {
        if (state[x].length === 1) {
          delete state[x];
        } else {
          state[x].shift();
        }
        return state;
      }
    };
    return result;
  }
  // Transform to store a token in a variable
  function varStore(x) { 
    var result = new Transform();
    result.apply = function(state,token) {
      if (token && state[x] && state[x][0] instanceof Array) {
        state[x][0].unshift(token);
        return state;
      }
    };
    result.undo = function(state,token) {
      if (token && state[x] && state[x][0] instanceof Array && state[x][0][0] === token) {
        state[x][0].shift();
        return state;
      }
    };
    result.token = function(state) {
      if (state[x] && state[x][0] instanceof Array) {
        return state[x][0][0];
      }
    };
    return result;
  }
  // Apply a codec to a stored value
  function varCodec(x,enc,dec) {
    var result = new Transform();
    result.apply = function(state) {
      if (state[x] instanceof Array && state[x].length) {
        var decoded = dec(state[x][0]);
        if (decoded !== undefined) {
          state[x][0] = decoded;
          return state;
        }
      }
    };
    result.undo = function(state) {
      if (state[x] instanceof Array && state[x].length) {
        var encoded = enc(state[x][0]);
        if (encoded !== undefined) {
          state[x][0] = encoded;
          return state;
        }
      }
    };
    return result;
  }
  // Store the match of an automaton in a variable
  Automaton.prototype.bind = function(x,enc,dec) {
    var result = this.onTransition(varStore(x)).onAccept(varInit(x));
    if (enc && dec) { result = result.onInit(varCodec(x,enc,dec)); } 
    result.text = this.text + ".bind(" + x + ")";
    return result;
  }
  // An automaton which recognizes one token from a list
  function token() {
    var result = new Automaton();
    for (var i=0; i<arguments.length; i++) {
      result.transitions.values[arguments[i]] = [succ];
    }
    result.text = "token(" + Array.prototype.splice.call(arguments,0).join() + ")";
    return result;
  }
  // An automaton which recognizes one token not from a list
  function tokenNot() {
    var result = new Automaton();
    result.transitions.dfault = [succ];
    for (var i=0; i<arguments.length; i++) {
      result.transitions.values[arguments[i]] = [];
    }
    result.text = "tokenNot(" + Array.prototype.splice.call(arguments,0).join() + ")";
    return result;
  }
  // Exports
  return {
    fail: fail,
    succ: succ,
    token: token,
    tokenNot: tokenNot,
    transform: transform
  }
});
