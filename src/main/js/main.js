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
      api.examples.forEach(function(example) {
        document.getElementsBySubject(example.about).forEach(function (node) {
          var $example = gui.example(example,api).hide();
          $(node).click(function () { 
            $example.slideToggle();
          }).css("cursor","pointer").after($example);
        });
      });
    });
  }); 
});
