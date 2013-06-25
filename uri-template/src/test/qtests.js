define(["qunit", "uri-template", "json",
        "json!spec-examples.json", "json!spec-examples-by-section.json",
        "json!negative-tests.json", "json!extended-tests.json"],
        function(qunit, urit, json, 
            specExamples, specExamplesBySection, negativeTests, extendedTests) {
          requirejs.config({
            shim: {"qunit":[] }
          });
        
          function expand(template, env) {
            var template = urit.parse(template);
            return (template && template.expand(env)) || false
          }
        
          function isArray(obj) {
            return Object.prototype.toString.apply(obj) === '[object Array]';
          }
        
          function check(actual, expected) {
            if (isArray(expected)) {
              for (var i=0; i<expected.length; i++) {
                if (actual == expected[i]) {
                  return ok(true);
                }
              }
              return equal(actual, expected, "Must be one of the expected values");
            }
            equal(actual, expected);
          }
        
          function runTest(group) {
            test(group.level, function() {
              for (var i=0; i<group.testcases.length; i++) {
                var template = group.testcases[i][0];
                var expected = group.testcases[i][1];
                check(expand(template, group.variables), expected);
              }
            });
          }

          function runTests(obj) {
            for (var groupName in obj) {
              module(groupName);
              runTest(obj[groupName]);
            }
          }

          return {
            run: function() {
             runTests(specExamples);
             runTests(specExamplesBySection);
             runTests(negativeTests);
              runTests(extendedTests);
            }
          }
        }
)