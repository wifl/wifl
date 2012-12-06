require.config({
    shim: { "rdfa": { exports: "RDFa" } }
});

require(["wifl","gui","validator-jsv"],function(wifl,gui) {
  $(function() {
    wifl.build(document).wait(function(api) {
      api.resources.forEach(function(resource) {
        document.getElementsBySubject(resource.about).forEach(function (node) {
          gui.resource(resource,$(node));
        });
      });
      api.examples.forEach(function(example) {
        document.getElementsBySubject(example.about).forEach(function (node) {
          gui.example(example,api,$(node));
        });
      });
    });
  }); 
});
