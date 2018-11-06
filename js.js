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

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _find2 = require('lodash/find');

var _find3 = _interopRequireDefault(_find2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

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

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}

var log = (0, _debug2.default)(_package2.default.name);
var git_source = _path2.default.resolve(__dirname, '../.__source');
_mkdirp2.default.sync(git_source);

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

        /**
         * 检出指定分支
         */

    }, {
        key: 'init',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee(conf) {
                var args, _ref2, _ref3, sdtout, sdterr, url, version, clonePath, tmpPath, tarname;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                args = this.getArgs();
                                _context.next = 4;
                                return (0, _core.runShell)('git version');

                            case 4:
                                _ref2 = _context.sent;
                                _ref3 = (0, _slicedToArray3.default)(_ref2, 2);
                                sdtout = _ref3[0];
                                sdterr = _ref3[1];

                                if (/version/.test(sdtout)) {
                                    _context.next = 10;
                                    break;
                                }

                                throw new Error('please install git on your pc');

                            case 10:
                                url = conf.remote;
                                version = conf.tag || conf.branch;
                                clonePath = _path2.default.resolve(git_source, '.source', conf.name, version);
                                tmpPath = _path2.default.resolve(git_source, '.tmp', conf.name, version);

                                if (!(!_fs2.default.existsSync(clonePath) || !_fs2.default.existsSync(_path2.default.resolve(clonePath, '.kgr_success')) || args.init)) {
                                    _context.next = 18;
                                    break;
                                }

                                _mkdirp2.default.sync(clonePath);
                                _context.next = 18;
                                return (0, _core.runShell)('rm -rf ' + clonePath + ' && git clone -b ' + version + ' ' + url + ' ' + clonePath + ' && cd ' + clonePath + ' && rm -rf .git && echo \'success\' > .kgr_success');

                            case 18:
                                if (!(args.copy || !_fs2.default.existsSync(tmpPath))) {
                                    _context.next = 34;
                                    break;
                                }

                                tarname = '' + conf.name + version + '.tar.gz';

                                if (_fs2.default.existsSync(_path2.default.resolve(clonePath, tarname))) {
                                    _context.next = 23;
                                    break;
                                }

                                _context.next = 23;
                                return (0, _core.runShell)('cd ' + clonePath + ' && tar -zcvf ' + tarname + ' ./');

                            case 23:
                                _context.next = 25;
                                return (0, _core.runShell)('mkdir -p ' + tmpPath + ' && tar -zxvf ' + _path2.default.resolve(clonePath, tarname) + ' && rm -rf ' + tarname);

                            case 25:
                                if (!((0, _isString3.default)(conf.bash) && args.init)) {
                                    _context.next = 34;
                                    break;
                                }

                                _context.prev = 26;
                                _context.next = 29;
                                return (0, _core.runShell)(conf.bash, {cwd: tmpPath});

                            case 29:
                                _context.next = 34;
                                break;

                            case 31:
                                _context.prev = 31;
                                _context.t0 = _context['catch'](26);
                                throw _context.t0;

                            case 34:
                                return _context.abrupt('return', conf);

                            case 37:
                                _context.prev = 37;
                                _context.t1 = _context['catch'](0);

                                console.log(_context.t1);
                                throw _context.t1;

                            case 41:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 37], [26, 31]]);
            }));

            function init(_x) {
                return _ref.apply(this, arguments);
            }

            return init;
        }()

        /**
         * 文件处理
         */

    }, {
        key: 'gulp',
        value: function gulp(conf) {
            var _this = this;

            var remove_path = [];
            var replace_path = [];
            var add_path = [];
            var version = conf.tag || conf.branch;
            var clonePath = _path2.default.resolve(git_source, '.source', conf.name, version);
            var tmpPath = _path2.default.resolve(git_source, '.tmp', conf.name, version);
            var destPath = _path2.default.resolve(git_source, '.dest', conf.name, version);
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
            _gulp3.default.task('pipe', function () {
                console.log('' + _chalk2.default.yellow('pipe task...'));
                return _gulp3.default.src([tmpPath + '/**/*']).pipe((0, _gulpCached2.default)(conf.name + ':' + version)).pipe(_gulp3.default.dest('' + destPath));
            });
            // gulp.task('cp', async () => {
            //     console.log(`${chalk.yellow(`copy task...`)}`);
            //     return gulp.src([`${clonePath}/**/*`])
            //         .pipe(cached(`${conf.name}:${version}:tmp`))
            //         .pipe(gulp.dest(`${path.resolve(tmpPath, version)}`))
            // })
            _gulp3.default.task('add', (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var cmd;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                console.log('' + _chalk2.default.yellow('add task...'));
                                cmd = (0, _map3.default)(add_path, function (file) {
                                    return 'cp -rf ' + file.source + ' ' + file.target;
                                }).join('&&');

                                if (!cmd) {
                                    _context2.next = 5;
                                    break;
                                }

                                _context2.next = 5;
                                return (0, _core.runShell)(cmd);

                            case 5:
                                return _context2.abrupt('return');

                            case 6:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, _this);
            })));
            _gulp3.default.task('remove', (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                var cmd;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                console.log('' + _chalk2.default.yellow('remove task...'));
                                cmd = (0, _map3.default)(remove_path, function (file) {
                                    return 'rm -rf ' + file.target;
                                }).join('&&');

                                if (!cmd) {
                                    _context3.next = 11;
                                    break;
                                }

                                _context3.prev = 3;
                                _context3.next = 6;
                                return (0, _core.runShell)(cmd);

                            case 6:
                                _context3.next = 11;
                                break;

                            case 8:
                                _context3.prev = 8;
                                _context3.t0 = _context3['catch'](3);
                                throw _context3.t0;

                            case 11:
                                return _context3.abrupt('return');

                            case 12:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, _this, [[3, 8]]);
            })));
            _gulp3.default.task('replace', (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                var cmd;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                console.log('' + _chalk2.default.yellow('replace task...'));
                                cmd = (0, _map3.default)(replace_path, function (file) {
                                    return 'cp -rf ' + file.source + ' ' + file.target;
                                }).join('&&');

                                if (!cmd) {
                                    _context4.next = 11;
                                    break;
                                }

                                _context4.prev = 3;
                                _context4.next = 6;
                                return (0, _core.runShell)(cmd);

                            case 6:
                                _context4.next = 11;
                                break;

                            case 8:
                                _context4.prev = 8;
                                _context4.t0 = _context4['catch'](3);
                                throw _context4.t0;

                            case 11:
                                return _context4.abrupt('return');

                            case 12:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, _this, [[3, 8]]);
            })));
            return [_gulp3.default.task('run', function (done) {
                (0, _gulpSequence2.default)(['add', 'remove', 'replace'], 'pipe', done);
            }), conf];
        }
    }, {
        key: 'devServer',
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee7(task, conf) {
                var _this2 = this;

                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                (0, _gulpSequence2.default)('run')((0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee5() {
                                    return _regenerator2.default.wrap(function _callee5$(_context5) {
                                        while (1) {
                                            switch (_context5.prev = _context5.next) {
                                                case 0:
                                                    _context5.prev = 0;
                                                    _context5.next = 3;
                                                    return (0, _core.runShell)(conf.start, {cwd: conf.__dest});

                                                case 3:
                                                    if (conf.start) console.log('run start ' + conf.start + ' on ' + conf.__dest);
                                                    _context5.next = 9;
                                                    break;

                                                case 6:
                                                    _context5.prev = 6;
                                                    _context5.t0 = _context5['catch'](0);
                                                    throw _context5.t0;

                                                case 9:
                                                case 'end':
                                                    return _context5.stop();
                                            }
                                        }
                                    }, _callee5, _this2, [[0, 6]]);
                                })));
                                _gulp3.default.watch([conf.__filename], function (event) {
                                    var _this3 = this;

                                    console.log('' + _chalk2.default.yellow('File ' + event.path + ' was ' + event.type + ' , running tasks...'));
                                    (0, _gulpSequence2.default)('run')((0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee6() {
                                        return _regenerator2.default.wrap(function _callee6$(_context6) {
                                            while (1) {
                                                switch (_context6.prev = _context6.next) {
                                                    case 0:
                                                        _context6.prev = 0;
                                                        _context6.next = 3;
                                                        return (0, _core.runShell)(conf.restart, {cwd: conf.__dest});

                                                    case 3:
                                                        if (conf.restart) console.log('run start ' + conf.restart + ' on ' + conf.__dest);
                                                        _context6.next = 9;
                                                        break;

                                                    case 6:
                                                        _context6.prev = 6;
                                                        _context6.t0 = _context6['catch'](0);
                                                        throw _context6.t0;

                                                    case 9:
                                                    case 'end':
                                                        return _context6.stop();
                                                }
                                            }
                                        }, _callee6, _this3, [[0, 6]]);
                                    })));
                                });

                            case 2:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function devServer(_x2, _x3) {
                return _ref7.apply(this, arguments);
            }

            return devServer;
        }()
    }, {
        key: 'dev',
        value: function () {
            var _ref10 = (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee11(name) {
                var _this4 = this;

                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                _context11.prev = 0;
                                _context11.next = 3;
                                return (0, _core.tasks)([function () {
                                    return _this4.configForName(name);
                                }, function () {
                                    var _ref11 = (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee8(conf) {
                                        return _regenerator2.default.wrap(function _callee8$(_context8) {
                                            while (1) {
                                                switch (_context8.prev = _context8.next) {
                                                    case 0:
                                                        _context8.next = 2;
                                                        return _this4.init(conf);

                                                    case 2:
                                                        return _context8.abrupt('return', _context8.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context8.stop();
                                                }
                                            }
                                        }, _callee8, _this4);
                                    }));

                                    return function (_x5) {
                                        return _ref11.apply(this, arguments);
                                    };
                                }(), function () {
                                    var _ref12 = (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee9(conf) {
                                        return _regenerator2.default.wrap(function _callee9$(_context9) {
                                            while (1) {
                                                switch (_context9.prev = _context9.next) {
                                                    case 0:
                                                        _context9.next = 2;
                                                        return _this4.gulp(conf);

                                                    case 2:
                                                        return _context9.abrupt('return', _context9.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context9.stop();
                                                }
                                            }
                                        }, _callee9, _this4);
                                    }));

                                    return function (_x6) {
                                        return _ref12.apply(this, arguments);
                                    };
                                }(), function () {
                                    var _ref13 = (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee10(_ref14) {
                                        var _ref15 = (0, _slicedToArray3.default)(_ref14, 2),
                                            task = _ref15[0],
                                            conf = _ref15[1];

                                        return _regenerator2.default.wrap(function _callee10$(_context10) {
                                            while (1) {
                                                switch (_context10.prev = _context10.next) {
                                                    case 0:
                                                        _context10.next = 2;
                                                        return _this4.devServer(task, conf);

                                                    case 2:
                                                        return _context10.abrupt('return', _context10.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context10.stop();
                                                }
                                            }
                                        }, _callee10, _this4);
                                    }));

                                    return function (_x7) {
                                        return _ref13.apply(this, arguments);
                                    };
                                }()]);

                            case 3:
                                _context11.next = 8;
                                break;

                            case 5:
                                _context11.prev = 5;
                                _context11.t0 = _context11['catch'](0);

                                console.error(_context11.t0);

                            case 8:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this, [[0, 5]]);
            }));

            function dev(_x4) {
                return _ref10.apply(this, arguments);
            }

            return dev;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref16 = (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee16(name) {
                var _this5 = this;

                return _regenerator2.default.wrap(function _callee16$(_context16) {
                    while (1) {
                        switch (_context16.prev = _context16.next) {
                            case 0:
                                _context16.prev = 0;
                                _context16.next = 3;
                                return (0, _core.tasks)([function () {
                                    return _this5.configForName(name);
                                }, function () {
                                    var _ref17 = (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee12(conf) {
                                        return _regenerator2.default.wrap(function _callee12$(_context12) {
                                            while (1) {
                                                switch (_context12.prev = _context12.next) {
                                                    case 0:
                                                        _context12.next = 2;
                                                        return _this5.init(conf);

                                                    case 2:
                                                        return _context12.abrupt('return', _context12.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context12.stop();
                                                }
                                            }
                                        }, _callee12, _this5);
                                    }));

                                    return function (_x9) {
                                        return _ref17.apply(this, arguments);
                                    };
                                }(), function () {
                                    var _ref18 = (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee13(conf) {
                                        return _regenerator2.default.wrap(function _callee13$(_context13) {
                                            while (1) {
                                                switch (_context13.prev = _context13.next) {
                                                    case 0:
                                                        _context13.next = 2;
                                                        return _this5.gulp(conf);

                                                    case 2:
                                                        return _context13.abrupt('return', _context13.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context13.stop();
                                                }
                                            }
                                        }, _callee13, _this5);
                                    }));

                                    return function (_x10) {
                                        return _ref18.apply(this, arguments);
                                    };
                                }(), function () {
                                    var _ref19 = (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee15(_ref20) {
                                        var _ref21 = (0, _slicedToArray3.default)(_ref20, 2),
                                            task = _ref21[0],
                                            conf = _ref21[1];

                                        return _regenerator2.default.wrap(function _callee15$(_context15) {
                                            while (1) {
                                                switch (_context15.prev = _context15.next) {
                                                    case 0:
                                                        _gulp3.default.start((0, _gulpSequence2.default)('run', (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee14() {
                                                            return _regenerator2.default.wrap(function _callee14$(_context14) {
                                                                while (1) {
                                                                    switch (_context14.prev = _context14.next) {
                                                                        case 0:
                                                                            console.log('' + _chalk2.default.underline.green('success : \u751F\u6210\u6210\u529F\u5728' + conf.__dest));

                                                                        case 1:
                                                                        case 'end':
                                                                            return _context14.stop();
                                                                    }
                                                                }
                                                            }, _callee14, _this5);
                                                        }))));

                                                    case 1:
                                                    case 'end':
                                                        return _context15.stop();
                                                }
                                            }
                                        }, _callee15, _this5);
                                    }));

                                    return function (_x11) {
                                        return _ref19.apply(this, arguments);
                                    };
                                }()]);

                            case 3:
                                _context16.next = 8;
                                break;

                            case 5:
                                _context16.prev = 5;
                                _context16.t0 = _context16['catch'](0);

                                console.error(_context16.t0);

                            case 8:
                            case 'end':
                                return _context16.stop();
                        }
                    }
                }, _callee16, this, [[0, 5]]);
            }));

            function build(_x8) {
                return _ref16.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'run',
        value: function () {
            var _ref23 = (0, _asyncToGenerator3.default)(/*#__PURE__*/_regenerator2.default.mark(function _callee17() {
                var args, name, mode;
                return _regenerator2.default.wrap(function _callee17$(_context17) {
                    while (1) {
                        switch (_context17.prev = _context17.next) {
                            case 0:
                                args = this.getArgs();
                                name = args.name || this.getConfig()[0].name;
                                mode = args.mode || 'dev';

                                if (name) {
                                    _context17.next = 5;
                                    break;
                                }

                                throw new Error('请设置一个启动项目的名称');

                            case 5:
                                if (!(mode === 'dev')) {
                                    _context17.next = 8;
                                    break;
                                }

                                _context17.next = 8;
                                return this.dev(name);

                            case 8:
                                if (!(mode === 'build')) {
                                    _context17.next = 11;
                                    break;
                                }

                                _context17.next = 11;
                                return this.build(name);

                            case 11:
                            case 'end':
                                return _context17.stop();
                        }
                    }
                }, _callee17, this);
            }));

            function run() {
                return _ref23.apply(this, arguments);
            }

            return run;
        }()
    }]);
    return Kgr;
}();

exports.default = Kgr;
module.exports = exports.default;