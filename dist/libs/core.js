'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.gulpCUD = exports.findDependen = exports.tasks = exports.runShell = exports.getAbsPath = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _find2 = require('lodash/find');

var _find3 = _interopRequireDefault(_find2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _map2 = require('lodash/map');

var _map3 = _interopRequireDefault(_map2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var tasks = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(processes) {
        var data, work;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if ((0, _isArray3.default)(processes)) {
                            _context2.next = 2;
                            break;
                        }

                        return _context2.abrupt('return');

                    case 2:
                        data = null;

                    case 3:
                        work = processes.shift();

                        if ((0, _isFunction3.default)(work)) {
                            _context2.next = 6;
                            break;
                        }

                        return _context2.abrupt('continue', 16);

                    case 6:
                        _context2.prev = 6;
                        _context2.next = 9;
                        return work(data);

                    case 9:
                        data = _context2.sent;
                        _context2.next = 16;
                        break;

                    case 12:
                        _context2.prev = 12;
                        _context2.t0 = _context2['catch'](6);

                        console.error(_context2.t0);
                        throw _context2.t0;

                    case 16:
                        if (processes.length) {
                            _context2.next = 3;
                            break;
                        }

                    case 17:
                        return _context2.abrupt('return', data);

                    case 18:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[6, 12]]);
    }));

    return function tasks(_x3) {
        return _ref2.apply(this, arguments);
    };
}();

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _detectImportRequire = require('detect-import-require');

var _detectImportRequire2 = _interopRequireDefault(_detectImportRequire);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)(_package2.default.name + ':core');

var noop = function noop() {};

var findDependen = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(files) {
        var result, _loop, _ret;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(0, _isArray3.default)(files)) {
                            files = [files];
                        }
                        result = [];

                        _loop = function _loop() {
                            var file = files.shift();
                            if (_path3.default.extname(file) === '') {
                                files.push('' + _path3.default.resolve(file, 'index.js'));
                                files.push(file + '.js');
                                return 'continue';
                            }
                            if (!_fs2.default.existsSync(file)) {
                                return 'continue';
                            }
                            var stat = _fs2.default.statSync(file);

                            if (!stat.isFile() || !/\.js$/.test(file)) {
                                return 'continue';
                            }
                            var content = _fs2.default.readFileSync(file, 'utf8');

                            result.push(file);
                            var dep = (0, _map3.default)((0, _detectImportRequire2.default)(content), function (f) {
                                return getAbsPath(f, _path3.default.dirname(file));
                            });
                            files = files.concat(dep);
                        };

                    case 3:
                        if (!files.length) {
                            _context.next = 9;
                            break;
                        }

                        _ret = _loop();

                        if (!(_ret === 'continue')) {
                            _context.next = 7;
                            break;
                        }

                        return _context.abrupt('continue', 3);

                    case 7:
                        _context.next = 3;
                        break;

                    case 9:
                        return _context.abrupt('return', result);

                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function findDependen(_x) {
        return _ref.apply(this, arguments);
    };
}();

function getAbsPath(output, base) {
    var isAbs = _path3.default.isAbsolute(output);
    base = base || process.cwd();
    log('base cwd ' + base);
    output = isAbs ? output : _path3.default.resolve(base, output);
    return output;
}

function runShell(cmd) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!cmd) {
        return;
    }
    log('run shell cmd : ' + cmd);
    return new _promise2.default(function (resolve, reject) {
        var child = (0, _child_process.exec)(cmd, (0, _extends3.default)({
            maxBuffer: 20000 * 1024,
            env: (0, _extends3.default)({
                FORCE_COLOR: 1,
                COLOR: 'always',
                NPM_CONFIG_COLOR: 'always'
            }, process.env, options.env || {})
        }, options), function (error, stdout, stderr) {
            if (error) {
                console.log(cmd, error);
                reject(error);
                return;
            }
            resolve([stdout, stderr, child]);
        });
        console.log('---exec ' + cmd + ' start--- ');
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    });
}

function gulpCUD(replaces, tmp, dest, conf) {
    var add = [];
    var remove = [];
    var repl = [];
    replaces = (0, _map3.default)(replaces, function (file) {
        file.source = !file.source ? file.source : getAbsPath(file.source, _path3.default.dirname(conf.__filename));
        file.target = !file.target ? file.target : getAbsPath(file.target, tmp);
        if (_fs2.default.existsSync(file.source) && !_fs2.default.existsSync(file.target)) {
            add.push(file);
        }
        if (!_fs2.default.existsSync(file.source) && _fs2.default.existsSync(file.target)) {
            remove.push(file);
        }
        if (_fs2.default.existsSync(file.source) && _fs2.default.existsSync(file.target)) {
            repl.push(file);
        }
        return file;
    });

    var stream = _through2.default.obj(function (file, enc, cb) {
        var _path = file.path;
        var find = (0, _find3.default)(replaces, function (_file) {
            return _file.target === _path;
        });
        var has = true;
        if (find.source) {
            file.contents = _fs2.default.readFile();
        } else {
            try {
                _del2.default.sync(_path3.default.resolve(dest, relative));
            } catch (e) {
                console.log(e);
            }
            has = false;
        }
        if (file.relative) {}
        // 确保文件进入下一个 gulp 插件
        if (has) {}
        this.push(file);
        // 告诉 stream 引擎，我们已经处理完了这个文件
        cb();
    });

    return stream;
}

exports.getAbsPath = getAbsPath;
exports.runShell = runShell;
exports.tasks = tasks;
exports.findDependen = findDependen;
exports.gulpCUD = gulpCUD;