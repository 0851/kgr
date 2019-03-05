'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.gulpChangeByLine = exports.diffSourceAndDist = exports.getExistsReplace = exports.getFiles = exports.gulpAddReplace = exports.generateShells = exports.findDependen = exports.tasks = exports.runShell = exports.getAbsPath = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _reduce2 = require('lodash/reduce');

var _reduce3 = _interopRequireDefault(_reduce2);

var _filter2 = require('lodash/filter');

var _filter3 = _interopRequireDefault(_filter2);

var _keyBy2 = require('lodash/keyBy');

var _keyBy3 = _interopRequireDefault(_keyBy2);

var _find3 = require('lodash/find');

var _find4 = _interopRequireDefault(_find3);

var _forEach2 = require('lodash/forEach');

var _forEach3 = _interopRequireDefault(_forEach2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

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

                        return _context2.abrupt('continue', 15);

                    case 6:
                        _context2.prev = 6;
                        _context2.next = 9;
                        return work(data);

                    case 9:
                        data = _context2.sent;
                        _context2.next = 15;
                        break;

                    case 12:
                        _context2.prev = 12;
                        _context2.t0 = _context2['catch'](6);

                        console.error(_context2.t0);

                    case 15:
                        if (processes.length) {
                            _context2.next = 3;
                            break;
                        }

                    case 16:
                        return _context2.abrupt('return', data);

                    case 17:
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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _execa = require('execa');

var _execa2 = _interopRequireDefault(_execa);

var _detectImportRequire = require('detect-import-require');

var _detectImportRequire2 = _interopRequireDefault(_detectImportRequire);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _vinyl = require('vinyl');

var _vinyl2 = _interopRequireDefault(_vinyl);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

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
                            if (_path2.default.extname(file) === '') {
                                files.push('' + _path2.default.resolve(file, 'index.js'));
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
                                return getAbsPath(f, _path2.default.dirname(file));
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
    var isAbs = _path2.default.isAbsolute(output);
    base = base || process.cwd();
    log('base cwd ' + base);
    output = isAbs ? output : _path2.default.resolve(base, output);
    return output;
}

function runShell(cmd) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!cmd) {
        return;
    }
    console.log(_chalk2.default.green('run shell cmd : ' + cmd));
    var child = (0, _execa2.default)(cmd, (0, _extends3.default)({
        shell: true,
        maxBuffer: 1000000000,
        // stdio: [ 0, 1, 2 ],
        env: (0, _extends3.default)({
            FORCE_COLOR: true,
            COLOR: 'always',
            NPM_CONFIG_COLOR: 'always'
        }, process.env, options.env || {})
    }, options));
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    return child.then(function (child) {
        return child;
    }).catch(function (e) {
        throw e;
    });
}

function getExistsReplace(replaces, source) {
    var files = [];
    (0, _each3.default)(replaces, function (value, key) {
        if (!(0, _isString3.default)(value) || !(0, _isString3.default)(key)) {
            return;
        }
        value = !value ? value : getAbsPath(value, source);
        if (value && _fs2.default.existsSync(value)) {
            files.push(value);
        }
    });
    return files;
}

function getFiles(replaces, source, matched) {
    var files = {
        add: [],
        replace: []
    };
    (0, _forEach3.default)(replaces, function (value, key) {
        if (!(0, _isString3.default)(value) || !(0, _isString3.default)(key)) {
            return;
        }
        var source = !value ? undefined : getAbsPath(value, source);
        if (!source || !_fs2.default.existsSync(source)) {
            return;
        }
        var _find = (0, _find4.default)(matched, function (_match) {
            return _match === key;
        });
        if (_find) {
            files.replace.push({
                source: source,
                target: key
            });
        } else {
            files.add.push({
                source: source,
                target: key
            });
        }
    });
    return files;
}

function gulpAddReplace(files, source) {
    var stream = _through2.default.obj(function (file, enc, cb) {
        var _relative = file.relative;
        var find = (0, _find4.default)(files.replace, function (_file) {
            return _file.target === _relative;
        });
        if (find) {
            var content = _fs2.default.readFileSync(find.source);
            file.contents = content;
            file.is_replace = true;
        }
        this.push(file);
        cb();
    });
    log('add files ' + (0, _stringify2.default)(files.add));
    log('replace files ' + (0, _stringify2.default)(files.replace));
    (0, _each3.default)(files.add, function (add) {
        var content = _fs2.default.readFileSync(add.source);
        var vl = new _vinyl2.default({
            cwd: source,
            base: source,
            path: '' + _path2.default.resolve(source, add.target),
            contents: content
        });
        vl.is_append = true;
        stream.push(vl);
    });
    return stream;
}

function gulpChangeByLine(options) {
    return _through2.default.obj(function (file, enc, cb) {
        if (!file.isBuffer()) {
            this.push(file);
            cb();
            return;
        }
        var relative = file.relative;

        var contents = file.contents.toString('utf8').replace(/\r\n/, '\n').replace(/\r/, '\n').split(/\n/);

        contents = contents.map(function (text, number) {
            var method = options[relative + ':' + (number + 1)];
            if ((0, _isFunction3.default)(method)) {
                console.log(_chalk2.default.underline.green('content     changedByLine   ::   ' + file.relative));
                return method(number, text);
            } else if ((0, _isString3.default)(method)) {
                console.log(_chalk2.default.underline.green('content     changedByLine   ::   ' + file.relative));
                return method;
            } else {
                return text;
            }
        });

        file.contents = new Buffer(contents.join('\n'));

        this.push(file);
        cb();
    });
}

function diffSourceAndDist(exists, cleanFiles) {
    var existMap = (0, _keyBy3.default)(exists, function (exist) {
        return exist;
    });
    return (0, _filter3.default)(cleanFiles, function (file) {
        return !existMap[file];
    });
}

function generateShells(bash, config, root) {
    if (!(0, _isArray3.default)(bash)) {
        bash = [bash];
    }
    var shells = (0, _reduce3.default)(bash, function (res, b) {
        if ((0, _isString3.default)(b)) {
            var conf = (0, _extends3.default)({}, config);
            conf.cwd = _path2.default.resolve(root, conf.cwd || '');
            res.push(runShell(b, conf));
        }
        if ((0, _isArray3.default)(b)) {
            var st = b[0];
            var _conf = (0, _extends3.default)({}, config, b[1]);
            _conf.cwd = _path2.default.resolve(root, _conf.cwd || '');
            res.push(runShell(st, _conf));
        }
        return res;
    }, []);
    return shells;
}

exports.getAbsPath = getAbsPath;
exports.runShell = runShell;
exports.tasks = tasks;
exports.findDependen = findDependen;
exports.generateShells = generateShells;
exports.gulpAddReplace = gulpAddReplace;
exports.getFiles = getFiles;
exports.getExistsReplace = getExistsReplace;
exports.diffSourceAndDist = diffSourceAndDist;
exports.gulpChangeByLine = gulpChangeByLine;