'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _map2 = require('lodash/map');

var _map3 = _interopRequireDefault(_map2);

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

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

var _gulp2 = require('gulp');

var _gulp3 = _interopRequireDefault(_gulp2);

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
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(conf) {
                var _this = this;

                var args, _ref2, _ref3, sdtout, sdterr, url, version, clonePath, tmpPath, tarName, _init, _copy;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                args = this.getArgs();
                                _context3.next = 3;
                                return (0, _core.runShell)('git version');

                            case 3:
                                _ref2 = _context3.sent;
                                _ref3 = (0, _slicedToArray3.default)(_ref2, 2);
                                sdtout = _ref3[0];
                                sdterr = _ref3[1];

                                if (/version/.test(sdtout)) {
                                    _context3.next = 9;
                                    break;
                                }

                                throw new Error('please install git on your pc');

                            case 9:
                                url = conf.remote;
                                version = conf.tag || conf.branch;
                                clonePath = _path2.default.resolve(git_source, '.source', conf.name, version);
                                tmpPath = _path2.default.resolve(git_source, '.tmp', conf.name, version);
                                tarName = conf.name + '-' + version + '.tar.gz';

                                _init = function () {
                                    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        _context.next = 2;
                                                        return (0, _core.runShell)('rm -rf ' + clonePath + ' && git clone -b ' + version + ' ' + url + ' ' + clonePath + ' && cd ' + clonePath + ' && rm -rf .git && echo \'success\' > .kge_success');

                                                    case 2:
                                                        _context.next = 4;
                                                        return (0, _core.runShell)(conf.bash, { cwd: clonePath });

                                                    case 4:
                                                        _context.next = 6;
                                                        return (0, _core.runShell)('cd ' + clonePath + ' && tar -zcf ' + tarName + ' ./');

                                                    case 6:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this);
                                    }));

                                    return function _init() {
                                        return _ref4.apply(this, arguments);
                                    };
                                }();

                                if (!args.init) {
                                    _context3.next = 18;
                                    break;
                                }

                                _context3.next = 18;
                                return _init();

                            case 18:
                                if (_fs2.default.existsSync(_path2.default.resolve(clonePath, '.kge_success'))) {
                                    _context3.next = 21;
                                    break;
                                }

                                _context3.next = 21;
                                return _init();

                            case 21:
                                _copy = function () {
                                    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        _context2.next = 2;
                                                        return (0, _core.runShell)('mkdir -p ' + tmpPath + ' && cd ' + tmpPath + ' && tar -zxf ' + _path2.default.resolve(clonePath, tarName));

                                                    case 2:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, _this);
                                    }));

                                    return function _copy() {
                                        return _ref5.apply(this, arguments);
                                    };
                                }();

                                if (!args.copy) {
                                    _context3.next = 25;
                                    break;
                                }

                                _context3.next = 25;
                                return _copy();

                            case 25:
                                if (_fs2.default.existsSync(_path2.default.resolve(tmpPath, '.kge_success'))) {
                                    _context3.next = 28;
                                    break;
                                }

                                _context3.next = 28;
                                return _copy();

                            case 28:
                                return _context3.abrupt('return', conf);

                            case 29:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function init(_x) {
                return _ref.apply(this, arguments);
            }

            return init;
        }()
    }, {
        key: 'gulp',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(conf) {
                var _this2 = this;

                var remove_path, replace_path, add_path, version, tmpPath, destPath;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                remove_path = [];
                                replace_path = [];
                                add_path = [];
                                version = conf.tag || conf.branch;
                                tmpPath = _path2.default.resolve(git_source, '.tmp', conf.name, version);
                                destPath = _path2.default.resolve(git_source, '.dest', conf.name, version);

                                conf['__dest'] = destPath;
                                (0, _each3.default)(conf.replace, function (file) {
                                    file.source = !file.source ? file.source : (0, _core.getAbsPath)(file.source, _path2.default.dirname(conf.__filename));
                                    file.target = !file.target ? file.target : (0, _core.getAbsPath)(file.target, tmpPath);

                                    if (!_fs2.default.existsSync(file.source) && _fs2.default.existsSync(file.target)) {
                                        remove_path.push(file);
                                    }
                                    if (_fs2.default.existsSync(file.source) && _fs2.default.existsSync(file.target)) {
                                        replace_path.push(file);
                                    }
                                    if (_fs2.default.existsSync(file.source) && !_fs2.default.existsSync(file.target)) {
                                        add_path.push(file);
                                    }
                                });
                                _gulp3.default.task('add', (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                                    var cmd;
                                    return _regenerator2.default.wrap(function _callee4$(_context4) {
                                        while (1) {
                                            switch (_context4.prev = _context4.next) {
                                                case 0:
                                                    console.log('' + _chalk2.default.green('run add task...'));
                                                    cmd = (0, _map3.default)(add_path, function (file) {
                                                        return 'cp -rf ' + file.source + ' ' + file.target;
                                                    }).join('&&');
                                                    _context4.next = 4;
                                                    return (0, _core.runShell)(cmd);

                                                case 4:
                                                    return _context4.abrupt('return', _context4.sent);

                                                case 5:
                                                case 'end':
                                                    return _context4.stop();
                                            }
                                        }
                                    }, _callee4, _this2);
                                })));
                                _gulp3.default.task('remove', (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
                                    var cmd;
                                    return _regenerator2.default.wrap(function _callee5$(_context5) {
                                        while (1) {
                                            switch (_context5.prev = _context5.next) {
                                                case 0:
                                                    console.log('' + _chalk2.default.green('run remove task...'));
                                                    cmd = (0, _map3.default)(add_path, function (file) {
                                                        return 'rm -rf ' + file.target;
                                                    }).join('&&');
                                                    _context5.next = 4;
                                                    return (0, _core.runShell)(cmd);

                                                case 4:
                                                    return _context5.abrupt('return', _context5.sent);

                                                case 5:
                                                case 'end':
                                                    return _context5.stop();
                                            }
                                        }
                                    }, _callee5, _this2);
                                })));
                                _gulp3.default.task('replace', (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
                                    var cmd;
                                    return _regenerator2.default.wrap(function _callee6$(_context6) {
                                        while (1) {
                                            switch (_context6.prev = _context6.next) {
                                                case 0:
                                                    console.log('' + _chalk2.default.green('run replace task...'));
                                                    cmd = (0, _map3.default)(add_path, function (file) {
                                                        return 'cp -rf ' + file.source + ' ' + file.target;
                                                    }).join('&&');
                                                    _context6.next = 4;
                                                    return (0, _core.runShell)(cmd);

                                                case 4:
                                                    return _context6.abrupt('return', _context6.sent);

                                                case 5:
                                                case 'end':
                                                    return _context6.stop();
                                            }
                                        }
                                    }, _callee6, _this2);
                                })));
                                _gulp3.default.task('pipe', function (done) {
                                    console.log('' + _chalk2.default.green('run pipe task...'));
                                    var stream = _gulp3.default.src([tmpPath + '/**/*']).pipe((0, _gulpCached2.default)(conf.name + ':' + version)).pipe(_gulp3.default.dest('' + destPath));
                                    stream.on('end', function () {
                                        done();
                                    });
                                    stream.on('error', function (err) {
                                        done(err);
                                    });
                                });
                                return _context7.abrupt('return', [_gulp3.default.task('run', function (done) {
                                    return (0, _gulpSequence2.default)(['add', 'remove', 'replace'], 'pipe', done);
                                }), conf]);

                            case 13:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function gulp(_x2) {
                return _ref6.apply(this, arguments);
            }

            return gulp;
        }()
    }, {
        key: 'devServer',
        value: function () {
            var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(task, conf) {
                var _this3 = this;

                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                if (conf.__dest) {
                                    _context10.next = 2;
                                    break;
                                }

                                return _context10.abrupt('return');

                            case 2:
                                (0, _gulpSequence2.default)('run')((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
                                    return _regenerator2.default.wrap(function _callee8$(_context8) {
                                        while (1) {
                                            switch (_context8.prev = _context8.next) {
                                                case 0:
                                                    _context8.next = 2;
                                                    return (0, _core.runShell)(conf.start, { cwd: conf.__dest });

                                                case 2:
                                                    console.log('' + _chalk2.default.green.underline('success : ' + conf.__dest));

                                                case 3:
                                                case 'end':
                                                    return _context8.stop();
                                            }
                                        }
                                    }, _callee8, _this3);
                                })));
                                _gulp3.default.watch([], function (event) {
                                    console.log('' + _chalk2.default.yellow('File ' + event.path + ' was ' + event.type + ' , running tasks...'));
                                    (0, _gulpSequence2.default)('run')((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
                                        return _regenerator2.default.wrap(function _callee9$(_context9) {
                                            while (1) {
                                                switch (_context9.prev = _context9.next) {
                                                    case 0:
                                                        _context9.next = 2;
                                                        return (0, _core.runShell)(conf.restart, { cwd: conf.__dest });

                                                    case 2:
                                                        if (conf.restart) console.log('' + _chalk2.default.green.underline('restart : ' + conf.__dest));

                                                    case 3:
                                                    case 'end':
                                                        return _context9.stop();
                                                }
                                            }
                                        }, _callee9, _this3);
                                    })));
                                });

                            case 4:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function devServer(_x3, _x4) {
                return _ref10.apply(this, arguments);
            }

            return devServer;
        }()
    }, {
        key: 'dev',
        value: function () {
            var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(name) {
                var _this4 = this;

                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                _context15.next = 2;
                                return (0, _core.tasks)([(0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
                                    return _regenerator2.default.wrap(function _callee11$(_context11) {
                                        while (1) {
                                            switch (_context11.prev = _context11.next) {
                                                case 0:
                                                    _context11.next = 2;
                                                    return _this4.configForName(name);

                                                case 2:
                                                    return _context11.abrupt('return', _context11.sent);

                                                case 3:
                                                case 'end':
                                                    return _context11.stop();
                                            }
                                        }
                                    }, _callee11, _this4);
                                })), function () {
                                    var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(conf) {
                                        return _regenerator2.default.wrap(function _callee12$(_context12) {
                                            while (1) {
                                                switch (_context12.prev = _context12.next) {
                                                    case 0:
                                                        _context12.next = 2;
                                                        return _this4.init(conf);

                                                    case 2:
                                                        return _context12.abrupt('return', _context12.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context12.stop();
                                                }
                                            }
                                        }, _callee12, _this4);
                                    }));

                                    return function (_x6) {
                                        return _ref15.apply(this, arguments);
                                    };
                                }(), function () {
                                    var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(conf) {
                                        return _regenerator2.default.wrap(function _callee13$(_context13) {
                                            while (1) {
                                                switch (_context13.prev = _context13.next) {
                                                    case 0:
                                                        _context13.next = 2;
                                                        return _this4.gulp(conf);

                                                    case 2:
                                                        return _context13.abrupt('return', _context13.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context13.stop();
                                                }
                                            }
                                        }, _callee13, _this4);
                                    }));

                                    return function (_x7) {
                                        return _ref16.apply(this, arguments);
                                    };
                                }(), function () {
                                    var _ref17 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(_ref18) {
                                        var _ref19 = (0, _slicedToArray3.default)(_ref18, 2),
                                            task = _ref19[0],
                                            conf = _ref19[1];

                                        return _regenerator2.default.wrap(function _callee14$(_context14) {
                                            while (1) {
                                                switch (_context14.prev = _context14.next) {
                                                    case 0:
                                                        _context14.next = 2;
                                                        return _this4.devServer(task, conf);

                                                    case 2:
                                                        return _context14.abrupt('return', _context14.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context14.stop();
                                                }
                                            }
                                        }, _callee14, _this4);
                                    }));

                                    return function (_x8) {
                                        return _ref17.apply(this, arguments);
                                    };
                                }()]);

                            case 2:
                            case 'end':
                                return _context15.stop();
                        }
                    }
                }, _callee15, this);
            }));

            function dev(_x5) {
                return _ref13.apply(this, arguments);
            }

            return dev;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20(name) {
                var _this5 = this;

                return _regenerator2.default.wrap(function _callee20$(_context20) {
                    while (1) {
                        switch (_context20.prev = _context20.next) {
                            case 0:
                                _context20.next = 2;
                                return (0, _core.tasks)([(0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16() {
                                    return _regenerator2.default.wrap(function _callee16$(_context16) {
                                        while (1) {
                                            switch (_context16.prev = _context16.next) {
                                                case 0:
                                                    _context16.next = 2;
                                                    return _this5.configForName(name);

                                                case 2:
                                                    return _context16.abrupt('return', _context16.sent);

                                                case 3:
                                                case 'end':
                                                    return _context16.stop();
                                            }
                                        }
                                    }, _callee16, _this5);
                                })), function () {
                                    var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17(conf) {
                                        return _regenerator2.default.wrap(function _callee17$(_context17) {
                                            while (1) {
                                                switch (_context17.prev = _context17.next) {
                                                    case 0:
                                                        _context17.next = 2;
                                                        return _this5.init(conf);

                                                    case 2:
                                                        return _context17.abrupt('return', _context17.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context17.stop();
                                                }
                                            }
                                        }, _callee17, _this5);
                                    }));

                                    return function (_x10) {
                                        return _ref22.apply(this, arguments);
                                    };
                                }(), function () {
                                    var _ref23 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18(conf) {
                                        return _regenerator2.default.wrap(function _callee18$(_context18) {
                                            while (1) {
                                                switch (_context18.prev = _context18.next) {
                                                    case 0:
                                                        _context18.next = 2;
                                                        return _this5.gulp(conf);

                                                    case 2:
                                                        return _context18.abrupt('return', _context18.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context18.stop();
                                                }
                                            }
                                        }, _callee18, _this5);
                                    }));

                                    return function (_x11) {
                                        return _ref23.apply(this, arguments);
                                    };
                                }(), function () {
                                    var _ref24 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19(_ref25) {
                                        var _ref26 = (0, _slicedToArray3.default)(_ref25, 2),
                                            task = _ref26[0],
                                            conf = _ref26[1];

                                        return _regenerator2.default.wrap(function _callee19$(_context19) {
                                            while (1) {
                                                switch (_context19.prev = _context19.next) {
                                                    case 0:
                                                        return _context19.abrupt('return', (0, _gulpSequence2.default)('run')(function () {
                                                            console.log('' + _chalk2.default.green.underline('success : ' + conf.__dest));
                                                        }));

                                                    case 1:
                                                    case 'end':
                                                        return _context19.stop();
                                                }
                                            }
                                        }, _callee19, _this5);
                                    }));

                                    return function (_x12) {
                                        return _ref24.apply(this, arguments);
                                    };
                                }()]);

                            case 2:
                            case 'end':
                                return _context20.stop();
                        }
                    }
                }, _callee20, this);
            }));

            function build(_x9) {
                return _ref20.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'run',
        value: function () {
            var _ref27 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21() {
                var args, name, mode;
                return _regenerator2.default.wrap(function _callee21$(_context21) {
                    while (1) {
                        switch (_context21.prev = _context21.next) {
                            case 0:
                                args = this.getArgs();
                                name = args.name || this.getConfig()[0].name;
                                mode = args.mode || 'dev';

                                if (name) {
                                    _context21.next = 5;
                                    break;
                                }

                                throw new Error('请设置一个启动项目的名称');

                            case 5:
                                if (!(mode === 'dev')) {
                                    _context21.next = 8;
                                    break;
                                }

                                _context21.next = 8;
                                return this.dev(name);

                            case 8:
                                if (!(mode === 'build')) {
                                    _context21.next = 11;
                                    break;
                                }

                                _context21.next = 11;
                                return this.build(name);

                            case 11:
                            case 'end':
                                return _context21.stop();
                        }
                    }
                }, _callee21, this);
            }));

            function run() {
                return _ref27.apply(this, arguments);
            }

            return run;
        }()
    }]);
    return Kgr;
}();

exports.default = Kgr;
module.exports = exports.default;