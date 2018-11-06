"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.tasks = exports.runShell = exports.getAbsPath = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _isFunction2 = require("lodash/isFunction");

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _isArray2 = require("lodash/isArray");

var _isArray3 = _interopRequireDefault(_isArray2);

var tasks = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(processes) {
        var data, work;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if ((0, _isArray3.default)(processes)) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt("return");

                    case 2:
                        data = null;

                    case 3:
                        work = processes.shift();

                        if ((0, _isFunction3.default)(work)) {
                            _context.next = 6;
                            break;
                        }

                        return _context.abrupt("continue", 15);

                    case 6:
                        _context.prev = 6;
                        _context.next = 9;
                        return work(data);

                    case 9:
                        data = _context.sent;
                        _context.next = 15;
                        break;

                    case 12:
                        _context.prev = 12;
                        _context.t0 = _context["catch"](6);
                        throw _context.t0;

                    case 15:
                        if (processes.length) {
                            _context.next = 3;
                            break;
                        }

                    case 16:
                        return _context.abrupt("return", data);

                    case 17:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[6, 12]]);
    }));

    return function tasks(_x2) {
        return _ref.apply(this, arguments);
    };
}();

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _package = require("../../package.json");

var _package2 = _interopRequireDefault(_package);

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)(_package2.default.name + ":core");

var noop = function noop() {};

function getAbsPath(output, base) {
    var isAbs = _path2.default.isAbsolute(output);
    base = base || process.cwd();
    log("base cwd " + base);
    output = isAbs ? output : _path2.default.resolve(base, output);
    return output;
}

function runShell(cmd) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!cmd) {
        return;
    }
    log("run shell cmd : " + cmd);
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
            resolve([stdout, stderr]);
        });
        console.log("---exec " + cmd + " start--- ");
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    });
}

exports.getAbsPath = getAbsPath;
exports.runShell = runShell;
exports.tasks = tasks;