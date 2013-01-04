// This is a shim around rdfa.js for use with node. We can't use
// requirejs's regular shim mechanism, since that requires variables
// to be allocated globally, not locally.

define(["module","fs","path","vm"],function(module,fs,path,vm) {

  var cwd = path.dirname(module.uri);
  var filename = path.resolve(cwd,"rdfa.js");

  vm.runInThisContext(fs.readFileSync(filename),filename);
  
  return RDFa;

});
