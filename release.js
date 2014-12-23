var args = require('yargs').argv,
  prompt = require('prompt'),
  shell = require('shelljs'),
  fs = require('fs');

var version = args._[0];
if (!version) {
  console.error("version is not specified");
}
version = version.replace(/^v*/, '');
//shell.exec('gulp build');
['bower.json', 'package.json'].forEach(function bump(file) {
  var config = JSON.parse(fs.readFileSync(file, {encoding: 'utf8'}));
  config.version = version;
  fs.writeFileSync(file, JSON.stringify(config, null, 2));
});

shell.rm('-rf', 'dist');
shell.cp('-R', 'build/*', 'dist');



