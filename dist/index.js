'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _isRegExp2 = require('lodash/isRegExp');

var _isRegExp3 = _interopRequireDefault(_isRegExp2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _reduce2 = require('lodash/reduce');

var _reduce3 = _interopRequireDefault(_reduce2);

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _keyBy2 = require('lodash/keyBy');

var _keyBy3 = _interopRequireDefault(_keyBy2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

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

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _gulp2 = require('gulp');

var _gulp3 = _interopRequireDefault(_gulp2);

var _gulpReplace = require('gulp-replace');

var _gulpReplace2 = _interopRequireDefault(_gulpReplace);

var _gulpCached = require('gulp-cached');

var _gulpCached2 = _interopRequireDefault(_gulpCached);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _parseConfig = require('./libs/parse-config');

var _core = require('./libs/core');

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _vinyl = require('vinyl');

var _vinyl2 = _interopRequireDefault(_vinyl);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)(_package2.default.name);

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
            var version = conf.version;
            var tmp = this.getArgs().tmp || '.source';
            tmp = (0, _core.getAbsPath)(tmp);
            var source = _path2.default.resolve(tmp, '.source', conf.name, version);
            return source;
        }
    }, {
        key: 'destPath',
        value: function destPath(conf) {
            var version = conf.version;
            var tmp = this.getArgs().tmp || '.source';
            tmp = (0, _core.getAbsPath)(tmp);
            var source = _path2.default.resolve(tmp, '.dest', conf.name, version);
            return source;
        }
    }, {
        key: 'init',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(name) {
                var _this = this;

                var conf, args, _ref2, _ref3, sdtout, sdterr, url, version, source, dest, tarName, successFile, _init, _copyDest;

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
                                version = conf.version;
                                source = this.sourcePath(conf);
                                dest = this.destPath(conf);
                                tarName = conf.name + '-' + version + '.tar.gz';
                                successFile = '.kge_success';

                                _init = function () {
                                    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        _context.prev = 0;
                                                        _context.next = 3;
                                                        return (0, _core.runShell)('rm -rf ' + source + ' && git clone -b ' + version + ' ' + url + ' ' + source + ' && cd ' + source + ' && rm -rf .git && echo \'success\' > ' + successFile);

                                                    case 3:
                                                        _context.next = 5;
                                                        return (0, _core.runShell)(conf.bash, { cwd: source });

                                                    case 5:
                                                        _context.next = 7;
                                                        return (0, _core.runShell)('cd ' + source + ' && b=' + tarName + '; tar --exclude=$b -zcf $b .');

                                                    case 7:
                                                        _context.next = 13;
                                                        break;

                                                    case 9:
                                                        _context.prev = 9;
                                                        _context.t0 = _context['catch'](0);

                                                        console.log(_context.t0);
                                                        throw _context.t0;

                                                    case 13:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this, [[0, 9]]);
                                    }));

                                    return function _init() {
                                        return _ref4.apply(this, arguments);
                                    };
                                }();

                                if (!args.init) {
                                    _context3.next = 22;
                                    break;
                                }

                                _context3.next = 22;
                                return _init();

                            case 22:
                                if (_fs2.default.existsSync(_path2.default.resolve(source, successFile))) {
                                    _context3.next = 25;
                                    break;
                                }

                                _context3.next = 25;
                                return _init();

                            case 25:
                                _copyDest = function () {
                                    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        log('cp start');
                                                        _context2.prev = 1;
                                                        _context2.next = 4;
                                                        return (0, _core.runShell)('mkdir -p ' + dest + ' && cd ' + dest + ' && tar -zxf ' + _path2.default.resolve(source, tarName));

                                                    case 4:
                                                        _context2.next = 9;
                                                        break;

                                                    case 6:
                                                        _context2.prev = 6;
                                                        _context2.t0 = _context2['catch'](1);
                                                        throw _context2.t0;

                                                    case 9:
                                                        log('cp end');
                                                        // return new Promise((resolve, reject) => {
                                                        //     // mkdirp.sync(dest);
                                                        //     // log('cp start ')
                                                        //     // ncp(source, dest, function (err) {
                                                        //     //     if (err) {
                                                        //     //         console.error(err)
                                                        //     //         reject(err)
                                                        //     //         return;
                                                        //     //     }
                                                        //     //     log('cp end')
                                                        //     //     resolve()
                                                        //     // });
                                                        //     const opt = {base: source, cwd: source};
                                                        //     log(`copy init`)
                                                        //     gulp
                                                        //         .src(globby.sync(`${source}/**/*`, opt), opt)
                                                        //         .pipe(gulp.dest(`${dest}`))
                                                        //         .on('end', () => {
                                                        //             resolve();
                                                        //             log(`copy end`)
                                                        //         })
                                                        //         .on('error', (e) => {
                                                        //             log(`copy error`)
                                                        //             reject(e)
                                                        //         })
                                                        // })

                                                    case 10:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, _this, [[1, 6]]);
                                    }));

                                    return function _copyDest() {
                                        return _ref5.apply(this, arguments);
                                    };
                                }();

                                if (!args.copy) {
                                    _context3.next = 29;
                                    break;
                                }

                                _context3.next = 29;
                                return _copyDest();

                            case 29:
                                if (_fs2.default.existsSync(_path2.default.resolve(dest, successFile))) {
                                    _context3.next = 32;
                                    break;
                                }

                                _context3.next = 32;
                                return _copyDest();

                            case 32:
                                return _context3.abrupt('return', conf);

                            case 33:
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
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(name) {
                var _this2 = this;

                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                return _context5.abrupt('return', new _promise2.default(function () {
                                    var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(resolve, reject) {
                                        var conf, tmp, dest, glob, opt, clean, matched, files, sourceFiles, stream, pipes;
                                        return _regenerator2.default.wrap(function _callee4$(_context4) {
                                            while (1) {
                                                switch (_context4.prev = _context4.next) {
                                                    case 0:
                                                        _context4.prev = 0;
                                                        _context4.next = 3;
                                                        return _this2.configForName(name);

                                                    case 3:
                                                        conf = _context4.sent;

                                                        console.log('' + _chalk2.default.green('run pipe task...'));
                                                        tmp = _this2.sourcePath(conf);
                                                        dest = _this2.destPath(conf);
                                                        glob = ['./**/*', '!./{bower_components,node_modules,dist,build}{,/**}', '!./**/*.{tar.gz,swf,mp4,webm,ogg,mp3,wav,flac,aac,png,jpg,gif,svg,eot,woff,woff2,ttf,otf,swf}'];


                                                        if (conf.glob) {
                                                            conf.glob = (0, _isArray3.default)(conf.glob) ? conf.glob : [conf.glob];
                                                            glob = glob.concat(conf.glob);
                                                        }

                                                        log('find glob ---> start');
                                                        opt = { base: tmp, cwd: tmp, nodir: true };


                                                        log('find glob ---> end');
                                                        log('' + glob.join('\n'));
                                                        log('gulp matched start');

                                                        clean = function clean(exists, cleanFiles) {
                                                            var existMap = (0, _keyBy3.default)(exists, function (exist) {
                                                                var key = _path2.default.resolve(dest, exist);
                                                                return key;
                                                            });
                                                            (0, _each3.default)(cleanFiles, function (file) {
                                                                file = _path2.default.resolve(dest, file);
                                                                if (!existMap[file]) {
                                                                    _del2.default.sync(file);
                                                                }
                                                            });
                                                        };

                                                        matched = _globby2.default.sync(glob, opt);

                                                        log('gulp matched end');
                                                        //得到需要处理的文件
                                                        files = (0, _core.getFiles)(conf.replace, _path2.default.dirname(conf.__filename), tmp);
                                                        sourceFiles = [];
                                                        stream = _gulp3.default.src(matched, opt);


                                                        log('gulp file replace start');
                                                        //对流进行预先处理 , 追加文件,替换文件,删除文件,等
                                                        stream = stream.pipe((0, _core.gulpCUD)(files, tmp, dest));
                                                        log('gulp file replace end');

                                                        log('gulp record start');
                                                        stream = stream.pipe(function () {
                                                            return _through2.default.obj(function (file, encoding, cb) {
                                                                sourceFiles.push(file.relative);
                                                                this.push(file);
                                                                cb();
                                                            });
                                                        }());
                                                        log('gulp record end');

                                                        pipes = conf.pipe;

                                                        if (!(0, _isArray3.default)(pipes)) {
                                                            pipes = [pipes];
                                                        }

                                                        log('gulp content replace start');
                                                        stream = (0, _reduce3.default)(pipes, function (stream, pipe) {
                                                            if (!(0, _isArray3.default)(pipe)) {
                                                                return stream;
                                                            }
                                                            var reg = pipe[0];
                                                            var replacement = pipe[1];
                                                            var options = pipe[2];
                                                            if (((0, _isString3.default)(reg) || (0, _isRegExp3.default)(reg)) && ((0, _isFunction3.default)(replacement) || (0, _isString3.default)(replacement))) {
                                                                stream = stream.pipe((0, _gulpReplace2.default)(reg, replacement, options));
                                                            }
                                                            return stream;
                                                        }, stream);
                                                        log('gulp content replace end');
                                                        stream.pipe((0, _gulpCached2.default)(conf.name + ':' + conf.version)).pipe(_gulp3.default.dest('' + dest)).on('end', function () {
                                                            log('clean start');
                                                            var cleanFiles = _globby2.default.sync(glob, { base: dest, cwd: dest, nodir: true });
                                                            clean(sourceFiles, cleanFiles);
                                                            log('clean end');
                                                            log('end pipe...');
                                                            resolve(conf);
                                                        }).on('error', function (err) {
                                                            log('error pipe... ' + err);
                                                            reject(err);
                                                        });
                                                        _context4.next = 37;
                                                        break;

                                                    case 34:
                                                        _context4.prev = 34;
                                                        _context4.t0 = _context4['catch'](0);

                                                        reject(_context4.t0);

                                                    case 37:
                                                    case 'end':
                                                        return _context4.stop();
                                                }
                                            }
                                        }, _callee4, _this2, [[0, 34]]);
                                    }));

                                    return function (_x3, _x4) {
                                        return _ref7.apply(this, arguments);
                                    };
                                }()));

                            case 1:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function gulp(_x2) {
                return _ref6.apply(this, arguments);
            }

            return gulp;
        }()
    }, {
        key: 'devServer',
        value: function () {
            var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(name) {
                var _this3 = this;

                var bash, watch, conf, dest, shell;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                bash = null;

                                watch = function () {
                                    var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
                                        var conf, files;
                                        return _regenerator2.default.wrap(function _callee7$(_context7) {
                                            while (1) {
                                                switch (_context7.prev = _context7.next) {
                                                    case 0:
                                                        _context7.next = 2;
                                                        return _this3.configForName(name);

                                                    case 2:
                                                        conf = _context7.sent;
                                                        _context7.next = 5;
                                                        return (0, _core.findDependen)(conf.__filename);

                                                    case 5:
                                                        files = _context7.sent;

                                                        (0, _each3.default)(conf.replace, function (file) {
                                                            file.source = !file.source ? file.source : (0, _core.getAbsPath)(file.source, _path2.default.dirname(conf.__filename));
                                                            if (_fs2.default.existsSync(file.source)) {
                                                                files.push(file.source);
                                                            }
                                                        });
                                                        log('watch start ... , ' + files);
                                                        _gulp3.default.watch(files, function () {
                                                            var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(event) {
                                                                var _conf, dest, shell;

                                                                return _regenerator2.default.wrap(function _callee6$(_context6) {
                                                                    while (1) {
                                                                        switch (_context6.prev = _context6.next) {
                                                                            case 0:
                                                                                console.log('' + _chalk2.default.yellow('File ' + event.path + ' was ' + event.type + ' , running tasks...'));
                                                                                _context6.prev = 1;
                                                                                _context6.next = 4;
                                                                                return _this3.gulp(name);

                                                                            case 4:
                                                                                _context6.next = 6;
                                                                                return _this3.configForName(name);

                                                                            case 6:
                                                                                _conf = _context6.sent;
                                                                                dest = _this3.destPath(_conf);

                                                                                if (_fs2.default.existsSync(dest)) {
                                                                                    _context6.next = 10;
                                                                                    break;
                                                                                }

                                                                                throw new Error('can fount dest path ' + dest);

                                                                            case 10:
                                                                                if (!_conf.restart) {
                                                                                    _context6.next = 23;
                                                                                    break;
                                                                                }

                                                                                _context6.prev = 11;

                                                                                bash && bash.kill && bash.kill();
                                                                                _context6.next = 15;
                                                                                return (0, _core.runShell)(_conf.restart, { cwd: dest });

                                                                            case 15:
                                                                                shell = _context6.sent;

                                                                                bash = shell[2];
                                                                                _context6.next = 22;
                                                                                break;

                                                                            case 19:
                                                                                _context6.prev = 19;
                                                                                _context6.t0 = _context6['catch'](11);

                                                                                console.error(_context6.t0);

                                                                            case 22:
                                                                                console.log('' + _chalk2.default.green.underline('restart : ' + dest));

                                                                            case 23:
                                                                                _context6.next = 28;
                                                                                break;

                                                                            case 25:
                                                                                _context6.prev = 25;
                                                                                _context6.t1 = _context6['catch'](1);
                                                                                throw _context6.t1;

                                                                            case 28:
                                                                            case 'end':
                                                                                return _context6.stop();
                                                                        }
                                                                    }
                                                                }, _callee6, _this3, [[1, 25], [11, 19]]);
                                                            }));

                                                            return function (_x6) {
                                                                return _ref10.apply(this, arguments);
                                                            };
                                                        }());

                                                    case 9:
                                                    case 'end':
                                                        return _context7.stop();
                                                }
                                            }
                                        }, _callee7, _this3);
                                    }));

                                    return function watch() {
                                        return _ref9.apply(this, arguments);
                                    };
                                }();

                                _context8.prev = 2;
                                _context8.next = 5;
                                return this.gulp(name);

                            case 5:
                                _context8.next = 7;
                                return this.configForName(name);

                            case 7:
                                conf = _context8.sent;
                                dest = this.destPath(conf);

                                if (_fs2.default.existsSync(dest)) {
                                    _context8.next = 11;
                                    break;
                                }

                                throw new Error('can fount dest path ' + dest);

                            case 11:
                                _context8.next = 13;
                                return watch();

                            case 13:
                                if (!conf.start) {
                                    _context8.next = 24;
                                    break;
                                }

                                _context8.prev = 14;
                                _context8.next = 17;
                                return (0, _core.runShell)(conf.start, { cwd: dest });

                            case 17:
                                shell = _context8.sent;

                                bash = shell[2];
                                _context8.next = 24;
                                break;

                            case 21:
                                _context8.prev = 21;
                                _context8.t0 = _context8['catch'](14);

                                console.error(_context8.t0);

                            case 24:
                                console.log('' + _chalk2.default.green.underline('success : ' + dest));
                                _context8.next = 30;
                                break;

                            case 27:
                                _context8.prev = 27;
                                _context8.t1 = _context8['catch'](2);
                                throw _context8.t1;

                            case 30:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this, [[2, 27], [14, 21]]);
            }));

            function devServer(_x5) {
                return _ref8.apply(this, arguments);
            }

            return devServer;
        }()
    }, {
        key: 'dev',
        value: function () {
            var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(name) {
                var _this4 = this;

                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                _context11.next = 2;
                                return (0, _core.tasks)([(0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
                                    return _regenerator2.default.wrap(function _callee9$(_context9) {
                                        while (1) {
                                            switch (_context9.prev = _context9.next) {
                                                case 0:
                                                    _context9.next = 2;
                                                    return _this4.init(name);

                                                case 2:
                                                    return _context9.abrupt('return', _context9.sent);

                                                case 3:
                                                case 'end':
                                                    return _context9.stop();
                                            }
                                        }
                                    }, _callee9, _this4);
                                })), (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
                                    return _regenerator2.default.wrap(function _callee10$(_context10) {
                                        while (1) {
                                            switch (_context10.prev = _context10.next) {
                                                case 0:
                                                    _context10.next = 2;
                                                    return _this4.devServer(name);

                                                case 2:
                                                    return _context10.abrupt('return', _context10.sent);

                                                case 3:
                                                case 'end':
                                                    return _context10.stop();
                                            }
                                        }
                                    }, _callee10, _this4);
                                }))]);

                            case 2:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function dev(_x7) {
                return _ref11.apply(this, arguments);
            }

            return dev;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(name) {
                var _this5 = this;

                return _regenerator2.default.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                _context14.next = 2;
                                return (0, _core.tasks)([(0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
                                    return _regenerator2.default.wrap(function _callee12$(_context12) {
                                        while (1) {
                                            switch (_context12.prev = _context12.next) {
                                                case 0:
                                                    _context12.next = 2;
                                                    return _this5.init(name);

                                                case 2:
                                                    return _context12.abrupt('return', _context12.sent);

                                                case 3:
                                                case 'end':
                                                    return _context12.stop();
                                            }
                                        }
                                    }, _callee12, _this5);
                                })), (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
                                    var args, conf, dest;
                                    return _regenerator2.default.wrap(function _callee13$(_context13) {
                                        while (1) {
                                            switch (_context13.prev = _context13.next) {
                                                case 0:
                                                    _context13.next = 2;
                                                    return _this5.gulp(name);

                                                case 2:
                                                    args = _this5.getArgs();
                                                    _context13.next = 5;
                                                    return _this5.configForName(name);

                                                case 5:
                                                    conf = _context13.sent;
                                                    dest = _this5.destPath(conf);

                                                    if (_fs2.default.existsSync(dest)) {
                                                        _context13.next = 9;
                                                        break;
                                                    }

                                                    return _context13.abrupt('return');

                                                case 9:
                                                    if (!conf.build) {
                                                        _context13.next = 18;
                                                        break;
                                                    }

                                                    _context13.prev = 10;
                                                    _context13.next = 13;
                                                    return (0, _core.runShell)(conf.build, { cwd: dest });

                                                case 13:
                                                    _context13.next = 18;
                                                    break;

                                                case 15:
                                                    _context13.prev = 15;
                                                    _context13.t0 = _context13['catch'](10);

                                                    console.error(_context13.t0);

                                                case 18:
                                                    if (!_fs2.default.existsSync(args.output)) {
                                                        _context13.next = 23;
                                                        break;
                                                    }

                                                    _context13.next = 21;
                                                    return (0, _core.runShell)('cd ' + args.output + ' && tar -zcf ' + conf.name + '.' + conf.version + '.tar.gz -C ' + dest + ' .');

                                                case 21:
                                                    _context13.next = 24;
                                                    break;

                                                case 23:
                                                    console.log('' + _chalk2.default.yellow('warning : args.output \u4E0D\u5B58\u5728'));

                                                case 24:
                                                    console.log('' + _chalk2.default.green.underline('success : ' + dest));

                                                case 25:
                                                case 'end':
                                                    return _context13.stop();
                                            }
                                        }
                                    }, _callee13, _this5, [[10, 15]]);
                                }))]);

                            case 2:
                            case 'end':
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function build(_x8) {
                return _ref14.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'run',
        value: function () {
            var _ref17 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
                var args, name, mode;
                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                args = this.getArgs();
                                name = args.name || this.setConfig()[0].name;
                                mode = args.mode || 'dev';

                                if (name) {
                                    _context15.next = 5;
                                    break;
                                }

                                throw new Error('请设置一个启动项目的名称');

                            case 5:
                                if (!(mode === 'dev')) {
                                    _context15.next = 8;
                                    break;
                                }

                                _context15.next = 8;
                                return this.dev(name);

                            case 8:
                                if (!(mode === 'build')) {
                                    _context15.next = 11;
                                    break;
                                }

                                _context15.next = 11;
                                return this.build(name);

                            case 11:
                            case 'end':
                                return _context15.stop();
                        }
                    }
                }, _callee15, this);
            }));

            function run() {
                return _ref17.apply(this, arguments);
            }

            return run;
        }()
    }]);
    return Kgr;
}();

exports.default = Kgr;
module.exports = exports.default;