#!/usr/bin/env node

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _index = require('../index.js');

var _index2 = _interopRequireDefault(_index);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package2.default.version).option('-c, --config [config]', 'config file \',\' separated, glob mode', function (val) {
    return val.split(',');
}).option('-o, --output [output]', 'output path', 'dist').option('-s, --source [source]', 'tmp path', '.source').option('-m, --mode [mode]', 'run project mode , default dev', 'dev').option('-n, --name [name]', 'run project name , default find first name in config file', '').option('--init [init]', 'init project', '').option('--copy [copy]', 'copy project', '').parse(process.argv);

exports.default = new _index2.default(_commander2.default).run();
module.exports = exports.default;