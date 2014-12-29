"use strict";
var args = require('yargs').argv,
  prompt = require('prompt'),
  shell = require('shelljs'),
  fs = require('fs'),
  $q = require('Q');
prompt = $q.denodeify(prompt.start().get);

var version = args._[0];
if (!version) {
  console.error("version is not specified");
  return;
}
version = version.replace(/^v*/, '');
var ABORTED = "Aborted";

check()
  .then(function () {
    return exec('git flow release start v' + version);
  })
  .then(function () {
    return $q.all([exec('gulp build'), bumpVersions(version)]);
  })
  .then(function () {
    shell.rm('-rf', 'dist');
    shell.cp('-R', 'build/*', 'dist');
    return exec('git add dist/* bower.json package.json');
  })
  .then(function () {
    return prompt({name: 'prompt', description: "Please verify project and say yes to finish release"});
  })
  .then(function (resp) {
    if (resp.prompt[0].toLowerCase() !== 'y') {
      return $q.reject(ABORTED);
    }
  })
  .then(function () {
    return exec('git commit -m "release v' + version + '"');
  })
  .then(function () {
    return exec('git flow release finish -m "release v' + version + '" v' + version);
  })
  .then(function () {
    return prompt({name: 'prompt', description: "Push changes? "});
  })
  .then(function (resp) {
    if (resp.prompt[0].toLowerCase() !== 'y') {
      return $q.reject(ABORTED);
    }
    else {
      return exec('git push && git push --tags');
    }
  })
  .catch(function (reason) {
    if (reason === ABORTED) {
      console.log("Aborted");
    }
    else {
      return $q.reject(reason);
    }
  })
  .done();

function check() {
  return exec('git symbolic-ref HEAD', {silent: true})
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

function exec(cmd, opions) {
  opions = opions || {};
  opions.async = true;
  var deferred = $q.defer();
  shell.exec(cmd, opions, function (code, resp) {
    if (code) {
      deferred.reject(resp);
    }
    else {
      deferred.resolve(resp);
    }
  });
  return deferred.promise;
}