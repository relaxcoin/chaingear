var fs = require("fs");
var path = require('path');
var toml = require('toml');

function loadToml(filename, result) {
  try {
    var fullname = path.join(filename);
    var data = fs.readFileSync(fullname);
    var parsed = toml.parse(data);
    result.push(parsed);
  } catch (e) {
    console.error("Parsing error on line " + e.line + ", column " + e.column +
      ": " + e.message);
    console.error(";at file " + fullname);
    throw(e);
  }
}

function loadTomlCustom(filename, result) {
  try {
    var fullname = path.join(filename);
    var data = fs.readFileSync(fullname);
    var p = toml.parse(data);

    p.system = p.name;
    delete p.system;
    if (p.metrics) {
      if (p.metrics.rating) {
        p.ratings = p.ratings || {};
        p.ratings.rating = p.metrics.rating;
        delete p.metrics.rating;
      }

      if (p.metrics.consensus) {
        p.consensus = p.consensus || {};
        p.consensus.consensus_name = p.metrics.consensus;
        delete p.metrics.consensus;
      }

      if (p.metrics.algo) {
        p.consensus = p.consensus || {};
        p.consensus.hashing = p.metrics.algo;
        delete p.metrics.algo;
      }

      if (p.metrics.status) {
        p.descriptions = p.descriptions || {};
        p.descriptions.state = p.metrics.status;
        delete p.metrics.status;
      }

      if (p.metrics.type) {
        p.descriptions = p.descriptions || {};
        p.descriptions.tags = p.metrics.type;
        delete p.metrics.type;
      }

      if (p.metrics.hashtag) {
        p.descriptions = p.descriptions || {};
        p.descriptions.hashtag = p.metrics.hashtag;
        delete p.metrics.hashtag;
      }

      if (p.metrics.announce) {
        p.events = p.events || {};
        p.events.announcement = p.metrics.announce;
        delete p.metrics.announce;
      }

      if (p.metrics.genesis) {
        p.events = p.events || {};
        p.events.genesis = p.metrics.genesis;
        delete p.metrics.genesis;
      }
    }

    if (p.links && p.links.length) {
      for (var i = 0; i < p.links.length; i++) {
        var link = p.links[i];
        link.type = link.type || "";
      }
    }

    if (p.dependencies) {
      p.dependencies = p.dependencies.split(", ");
    }

    p.descriptions = p.descriptions || {};
    p.descriptions.system_type = p.descriptions.system_type || "";

    p.consensus = p.consensus || {};
    p.consensus.consensus_type = p.consensus.consensus_type || "";

    p.token = p.token || {};
    p.token.token_name = p.token.token_name || "";

    if (p.symbol) {
      p.token = p.token || {};
      p.token.token_symbol = p.symbol;
      delete p.symbol;
    }

    result.push(p);
  } catch (e) {
    console.error("Parsing error on line " + e.line + ", column " + e.column +
      ": " + e.message);
    console.error(";at file " + fullname);
    throw(e);
  }
}

var walk = function (dir) {
  var results = [];

  var list = fs.readdirSync(dir);

  list.forEach(function (_file) {
    var file = path.join(dir, _file);
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.split(".").pop() != "toml") {
        console.log("found non-toml file^" + dir + "/" + file);
        return;
      }
      results.push(file)
    }
  });
  return results
};

function act() {
  var result = [];
  var filenames_toml = walk( path.join(__dirname, "..", "sources.toml") );

  for (var idx = 0; idx < filenames_toml.length; idx++) {
    loadTomlCustom(filenames_toml[idx], result);
  }

  fs.writeFileSync(path.join(__dirname, "..", "chaingear.json"), JSON.stringify(result, null, 4));
  console.log("combined " + result.length + " entries into chaingear.json");
}

act();

