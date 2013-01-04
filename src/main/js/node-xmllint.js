// This is a shim around xmllint.js for use with node. We can't use
// requirejs's regular shim mechanism, since that requires variables
// to be allocated globally, not locally.

define(["module","fs","path","vm"],function(module,fs,path,vm) {

  var cwd = path.dirname(module.uri);
  var filename = path.resolve(cwd,"xmllint.js");

  var sandbox = {
    print: function(msg) { sandbox.result.push(msg); },
    printErr: function(msg) { sandbox.result.push(msg); },
    Int32Array: Int32Array,
    Float64Array: Float64Array,
    ArrayBuffer: ArrayBuffer,
    Int8Array: Int8Array,
    Int16Array: Int16Array,
    Uint8Array: Uint8Array,
    Uint16Array: Uint16Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array
  };
  
  vm.runInNewContext(fs.readFileSync(filename),sandbox,filename);
  
  return function(xml,schema) {
    sandbox.result = [];
    sandbox.validateXML(xml,schema);
    return sandbox.result.join("\n");
  };

});
