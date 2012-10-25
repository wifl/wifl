require.config({
    shim: { "rdfa": { exports: "RDFa" } }
});

require(["wifl","gui"],function(wifl,gui) {
  $(function() {
    wifl.create(document).wait(function(api) {
      api.resources().forEach(function(resource) {
        document.getElementsBySubject(resource.uri).forEach(function (node) {
          $(node).append(gui.resource(resource));
        });
      });
    });
  }); 
});
