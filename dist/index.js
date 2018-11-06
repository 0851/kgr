'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _find2 = require('lodash/find');

var _find3 = _interopRequireDefault(_find2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _gulpSequence = require('gulp-sequence');

var _gulpSequence2 = _interopRequireDefault(_gulpSequence);

var _gulpCached = require('gulp-cached');

var _gulpCached2 = _interopRequireDefault(_gulpCached);

var _parseConfig = require('./libs/parse-config');

var _core = require('./libs/core');

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)(_package2.default.name);
var git_source = _path2.default.resolve(__dirname, '../.__source');

var Kgr = function () {
    function Kgr(args) {
        (0, _classCallCheck3.default)(this, Kgr);

        this.setArgs(args);
        log('---start---');
        this.setConfig();
    }

    (0, _createClass3.default)(Kgr, [{
        key: 'setArgs',
        value: function setArgs(args) {
            this.args = args;
        }
    }, {
        key: 'getArgs',
        value: function getArgs() {
            return this.args;
        }
    }, {
        key: 'getOutput',
        value: function getOutput() {
            var output = this.getArgs().output;
            output = (0, _core.getAbsPath)(output || 'dist');
            log('output ---> ' + output);
            return output;
        }
    }, {
        key: 'setConfig',
        value: function setConfig() {
            var config = (0, _parseConfig.readConfig)(this.getArgs().config);
            this.config = config;
        }
    }, {
        key: 'getConfig',
        value: function getConfig() {
            return this.config;
        }
    }, {
        key: 'configForName',
        value: function configForName(name) {
            var config = this.getConfig();
            var matched = (0, _find3.default)(config, function (conf) {
                return conf.name === name;
            });
            if (!matched) {
                throw new Error(name + ' not fount matched ' + (0, _stringify2.default)(config) + ' , please check config file');
            }
            return matched;
        }
    }, {
        key: 'init',
        value: function init() {}
    }, {
        key: 'gulp',
        value: function gulp() {}
    }, {
        key: 'devServer',
        value: function devServer() {}
    }, {
        key: 'dev',
        value: function dev() {}
    }, {
        key: 'build',
        value: function build() {}
    }, {
        key: 'run',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var args, name, mode;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                args = this.getArgs();
                                name = args.name || this.getConfig()[0].name;
                                mode = args.mode || 'dev';

                                if (name) {
                                    _context.next = 5;
                                    break;
                                }

                                throw new Error('请设置一个启动项目的名称');

                            case 5:
                                if (!(mode === 'dev')) {
                                    _context.next = 8;
                                    break;
                                }

                                _context.next = 8;
                                return this.dev(name);

                            case 8:
                                if (!(mode === 'build')) {
                                    _context.next = 11;
                                    break;
                                }

                                _context.next = 11;
                                return this.build(name);

                            case 11:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function run() {
                return _ref.apply(this, arguments);
            }

            return run;
        }()
    }]);
    return Kgr;
}();

exports.default = Kgr;
module.exports = exports.default;