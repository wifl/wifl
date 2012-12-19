define(["qunit","wifl"],function(qunit,wifl) {

  wifl.build(document).wait(function(api) {
    test("resources",function() {
      equal(api.resources.length,1);
    });
  });

});
