define(["jquery","wifl","gui"],function(jQuery,wifl,gui) {
  jQuery(function() {
    wifl.build(document).done(function(api) {
      api.examples.forEach(function(example) {
        document.getElementsBySubject(example.about).forEach(function (node) {
          gui.example(example,api,$(node));
        });
      });
    });
  }); 
});
