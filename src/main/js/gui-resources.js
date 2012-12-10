define(["jquery","wifl","gui"],function(jQuery,wifl,gui) {
  jQuery(function() {
    wifl.build(document).wait(function(api) {
      api.resources.forEach(function(resource) {
        document.getElementsBySubject(resource.about).forEach(function (node) {
          gui.resource(resource,$(node));
        });
      });
    });
  }); 
});
