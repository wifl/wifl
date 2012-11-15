require.config({
    shim: { "rdfa": { exports: "RDFa" } }
});

require(["wifl","gui"],function(wifl,gui) {
  $(function() {
    wifl.build(document).wait(function(api) {
      api.resources.forEach(function(resource) {
        document.getElementsBySubject(resource.about).forEach(function (node) {
          $(node).append(gui.resource(resource));
        });
      });
    });
  }); 
});
