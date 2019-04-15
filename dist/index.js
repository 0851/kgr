'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _isRegExp2 = require('lodash/isRegExp');

var _isRegExp3 = _interopRequireDefault(_isRegExp2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _reduce2 = require('lodash/reduce');

var _reduce3 = _interopRequireDefault(_reduce2);

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

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _gulp2 = require('gulp');

var _gulp3 = _interopRequireDefault(_gulp2);

var _gulpReplace = require('gulp-replace');

var _gulpReplace2 = _interopRequireDefault(_gulpReplace);

var _parseConfig = require('./libs/parse-config');

var _core = require('./libs/core');

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)(_package2.default.name);

var Kgr = function () {
    function Kgr(args) {
        (0, _classCallCheck3.default)(this, Kgr);

        this.setArgs(args);
        log('---start---');
        this.setConfig();
        this.cache = {};
    }

    (0, _createClass3.default)(Kgr, [{
        key: 'setArgs',
        value: function setArgs(args) {
            args.source = args.source || '.source';
            args.output = args.output || 'output';
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
        value: function sourcePath() {
            var source = this.getArgs().source;
            source = (0, _core.getAbsPath)(source);
            source = _path2.default.resolve(source);
            return source;
        }
    }, {
        key: 'outputPath',
        value: function outputPath() {
            var output = this.getArgs().output;
            output = (0, _core.getAbsPath)(output);
            output = _path2.default.resolve(output);
            return output;
        }
    }, {
        key: 'init',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(name) {
                var _this = this;

                var conf, args, url, version, source, output, sourcePath, outputPath, successFile, versionFile, tarName, tar, _init, _copyOutput;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                conf = this.configForName(name);
                                args = this.getArgs();
                                url = conf.remote;
                                version = conf.version;
                                source = args.source;
                                output = args.output;
                                sourcePath = this.sourcePath(conf);
                                outputPath = this.outputPath(conf);
                                successFile = '.kgr_success';
                                versionFile = '.kgr_version_' + conf.version;
                                tarName = conf.name + '-' + version + '.tar.gz';

                                tar = function () {
                                    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        _context.next = 2;
                                                        return (0, _core.runShell)('cd ' + version + ' && tar --exclude .git --exclude ' + successFile + ' -zcf ../' + tarName + ' . && echo \'success\' > ' + successFile, {
                                                            cwd: sourcePath
                                                        });

                                                    case 2:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this);
                                    }));

                                    return function tar() {
                                        return _ref2.apply(this, arguments);
                                    };
                                }();

                                _init = function () {
                                    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                                        var _ref4, stdout, stderr;

                                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        _context2.next = 2;
                                                        return (0, _core.runShell)('git version');

                                                    case 2:
                                                        _ref4 = _context2.sent;
                                                        stdout = _ref4.stdout;
                                                        stderr = _ref4.stderr;

                                                        if (/version/.test(stdout)) {
                                                            _context2.next = 7;
                                                            break;
                                                        }

                                                        throw new Error('please install git on your pc');

                                                    case 7:
                                                        _context2.next = 9;
                                                        return (0, _core.runShell)('rm -rf ' + version + ' && git clone --depth=1 -b ' + version + ' ' + url + ' ' + version + ' && cd ' + version, {
                                                            cwd: sourcePath
                                                        });

                                                    case 9:
                                                        _context2.next = 11;
                                                        return _promise2.default.all((0, _core.generateShells)(conf.bash, null, _path2.default.resolve(sourcePath, version)));

                                                    case 11:
                                                        _context2.next = 13;
                                                        return tar();

                                                    case 13:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, _this);
                                    }));

                                    return function _init() {
                                        return _ref3.apply(this, arguments);
                                    };
                                }();

                                if (!args.init) {
                                    _context4.next = 16;
                                    break;
                                }

                                _context4.next = 16;
                                return _init();

                            case 16:
                                if (!args.repull) {
                                    _context4.next = 21;
                                    break;
                                }

                                _context4.next = 19;
                                return (0, _core.runShell)('git pull', {
                                    cwd: _path2.default.resolve(sourcePath, version)
                                });

                            case 19:
                                _context4.next = 21;
                                return tar();

                            case 21:
                                if (!args.retar) {
                                    _context4.next = 24;
                                    break;
                                }

                                _context4.next = 24;
                                return tar();

                            case 24:
                                if (_fs2.default.existsSync(_path2.default.resolve(sourcePath, successFile))) {
                                    _context4.next = 27;
                                    break;
                                }

                                _context4.next = 27;
                                return _init();

                            case 27:
                                _copyOutput = function () {
                                    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                                            while (1) {
                                                switch (_context3.prev = _context3.next) {
                                                    case 0:
                                                        log('cp start');
                                                        _context3.next = 3;
                                                        return (0, _core.runShell)('rm -rf ' + output + ' && mkdir -p ' + output + ' && cd ' + output + ' && tar -zxf ' + _path2.default.relative(outputPath, _path2.default.resolve(sourcePath, tarName)) + ' && echo \'' + version + '\' > ' + versionFile);

                                                    case 3:
                                                        log('cp end');

                                                    case 4:
                                                    case 'end':
                                                        return _context3.stop();
                                                }
                                            }
                                        }, _callee3, _this);
                                    }));

                                    return function _copyOutput() {
                                        return _ref5.apply(this, arguments);
                                    };
                                }();

                                if (!args.copy) {
                                    _context4.next = 31;
                                    break;
                                }

                                _context4.next = 31;
                                return _copyOutput();

                            case 31:
                                if (_fs2.default.existsSync(_path2.default.resolve(outputPath, '' + versionFile))) {
                                    _context4.next = 34;
                                    break;
                                }

                                _context4.next = 34;
                                return _copyOutput();

                            case 34:
                                return _context4.abrupt('return', conf);

                            case 35:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function init(_x) {
                return _ref.apply(this, arguments);
            }

            return init;
        }()
    }, {
        key: 'gulp',
        value: function gulp(name) {
            var _this2 = this;

            return new _promise2.default(function (resolve, reject) {
                try {
                    var self = _this2;
                    var conf = _this2.configForName(name);
                    console.log('' + _chalk2.default.green('run pipe task...'));
                    var tmp = _path2.default.resolve(_this2.sourcePath(conf), conf.version);
                    var output = _this2.outputPath(conf);
                    var opt = { base: tmp, cwd: tmp };
                    var glob = ['**/{*,.*}', '!**/package.json', '!**/package-lock.json', '!**/yarn.lock', '!**/{bower_components,node_modules,dist,build}/**', '!**/{*,.*}.{tar.gz,swf,mp4,webm,ogg,mp3,wav,flac,aac,png,jpg,gif,svg,eot,woff,woff2,ttf,otf,swf}'];

                    if (conf.glob) {
                        conf.glob = (0, _isArray3.default)(conf.glob) ? conf.glob : [conf.glob];
                        glob = glob.concat(conf.glob);
                    }

                    var removeGlob = [];
                    if (conf.remove) {
                        //过滤掉源 , 避免再次push到output中
                        removeGlob = _globby2.default.sync(conf.remove, opt).map(function (file) {
                            //删除时清除缓存 , 以便下次重建
                            delete self.cache[file];
                            console.log(_chalk2.default.underline.yellow('file        removed   ::   ' + file));
                            return '!' + file;
                        });
                    }

                    log('gulp matched start');
                    log('' + glob.join('\n'));
                    log('gulp removeGlob start');
                    log('' + removeGlob.join('\n'));
                    var matched = _globby2.default.sync(glob.concat(removeGlob), opt);
                    log('gulp matched end ' + (0, _stringify2.default)(matched));

                    //得到需要追加或替换的文件
                    var files = (0, _core.getFiles)(conf.replace, _path2.default.dirname(conf.__filename), matched);

                    var sourceFiles = [];
                    var stream = _gulp3.default.src(matched, opt);

                    log('gulp file replace start');
                    //对流进行预先处理 , 追加文件,替换文件,删除文件,等
                    stream = stream.pipe((0, _core.gulpAddReplace)(files, tmp));
                    stream = stream.pipe((0, _core.gulpChangeByLine)(conf['changeByLine']));
                    log('gulp file replace end');

                    var pipes = conf.pipe;
                    if (!(0, _isArray3.default)(pipes)) {
                        pipes = [];
                    }

                    log('gulp content replace start' + pipes);

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
                    log('gulp record start');
                    stream = stream.pipe(_through2.default.obj(function (file, encoding, cb) {
                        sourceFiles.push(file.relative);
                        var contents = file.checksum;
                        if (file.isBuffer()) {
                            contents = file.contents.toString('utf8');
                        }

                        if (file.is_append === true) {
                            console.log(_chalk2.default.underline.green('file          newed   ::   ' + file.relative));
                        }
                        if (file.is_replace === true) {
                            console.log(_chalk2.default.underline.green('file        changed   ::   ' + file.relative));
                        }

                        if (!self.cache.hasOwnProperty(file.relative)) {
                            console.log(_chalk2.default.underline.green('content        init   ::   ' + file.relative));
                            this.push(file);
                            self.cache[file.relative] = contents;
                        }
                        if (self.cache[file.relative] !== contents) {
                            console.log(_chalk2.default.underline.green('content     changed   ::   ' + file.relative));
                            this.push(file);
                            self.cache[file.relative] = contents;
                        }
                        cb();
                    }));

                    log('gulp record end');
                    var _end = function _end() {
                        log('clean start');
                        //清理已删除或不应存在在output目录中的文件
                        var distFiles = _globby2.default.sync(glob, { base: output, cwd: output });
                        log('sourceFiles ' + (0, _stringify2.default)(sourceFiles));
                        log('distFiles ' + (0, _stringify2.default)(distFiles));
                        var versionFile = '.kgr_version_' + conf.version;
                        //删除时清除缓存 , 以便下次重建
                        var matched = (0, _core.diffSourceAndDist)(sourceFiles, distFiles);
                        (0, _each3.default)(matched, function (file) {
                            if (file === versionFile) {
                                return;
                            }
                            var _file = _path2.default.resolve(output, file);
                            console.log(_chalk2.default.underline.yellow('file          clean   ::   ' + file));
                            _del2.default.sync(_file);
                            //删除时清除缓存 , 以便下次重建
                            delete self.cache[file];
                        });
                        log('clean end');
                        log('end pipe...');
                        console.log('' + _chalk2.default.green('end pipe task...'));
                        resolve(conf);
                    };
                    var _error = function _error(err) {
                        log('error pipe... ' + err);
                        reject(err);
                    };
                    stream.pipe(_gulp3.default.dest('' + output)).on('end', _end).on('error', _error);
                } catch (e) {
                    reject(e);
                }
            });
        }
    }, {
        key: 'runGulp',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(command, name) {
                var conf, output, cmd;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.prev = 0;
                                _context5.next = 3;
                                return this.gulp(name);

                            case 3:
                                conf = this.configForName(name);
                                output = this.outputPath(conf);

                                if (_fs2.default.existsSync(output)) {
                                    _context5.next = 7;
                                    break;
                                }

                                throw new Error('cann\'t fount output path ' + output);

                            case 7:
                                cmd = conf[command];

                                if (!cmd) {
                                    _context5.next = 14;
                                    break;
                                }

                                if (this.bash) {
                                    (0, _each3.default)(this.bash, function (shell) {
                                        shell && shell.kill && shell.kill();
                                    });
                                }
                                this.bash = (0, _core.generateShells)(cmd, null, output);
                                console.log('' + _chalk2.default.green.underline('success run : ' + cmd + ' ' + output));
                                _context5.next = 14;
                                return _promise2.default.all(this.bash);

                            case 14:
                                console.log('' + _chalk2.default.green.underline('success run : ' + cmd + ' ' + output));
                                _context5.next = 20;
                                break;

                            case 17:
                                _context5.prev = 17;
                                _context5.t0 = _context5['catch'](0);
                                throw _context5.t0;

                            case 20:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[0, 17]]);
            }));

            function runGulp(_x2, _x3) {
                return _ref6.apply(this, arguments);
            }

            return runGulp;
        }()
    }, {
        key: 'devServer',
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(name) {
                var _this3 = this;

                var watch;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                watch = function () {
                                    var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
                                        var conf, files;
                                        return _regenerator2.default.wrap(function _callee7$(_context7) {
                                            while (1) {
                                                switch (_context7.prev = _context7.next) {
                                                    case 0:
                                                        _context7.prev = 0;
                                                        conf = _this3.configForName(name);
                                                        _context7.next = 4;
                                                        return (0, _core.findDependen)(conf.__filename);

                                                    case 4:
                                                        files = _context7.sent;

                                                        files = files.concat((0, _core.getExistsReplace)(conf.replace, _path2.default.dirname(conf.__filename)));
                                                        log('watch start ... , ' + files);
                                                        _gulp3.default.watch(files, function () {
                                                            var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(event) {
                                                                return _regenerator2.default.wrap(function _callee6$(_context6) {
                                                                    while (1) {
                                                                        switch (_context6.prev = _context6.next) {
                                                                            case 0:
                                                                                _context6.prev = 0;

                                                                                console.log('' + _chalk2.default.yellow('File ' + event.path + ' was ' + event.type + ' , running tasks...'));
                                                                                _context6.next = 4;
                                                                                return _this3.runGulp('restart', name);

                                                                            case 4:
                                                                                _context6.next = 9;
                                                                                break;

                                                                            case 6:
                                                                                _context6.prev = 6;
                                                                                _context6.t0 = _context6['catch'](0);

                                                                                console.error(_context6.t0);

                                                                            case 9:
                                                                            case 'end':
                                                                                return _context6.stop();
                                                                        }
                                                                    }
                                                                }, _callee6, _this3, [[0, 6]]);
                                                            }));

                                                            return function (_x5) {
                                                                return _ref9.apply(this, arguments);
                                                            };
                                                        }());
                                                        _context7.next = 13;
                                                        break;

                                                    case 10:
                                                        _context7.prev = 10;
                                                        _context7.t0 = _context7['catch'](0);

                                                        console.error(_context7.t0);

                                                    case 13:
                                                    case 'end':
                                                        return _context7.stop();
                                                }
                                            }
                                        }, _callee7, _this3, [[0, 10]]);
                                    }));

                                    return function watch() {
                                        return _ref8.apply(this, arguments);
                                    };
                                }();

                                _context8.next = 3;
                                return this.runGulp('start', name);

                            case 3:
                                _context8.next = 5;
                                return watch();

                            case 5:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function devServer(_x4) {
                return _ref7.apply(this, arguments);
            }

            return devServer;
        }()
    }, {
        key: 'dev',
        value: function () {
            var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(name) {
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

            function dev(_x6) {
                return _ref10.apply(this, arguments);
            }

            return dev;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(name) {
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
                                    return _regenerator2.default.wrap(function _callee13$(_context13) {
                                        while (1) {
                                            switch (_context13.prev = _context13.next) {
                                                case 0:
                                                    _context13.next = 2;
                                                    return _this5.runGulp('build', name);

                                                case 2:
                                                case 'end':
                                                    return _context13.stop();
                                            }
                                        }
                                    }, _callee13, _this5);
                                }))]);

                            case 2:
                            case 'end':
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function build(_x7) {
                return _ref13.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'run',
        value: function () {
            var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
                var args, name, mode;
                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                _context15.prev = 0;
                                args = this.getArgs();
                                name = args.name || this.setConfig()[0].name;
                                mode = args.mode || 'dev';

                                if (name) {
                                    _context15.next = 6;
                                    break;
                                }

                                throw new Error('请设置一个启动项目的名称');

                            case 6:
                                if (!(mode === 'dev')) {
                                    _context15.next = 9;
                                    break;
                                }

                                _context15.next = 9;
                                return this.dev(name);

                            case 9:
                                if (!(mode === 'build')) {
                                    _context15.next = 12;
                                    break;
                                }

                                _context15.next = 12;
                                return this.build(name);

                            case 12:
                                _context15.next = 17;
                                break;

                            case 14:
                                _context15.prev = 14;
                                _context15.t0 = _context15['catch'](0);

                                console.error(_context15.t0);

                            case 17:
                            case 'end':
                                return _context15.stop();
                        }
                    }
                }, _callee15, this, [[0, 14]]);
            }));

            function run() {
                return _ref16.apply(this, arguments);
            }

            return run;
        }()
    }]);
    return Kgr;
}();

exports.default = Kgr;
module.exports = exports.default;