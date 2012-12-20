define(["qunit","wifl"],function(qunit,wifl) {

  function mkObject(array) {
    var result = {};
    array.forEach(function (thing) {
      var fragment = thing.toString().replace(/^[^#]*/,"");
      result[fragment] = thing;
    });
    return result;
  }

  wifl.build(document).wait(function(api) {
    var resources = mkObject(api.resources);
    var examples = mkObject(api.examples);
    var sooper = resources["#Super"];
    var root = resources["#Root"];
    var dogs = resources["#Dogs"];
    var dog = resources["#Dog"];
    test("resources",function() {
      equal(api.resources.length,4);
    });
    test("examples",function() {
      equal(api.examples.length,0);
    });
    test("super",function() {
      equal(sooper.myPath,undefined);
      equal(sooper.path,"");
      equal(sooper.uriTemplate.toString(),"{?apikey}");
      equal(sooper.pathParams.length,0);
      equal(sooper.queryParams.length,1);
      equal(sooper.uriParams.length,1);
      equal(sooper.headerParams.length,0);
      equal(sooper.supers.length,0);
      equal(sooper.parent,undefined);
    });
    test("root",function() {
      equal(root.myPath,"http://api.example.com/bogus");
      equal(root.path,"http://api.example.com/bogus");
      equal(root.uriTemplate.toString(),"http://api.example.com/bogus{?apikey}");
      equal(root.pathParams.length,0);
      equal(root.queryParams.length,1);
      equal(root.uriParams.length,1);
      equal(root.headerParams.length,0);
      equal(root.supers.length,1);
      equal(root.supers[0].about,sooper.about);
      equal(root.parent,undefined);
    });
    test("dogs",function() {
      equal(dogs.myPath,"/dogs");
      equal(dogs.path,"http://api.example.com/bogus/dogs");
      equal(dogs.uriTemplate.toString(),"http://api.example.com/bogus/dogs{?apikey}");
      equal(dogs.pathParams.length,0);
      equal(dogs.queryParams.length,1);
      equal(dogs.uriParams.length,1);
      equal(dogs.headerParams.length,0);
      equal(dogs.supers.length,1);
      equal(dogs.supers[0].about,sooper.about);
      equal(dogs.parent.about,root.about);
    });
    test("dog",function() {
      equal(dog.myPath,"/{dogID}");
      equal(dog.path,"http://api.example.com/bogus/dogs/{dogID}");
      equal(dog.uriTemplate.toString(),"http://api.example.com/bogus/dogs/{dogID}{?apikey}");
      equal(dog.pathParams.length,1);
      equal(dog.queryParams.length,1);
      equal(dog.uriParams.length,2);
      equal(dog.headerParams.length,0);
      equal(dog.supers.length,1);
      equal(dog.supers[0].about,sooper.about);
      equal(dog.parent.about,dogs.about);
    });
  });

});
