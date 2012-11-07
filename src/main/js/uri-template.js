// A URI Template Processor wrapped in a generator function
// packaged as a RequireJS module.
//
// To use this module, include it as a required module in a "require" call.
// e.g. 
//   require(["uri-template"], function(uriTemplateProcessorGenerator) {
//      // your code here
//   });
//
// Your code will need to provide a URI template string and a binding object
// to supply the values of variables referenced in the template.  
// The binding object must contain a "get" function that takes 
//   - a variable name 
//   - a boolean indicating whether the template expects the
//     variable to be explodable, i.e. an array or an object.  The function may
//     use this to determine whether it needs to construct an explodable
//     from a string, for instance.
// The "get" function returns the variable's value.  
// 
// The code that uses the module will then look like
//   var binding = {
//      get: function(name, explodable) {
//         // return the value of the template variable named 'name'
//      }
//   }
//   // Create a URI template processor for a template string.
//   var uriTemplateProcessor = uriTemplateProcessorGenerator.create(template);
//   try {
//     // Expand the template with the variable values provided by binding
//     var expansion = uriTemplateProcessor.expand(binding);
//     // ...
//   } catch (err) {
//     // an error occurred in template processing
//     // the "err" object contains:
//     //   "expansion": a partial expansion
//     //   "errors": an array of error objects, each of which contains:
//     //      "message": an error message,
//     //      "index": the error's character offset in the template
//   }
//
// See
//   http://tools.ietf.org/html/rfc6570
//   http://requirejs.org/docs/api.html

define(function () {
	//http://tools.ietf.org/html/rfc6570
	function UriTemplateProcessor(template) {

		function Scanner(input) {
			var i = 0;
			var s = input;

			this.reset = function() {
				i = 0;
			};
			this.nextChar = function() {
				if (i < s.length) {
					if (s[i] == '%') {
						if (s.length-i > 2) {
							var pct = s.substr(i,3);
							if (isPctEncoded(pct)) {
								i += 3;
								return pct;
							}
						}
					}
					return s[i++];
				}
				return null;
			};
			this.lastScannedCharIndex = function() {
				return i-1;
			};
			this.remainder = function() {
				return s.substring(i);
			};
		}

		var UCSCHAR_RANGES = [
		                      ['\u00A0', '\uD7FF'], ['\uF900', '\uFDCF'], ['\uFDF0', '\uFFEF'],
		                      ['\u10000', '\u1FFFD'], ['\u20000', '\u2FFFD'], ['\u30000', '\u3FFFD'],
		                      ['\u40000', '\u4FFFD'], ['\u50000', '\u5FFFD'], ['\u60000', '\u6FFFD'],
		                      ['\u70000', '\u7FFFD'], ['\u80000', '\u8FFFD'], ['\u90000', '\u9FFFD'],
		                      ['\uA0000', '\uAFFFD'], ['\uB0000', '\uBFFFD'], ['\uC0000', '\uCFFFD'],
		                      ['\uD0000', '\uDFFFD'], ['\uE1000', '\uEFFFD']
		                      ];

		var IPRIVATE_RANGES = [
		                       ['\uE000', '\uF8FF'],  ['\uF0000', '\uFFFFD'],  ['\u100000', '\u10FFFD']
		                       ];

		var LITERALCHAR_RANGES = [
		                          ['\x21'], ['\x23', '\x24'], ['\x26'], ['\x28', '\x3B'], ['\x3D'], ['\x3F', '\x5B'],
		                          ['\x5D'], ['\x5F'], ['\x61', '\x7A'], ['\x7E']
		                          ];

		function isInARange(c, ranges) {
			for (var i=0; i<ranges.length; i++) {
				var range = ranges[i];
				if (range.length == 1 && range[0] == c) {
					return true;
				}
				if (range[0] <= c && c <= range[1]) {
					return true;
				}
			}
			return false;
		}

		function isAlpha(c) {
			return ('A' <= c && c <= 'Z') || ('a' <= c && c <= 'z');
		}
		function isDigit(c) {
			return '0' <= c && c <= '9';
		}
		function isHexDigit(c) {
			return isDigit(c) || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f');
		}
		function isPctEncoded(s) {
			return s && s.length == 3 && s[0] == "%" && isHexDigit(s[1]) && isHexDigit(s[2]);
		}
		function isUnreserved(c) {
			return isAlpha(c) || isDigit(c) || "-._~".indexOf(c) >= 0;
		}
		function isReserved(c) {
			return isGenDelim(c) || isSubDelim(c);
		}
		function isUnreservedOrReserved(c) {
			return isUnreserved(c) || isReserved(c);
		}
		function isGenDelim(c) {
			return ":/?#[]@".indexOf(c) >= 0;
		}
		function isSubDelim(c) {
			return "!$&'()*+,;=".indexOf(c) >= 0;
		}
		function isVarChar(c) {
			return isAlpha(c) || isDigit(c) || c == "_" || isPctEncoded(c);
		}
		function isUcsChar(c) {
			return isInARange(c, UCSCHAR_RANGES);
		}
		function isIPrivate(c) {
			return isInARange(c, IPRIVATE_RANGES);
		}
		function isLiteralChar(c) {
			return isInARange(c, LITERALCHAR_RANGES) || isUcsChar(c) || isIPrivate(c);
		}
		function isArray(a) {
			return Object.prototype.toString.apply(a) === '[object Array]';
		}
		function isObject(o) {
			return typeof o === 'object';
		}
		var EXPRESSION_SETTINGS = {
				null : {first:"",  sep:",", named:false, ifemp:"",  allow:isUnreserved},
				'+'  : {first:"",  sep:",", named:false, ifemp:"",  allow:isUnreservedOrReserved},
				'.'  : {first:".", sep:".", named:false, ifemp:"",  allow:isUnreserved},
				'/'  : {first:"/", sep:"/", named:false, ifemp:"",  allow:isUnreserved},
				';'  : {first:";", sep:";", named:true,  ifemp:"",  allow:isUnreserved},
				'?'  : {first:"?", sep:"&", named:true,  ifemp:"=", allow:isUnreserved},
				'&'  : {first:"&", sep:"&", named:true,  ifemp:"=", allow:isUnreserved},
				'#'  : {first:"#", sep:",", named:false, ifemp:"",  allow:isUnreservedOrReserved}
		};
		function isExpressionOperator(c) {
			return EXPRESSION_SETTINGS.hasOwnProperty(c);
		}
		function expressionSettings(operator) {
			return EXPRESSION_SETTINGS[operator];
		}
		function encodeLiteral(s) {
		        return encodeURIComponent(decodeURIComponent(s));
		}
		function unicodeLength(s) {
			// TODO
			return s.length;
		}
		function unicodePrefix(s, n) {
			// TODO
			return s.substr(0, n);
		}
		function pctEncodeDisallowed(s, allowFunction) {
			var r = "";
			for (var i=0; i<s.length; i++) {
				var c = s[i];
				if (allowFunction(c)) {
					r += c;
				} else {
					r += "!".indexOf(c) >= 0 ? escape(c) : encodeURIComponent(c);
				}
			}
			return r;
		}
		
		function Error(message, index, result, isFatal) {
			this.message = message;
			this.index = index;
			this.result = result;
			this.isFatal = isFatal;
		}
		
		function Literal(s, err) {
			var string = s;
			if (err) {
				this.error = err;
			}
			
			this.expand = function(binding) {
				return string;
			}
		}
		
		function Expression(s) {
			var operator = isExpressionOperator(s[0]) ? s[0] : null;
			var varSpecs = [];
			
			var exprScanner = new Scanner(operator == null ? s : s.substr(1));
			var varSpecBuilder = new VarSpecBuilder(exprScanner);
			try {
				var varSpec;
				while ((varSpec = varSpecBuilder.nextVarSpec()).name.length > 0) {
					varSpecs.push(varSpec);
				}
			} catch (err) {
				this.error = new Error(err.message, err.index, 
					"{" + 
					operator || ""+
					err.varSpec.name+
					err.varSpec.modifier || ""+
					err.varSpec.prefix || ""+
					exprScanner.remainder()+
					"}", false)
			}
			
			function forEachDefinedItem(o, n, f) {
				if (isArray(o)) {
					for (var i=0; i<o.length; i++) {
						if (o[i]) {
							f(n, o[i]);
						}
					}
				} else if (isObject(o)) {
					for (var p in o) {
						if (o.hasOwnProperty(p) && o[p]) {
							f(p, o[p]);
						}
					}
				} else {
				    f(n, o);
				}
			}
			
			function isEmpty(o) {
			    for (var p in o) {
			        if (o.hasOwnProperty(p) && o[p]) {
			        	return false;
			        }
			    }
			    return true;
			}
			
			function isUndefined(value) {
				return value == undefined ||
					(isArray(value) && value.length == 0) ||
					(isObject(value) && isEmpty(value));
			}
			
			this.expand = function(binding) {
				if (this.error) {
					return this.error.result;
				}
				var expansion = "";
				var exprSettings = expressionSettings(operator);
				var isFirst = true;
				for (var i=0; i<varSpecs.length; i++) {
					var varSpec = varSpecs[i];
					var value = binding.get(varSpec.name, varSpec.explode);
					if (isUndefined(value)) { continue }
					if (isFirst) {
						expansion += exprSettings.first;
						isFirst = false;
					} else {
						expansion += exprSettings.sep;
					}
					if (typeof(value) == "string") {
						if (exprSettings.named) {
							expansion += encodeLiteral(varSpec.name);
							if (value.length == 0) {
								expansion += exprSettings.ifemp;
								continue;
							}
							expansion += "=";
						}
						if (varSpec.prefix && (varSpec.prefix < unicodeLength(value))) {
							expansion += pctEncodeDisallowed(unicodePrefix(value, varSpec.prefix), exprSettings.allow);
						} else {
							expansion += pctEncodeDisallowed(value, exprSettings.allow);
						}
					} else if (varSpec.prefix) {
					    throw {
						message: "Prefix modifiers are not applicable to variables that have composite values.",
						varSpec: varSpec
					    }
					} else if (!varSpec.explode) {
						if (exprSettings.named) {
							expansion += encodeLiteral(varSpec.name);
							if (!value || value.length == 0) {
								expansion += exprSettings.ifemp;
								continue;
							}
							expansion += "=";
						}
						if (!isObject(value)) {
						    expansion += pctEncodeDisallowed(value.toString(), exprSettings.allow);
						    continue;
						}
						var isList = isArray(value);
						var sep = "";
						forEachDefinedItem(value, varSpec.name, function(n, v) {
							expansion += sep;
							if (isList) {
								expansion += pctEncodeDisallowed(v, exprSettings.allow);
							} else {
								expansion += n+","+pctEncodeDisallowed(v, exprSettings.allow);
							}
							sep = ',';
						})
					} else {
						var isList = isArray(value);
						var sep = "";
						if (exprSettings.named) {
							forEachDefinedItem(value, varSpec.name, function(n, v) {
								expansion += sep;
								if (isList) {
									expansion += encodeLiteral(varSpec.name);
								} else {
									expansion += encodeLiteral(n);
								}
								if (!v || v.length == 0) {
									expansion += exprSettings.ifemp;
								} else {
									expansion += "="+pctEncodeDisallowed(v, exprSettings.allow);
								}
								sep = exprSettings.sep;
							});
						} else {
							forEachDefinedItem(value, null, function(n, v) {
								expansion += sep;
								if (isList) {
									expansion += pctEncodeDisallowed(v, exprSettings.allow);
								} else {
									if (v) {
										expansion += n+"="+pctEncodeDisallowed(v, exprSettings.allow);
									}
								}
								sep = exprSettings.sep;
							});
						}
					}
				}
				return expansion;
			}
		}
		
		function VarSpec() {
			this.name = "";
			this.explode = false;
		}
		
		function VarSpecBuilder(exprScanner) {
			var NAME = 0, PREFIX = 1, EXPECT_COMMA = 2;
			var mode = NAME;
			
			function isExplodeChar(c) {
				return c == "*";
			}
			function isPrefixChar(c) {
				return c == ":";
			}

			this.nextVarSpec = function() {
				mode = NAME;
				var varSpec = new VarSpec();
				while ((c = exprScanner.nextChar()) != null) {
					if (c == ',') {
						return varSpec;
					} else if (mode == NAME) {
						if (isVarChar(c) || c == '.') {
							varSpec.name += c;
						} else if (isExplodeChar(c)) {
							varSpec.modifier = c;
							varSpec.explode = true;
							mode = EXPECT_COMMA;
						} else if (isPrefixChar(c)) {
							varSpec.modifier = c;
							mode = PREFIX;
						} else {
						    throw {
							message: "Unexpected expression character",
							    index: exprScanner.lastScannedCharIndex(),
							    varSpec: varSpec
							    }
						}
					} else if (mode == PREFIX && isDigit(c) && 
							(varSpec.prefix||0) < 1000) {
						varSpec.prefix = 10*(varSpec.prefix || 0) + parseInt(c);
					} else {
						throw {
							message: "Unexpected expression character", 
							index: exprScanner.lastScannedCharIndex(),
							varSpec: varSpec
						}
					}
				}
				return varSpec;
			}
		}

		this.expand = function(binding) {
			var result = {
				expansion: "", 
				errors: []
			};
			for (var i=0; i<components.length; i++) {
				var component = components[i];
				result.expansion += component.expand(binding);
				var error = component.error;
				if (error) {
					result.errors.push(error);
					if (error.isFatal) {
						throw result;
					}
				}
			}
			if (result.errors.length > 0) {
				throw result;
			}
			return result.expansion;
		}

		var components = [];
		var templateScanner = new Scanner(template);
		var c;
		var literal = "";
		while ((c = templateScanner.nextChar()) != null) {
			if (c.length == 3) {
				literal += c;
			} else if (c == '{') {
				// scan expression
				var expressionStartIndex = templateScanner.lastScannedCharIndex();
				var expr = "";
				while (1) {
					c = templateScanner.nextChar();
					if (c == '}') {
						break;
					}
					if (c == null) {
						components.push(new Literal(literal+"{"+expr, 
							new Error("Malformed expression", expressionStartIndex, "", true)));
						return;
					} else {
						expr += c;
					}
				}
				if (expr.length == 0 || 
						(!isExpressionOperator(expr[0]) && !isVarChar(expr[0]))) {
					components.push(new Literal(literal+"{"+expr+"}", 
						new Error("Invalid expression", expressionStartIndex, "", false)));
				} else {
					components.push(new Literal(literal));
					components.push(new Expression(expr));
				}
				literal = "";
			} else if (isLiteralChar(c)) {
				literal += c;
			} else {
				components.push(new Literal(literal+templateScanner.remainder(),
					new Error("Non-literals character", templateScanner.lastScannedCharIndex(), "", true)));
				return;
			}
		}
		if (literal) {
			components.push(new Literal(literal))
		}	
	};
	
	return {
		create: function(template) {
			return new UriTemplateProcessor(template);
		}
	}
});
