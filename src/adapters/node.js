var foounit = require('./foo-unit');

// This is a little weird, but fsh will get baked into
// the foo-unit-node build.
//, fsh = require('../build/fsh');
if (typeof fsh === 'undefined'){
  throw new Error('Looks like there was a problem ' +
    'building foo-unit-node. ' +
    'fsh should have been baked in.');
}



var adapter = (function (){
  var sys = require('sys');

  // Private variables
  var self = {},  _specdir, _codedir;

  // Private functions
  var _translate = function(str, tvars){
    return str.replace(/:(\w+)/g, function(match, ref){
        return tvars[ref];
      });
  };

  /**
   * Override foounit.require
   */
  self.require = function (file){
    file = _translate(file, { 'src': _codedir });
    return require(file);
  }

  /**
   * Default runner
   */
  self.run = function (specdir, codedir, pattern) {
    _specdir = specdir;
    _codedir = codedir;

    var specs = fsh.findSync(_specdir, pattern);
    for (var i = 0, ii = specs.length; i < ii; ++i){
      var specFile = specs[i].replace(/\.js$/, '');
      console.log('running spec: ', specFile);
      var spec = require(specFile);
    }
    foounit.execute(foounit.build());
  }

  /*
   * Reporting
   */
  self.reportExample = function (example){
    if (example.isFailure()){
      colors.putsRed('F');
      colors.putsRed(example.getDescription());
      sys.puts(new Array(example.getDescription().length+1).join('='));
      highlightSpecs(example.getException().stack);
    } else if (example.isSuccess()){
      colors.printGreen('.');
    } else if (example.isPending()){
      colors.printYellow('P');
    }
  }

  self.report = function (info){
    if (info.pending.length){
      var pending = info.pending;
      console.log("\n");
      for (var i = 0, ii = pending.length; i < ii; ++i){
        colors.putsYellow('PENDING: ' + pending[i]);
      }
    }

    if (info.failCount){
      colors.putsRed("\n" + info.failCount + ' test(s) FAILED');
    } else {
      colors.putsGreen("\nAll tests passed.");
    }

    var endMessage = info.totalCount + ' total.';
    if (info.pending.length){
      endMessage += '  ' + info.pending.length + ' pending.';
    }
    console.log(endMessage);
  }

  return self;
})();

foounit.mixin(foounit, adapter);
module.exports = foounit;

// TODO: Launch if file was not required
// TODO: Parse params from cmd-line
//run('../', /_spec\.js$/, '../../dist');

