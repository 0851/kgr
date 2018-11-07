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

var dir = {
    source: _path2.default.resolve(__dirname, '../.__source')
};

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
        key: 'setConfig',
        value: function setConfig() {
            var config = (0, _parseConfig.readConfig)(this.getArgs().config);
            this.config = config;
            return config;
        }
    }, {
        key: 'configForName',
        value: function configForName(name) {
            var config = this.setConfig();
            var matched = (0, _find3.default)(config, function (conf) {
                return conf.name === name;
            });
            if (!matched) {
                throw new Error(name + ' not fount matched ' + (0, _stringify2.default)(config) + ' , please check config file');
            }
            return matched;
        }
    }, {
        key: 'sourcePath',
        value: function sourcePath(conf) {
            var version = conf.tag || conf.branch;
            var source = _path2.default.resolve(dir.source, '.source', conf.name, version);
            return source;
        }
    }, {
        key: 'tmpPath',
        value: function tmpPath(conf) {
            var version = conf.tag || conf.branch;
            var tmp = _path2.default.resolve(dir.source, '.tmp', conf.name, version);
            return tmp;
        }
    }, {
        key: 'destPath',
        value: function destPath(conf) {
            var version = conf.tag || conf.branch;
            var dest = _path2.default.resolve(dir.source, '.dest', conf.name, version);
            return dest;
        }
    }, {
        key: 'init',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(name) {
                var _this = this;

                var conf, args, _ref2, _ref3, sdtout, sdterr, url, version, source, tmp, tarName, _init, _copy;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.configForName(name);

                            case 2:
                                conf = _context3.sent;
                                args = this.getArgs();
                                _context3.next = 6;
                                return (0, _core.runShell)('git version');

                            case 6:
                                _ref2 = _context3.sent;
                                _ref3 = (0, _slicedToArray3.default)(_ref2, 2);
                                sdtout = _ref3[0];
                                sdterr = _ref3[1];

                                if (/version/.test(sdtout)) {
                                    _context3.next = 12;
                                    break;
                                }

                                throw new Error('please install git on your pc');

                            case 12:
                                url = conf.remote;
                                version = conf.tag || conf.branch;
                                source = this.sourcePath(conf);
                                tmp = this.tmpPath(conf);
                                tarName = conf.name + '-' + version + '.tar.gz';

                                _init = function () {
                                    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        _context.next = 2;
                                                        return (0, _core.runShell)('rm -rf ' + source + ' && git clone -b ' + version + ' ' + url + ' ' + source + ' && cd ' + source + ' && rm -rf .git && echo \'success\' > .kge_success');

                                                    case 2:
                                                        _context.next = 4;
                                                        return (0, _core.runShell)(conf.bash, { cwd: source });

                                                    case 4:
                                                        _context.next = 6;
                                                        return (0, _core.runShell)('cd ' + source + ' && tar -zcf ' + tarName + ' ./');

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
                                    _context3.next = 21;
                                    break;
                                }

                                _context3.next = 21;
                                return _init();

                            case 21:
                                if (_fs2.default.existsSync(_path2.default.resolve(source, '.kge_success'))) {
                                    _context3.next = 24;
                                    break;
                                }

                                _context3.next = 24;
                                return _init();

                            case 24:
                                _copy = function () {
                                    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        _context2.next = 2;
                                                        return (0, _core.runShell)('mkdir -p ' + tmp + ' && cd ' + tmp + ' && tar -zxf ' + _path2.default.resolve(source, tarName));

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
                                    _context3.next = 28;
                                    break;
                                }

                                _context3.next = 28;
                                return _copy();

                            case 28:
                                if (_fs2.default.existsSync(_path2.default.resolve(tmp, '.kge_success'))) {
                                    _context3.next = 31;
                                    break;
                                }

                                _context3.next = 31;
                                return _copy();

                            case 31:
                                return _context3.abrupt('return', conf);

                            case 32:
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
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(name) {
                var _this2 = this;

                var conf, removePath, replacePath, addPath, version, dest, tmp;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return this.configForName(name);

                            case 2:
                                conf = _context7.sent;
                                removePath = [];
                                replacePath = [];
                                addPath = [];
                                version = conf.tag || conf.branch;
                                dest = this.destPath(conf);
                                tmp = this.tmpPath(conf);

                                (0, _each3.default)(conf.replace, function (file) {
                                    file.source = !file.source ? file.source : (0, _core.getAbsPath)(file.source, _path2.default.dirname(conf.__filename));
                                    file.target = !file.target ? file.target : (0, _core.getAbsPath)(file.target, tmp);

                                    if (!_fs2.default.existsSync(file.source) && _fs2.default.existsSync(file.target)) {
                                        removePath.push(file);
                                    }
                                    if (_fs2.default.existsSync(file.source) && _fs2.default.existsSync(file.target)) {
                                        replacePath.push(file);
                                    }
                                    if (_fs2.default.existsSync(file.source) && !_fs2.default.existsSync(file.target)) {
                                        addPath.push(file);
                                    }
                                });
                                _gulp3.default.task('add', (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                                    var cmd;
                                    return _regenerator2.default.wrap(function _callee4$(_context4) {
                                        while (1) {
                                            switch (_context4.prev = _context4.next) {
                                                case 0:
                                                    console.log('' + _chalk2.default.green('run add task...'));
                                                    cmd = (0, _map3.default)(addPath, function (file) {
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
                                                    cmd = (0, _map3.default)(addPath, function (file) {
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
                                                    cmd = (0, _map3.default)(addPath, function (file) {
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
                                    var stream = _gulp3.default.src([tmp + '/**/*']).pipe((0, _gulpCached2.default)(conf.name + ':' + version)).pipe(_gulp3.default.dest('' + dest));
                                    stream.on('end', function () {
                                        done();
                                    });
                                    stream.on('error', function (err) {
                                        done(err);
                                    });
                                });
                                return _context7.abrupt('return', _gulp3.default.task('run', function (done) {
                                    return (0, _gulpSequence2.default)(['add', 'remove', 'replace'], 'pipe', done);
                                }));

                            case 15:
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
            var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(task, name) {
                var _this3 = this;

                var conf, dest, files;
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                _context11.next = 2;
                                return this.configForName(name);

                            case 2:
                                conf = _context11.sent;
                                dest = this.destPath(conf);

                                if (_fs2.default.existsSync(dest)) {
                                    _context11.next = 6;
                                    break;
                                }

                                return _context11.abrupt('return');

                            case 6:
                                (0, _gulpSequence2.default)('run')((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
                                    return _regenerator2.default.wrap(function _callee8$(_context8) {
                                        while (1) {
                                            switch (_context8.prev = _context8.next) {
                                                case 0:
                                                    _context8.next = 2;
                                                    return (0, _core.runShell)(conf.start, { cwd: dest });

                                                case 2:
                                                    console.log('' + _chalk2.default.green.underline('success : ' + dest));

                                                case 3:
                                                case 'end':
                                                    return _context8.stop();
                                            }
                                        }
                                    }, _callee8, _this3);
                                })));
                                _context11.next = 9;
                                return (0, _core.findDependen)(conf.__filename);

                            case 9:
                                files = _context11.sent;

                                (0, _each3.default)(conf.replace, function (file) {
                                    file.source = !file.source ? file.source : (0, _core.getAbsPath)(file.source, _path2.default.dirname(conf.__filename));
                                    if (_fs2.default.existsSync(file.source)) {
                                        files.push(file.source);
                                    }
                                });
                                _gulp3.default.watch(files, function () {
                                    var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(event) {
                                        return _regenerator2.default.wrap(function _callee10$(_context10) {
                                            while (1) {
                                                switch (_context10.prev = _context10.next) {
                                                    case 0:
                                                        console.log('' + _chalk2.default.yellow('File ' + event.path + ' was ' + event.type + ' , running tasks...'));
                                                        _context10.next = 3;
                                                        return _this3.gulp(name);

                                                    case 3:
                                                        (0, _gulpSequence2.default)('run')((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
                                                            var conf, dest;
                                                            return _regenerator2.default.wrap(function _callee9$(_context9) {
                                                                while (1) {
                                                                    switch (_context9.prev = _context9.next) {
                                                                        case 0:
                                                                            _context9.next = 2;
                                                                            return _this3.configForName(name);

                                                                        case 2:
                                                                            conf = _context9.sent;
                                                                            dest = _this3.destPath(conf);
                                                                            _context9.next = 6;
                                                                            return (0, _core.runShell)(conf.restart, { cwd: dest });

                                                                        case 6:
                                                                            if (conf.restart) console.log('' + _chalk2.default.green.underline('restart : ' + dest));

                                                                        case 7:
                                                                        case 'end':
                                                                            return _context9.stop();
                                                                    }
                                                                }
                                                            }, _callee9, _this3);
                                                        })));

                                                    case 4:
                                                    case 'end':
                                                        return _context10.stop();
                                                }
                                            }
                                        }, _callee10, _this3);
                                    }));

                                    return function (_x5) {
                                        return _ref12.apply(this, arguments);
                                    };
                                }());

                            case 12:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function devServer(_x3, _x4) {
                return _ref10.apply(this, arguments);
            }

            return devServer;
        }()
    }, {
        key: 'dev',
        value: function () {
            var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(name) {
                var _this4 = this;

                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                _context15.next = 2;
                                return (0, _core.tasks)([(0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
                                    return _regenerator2.default.wrap(function _callee12$(_context12) {
                                        while (1) {
                                            switch (_context12.prev = _context12.next) {
                                                case 0:
                                                    _context12.next = 2;
                                                    return _this4.init(name);

                                                case 2:
                                                    return _context12.abrupt('return', _context12.sent);

                                                case 3:
                                                case 'end':
                                                    return _context12.stop();
                                            }
                                        }
                                    }, _callee12, _this4);
                                })), (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
                                    return _regenerator2.default.wrap(function _callee13$(_context13) {
                                        while (1) {
                                            switch (_context13.prev = _context13.next) {
                                                case 0:
                                                    _context13.next = 2;
                                                    return _this4.gulp(name);

                                                case 2:
                                                    return _context13.abrupt('return', _context13.sent);

                                                case 3:
                                                case 'end':
                                                    return _context13.stop();
                                            }
                                        }
                                    }, _callee13, _this4);
                                })), function () {
                                    var _ref17 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(task) {
                                        return _regenerator2.default.wrap(function _callee14$(_context14) {
                                            while (1) {
                                                switch (_context14.prev = _context14.next) {
                                                    case 0:
                                                        _context14.next = 2;
                                                        return _this4.devServer(task, name);

                                                    case 2:
                                                        return _context14.abrupt('return', _context14.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context14.stop();
                                                }
                                            }
                                        }, _callee14, _this4);
                                    }));

                                    return function (_x7) {
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

            function dev(_x6) {
                return _ref14.apply(this, arguments);
            }

            return dev;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19(name) {
                var _this5 = this;

                return _regenerator2.default.wrap(function _callee19$(_context19) {
                    while (1) {
                        switch (_context19.prev = _context19.next) {
                            case 0:
                                _context19.next = 2;
                                return (0, _core.tasks)([(0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16() {
                                    return _regenerator2.default.wrap(function _callee16$(_context16) {
                                        while (1) {
                                            switch (_context16.prev = _context16.next) {
                                                case 0:
                                                    _context16.next = 2;
                                                    return _this5.init(name);

                                                case 2:
                                                    return _context16.abrupt('return', _context16.sent);

                                                case 3:
                                                case 'end':
                                                    return _context16.stop();
                                            }
                                        }
                                    }, _callee16, _this5);
                                })), (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17() {
                                    return _regenerator2.default.wrap(function _callee17$(_context17) {
                                        while (1) {
                                            switch (_context17.prev = _context17.next) {
                                                case 0:
                                                    _context17.next = 2;
                                                    return _this5.gulp(name);

                                                case 2:
                                                    return _context17.abrupt('return', _context17.sent);

                                                case 3:
                                                case 'end':
                                                    return _context17.stop();
                                            }
                                        }
                                    }, _callee17, _this5);
                                })), function () {
                                    var _ref21 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18(task) {
                                        var conf;
                                        return _regenerator2.default.wrap(function _callee18$(_context18) {
                                            while (1) {
                                                switch (_context18.prev = _context18.next) {
                                                    case 0:
                                                        _context18.next = 2;
                                                        return _this5.configForName(name);

                                                    case 2:
                                                        conf = _context18.sent;
                                                        return _context18.abrupt('return', (0, _gulpSequence2.default)('run')(function () {
                                                            var dest = _this5.destPath(conf);
                                                            if (!_fs2.default.existsSync(dest)) return;
                                                            console.log('' + _chalk2.default.green.underline('success : ' + dest));
                                                        }));

                                                    case 4:
                                                    case 'end':
                                                        return _context18.stop();
                                                }
                                            }
                                        }, _callee18, _this5);
                                    }));

                                    return function (_x9) {
                                        return _ref21.apply(this, arguments);
                                    };
                                }()]);

                            case 2:
                            case 'end':
                                return _context19.stop();
                        }
                    }
                }, _callee19, this);
            }));

            function build(_x8) {
                return _ref18.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'run',
        value: function () {
            var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20() {
                var args, name, mode;
                return _regenerator2.default.wrap(function _callee20$(_context20) {
                    while (1) {
                        switch (_context20.prev = _context20.next) {
                            case 0:
                                args = this.getArgs();
                                name = args.name || this.setConfig()[0].name;
                                mode = args.mode || 'dev';

                                if (name) {
                                    _context20.next = 5;
                                    break;
                                }

                                throw new Error('请设置一个启动项目的名称');

                            case 5:
                                if (!(mode === 'dev')) {
                                    _context20.next = 8;
                                    break;
                                }

                                _context20.next = 8;
                                return this.dev(name);

                            case 8:
                                if (!(mode === 'build')) {
                                    _context20.next = 11;
                                    break;
                                }

                                _context20.next = 11;
                                return this.build(name);

                            case 11:
                            case 'end':
                                return _context20.stop();
                        }
                    }
                }, _callee20, this);
            }));

            function run() {
                return _ref22.apply(this, arguments);
            }

            return run;
        }()
    }]);
    return Kgr;
}();

exports.default = Kgr;
module.exports = exports.default;