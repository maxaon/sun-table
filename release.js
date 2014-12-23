var args = require('yargs').argv,
  prompt = require('prompt'),
  shell = require('shelljs'),
  fs = require('fs'),
  $q = require('Q');
prompt = $q.denodeify(prompt.start().get)
var exec = function (cmd, opions) {
  opions = opions || {};
  opions.async = true;
  var defered = $q.defer();
  shell.exec(cmd, opions, function (code, resp) {
    if (code) {
      defered.reject(resp);
    }
    else {
      defered.resolve(resp);
    }
  });
  return defered.promise;
};
var version = args._[0];
if (!version) {
  console.error("version is not specified");
  return
}
version = version.replace(/^v*/, '');

check()
  .then(function () {
    return exec('git flow release start v' + version);
  })
  .then(function () {
    return $q.all([exec('gulp build'), bumpVersions(version)])
  })
  .then(function () {
    shell.rm('-rf', 'dist');
    shell.cp('-R', 'build/*', 'dist');
    return exec('git add dist/* bower.json package.json');
  })
  .then(function () {
    return prompt("Please verify project and say yes to finish relase");
  })
  .then(function (resp) {
    if (resp && resp[0].toLowerCase() === 'y') {
      return exec('git flow release finish v' + version);
    }
    else {
      return $q.reject();
    }
  })
  .then(function () {
    return prompt("Push changes? ");
  })
  .then(function (resp) {
    if (resp && resp[0].toLowerCase() === 'y') {
      return $q.reject();
      return exec('git flow release finish v' + version);
    }
    else {
      return $q.reject();
    }
  })
  .done();

function check() {
  return exec('git symbolic-ref HEAD')
    .then(function (resp) {
      if (resp.trim() !== 'refs/heads/develop') {
        throw new Error("Wrong branch");
      }
    });
}

function bumpVersions(version) {
  return $q.all(['bower.json', 'package.json'].map(function bump(file) {
    return $q.nfcall(fs.readFile, file, {encoding: 'utf8'})
      .then(JSON.parse)
      .then(function (config) {
        config.version = version;
        return $q.nfcall(fs.writeFile, file, JSON.stringify(config, null, 2));
      })
      .done();
  }));
}