"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.verifyConfig = exports.readConfig = undefined;

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _isArray2 = require("lodash/isArray");

var _isArray3 = _interopRequireDefault(_isArray2);

var _isPlainObject2 = require("lodash/isPlainObject");

var _isPlainObject3 = _interopRequireDefault(_isPlainObject2);

var _isFunction2 = require("lodash/isFunction");

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _reduce2 = require("lodash/reduce");

var _reduce3 = _interopRequireDefault(_reduce2);

var _map2 = require("lodash/map");

var _map3 = _interopRequireDefault(_map2);

var _globby = require("globby");

var _globby2 = _interopRequireDefault(_globby);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _core = require("./core.js");

var _package = require("../../package.json");

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)(_package2.default.name + ":parse");

function readConfig(config) {
    log("config ---> " + (0, _stringify2.default)(config));

    if (!config) {
        return [];
    }
    config = (0, _map3.default)(config, function (conf) {
        return (0, _core.getAbsPath)(conf);
    });
    log("config ---> " + (0, _stringify2.default)(config));

    var files = _globby2.default.sync(config);
    log("files ---> " + (0, _stringify2.default)(files));
    var options = (0, _reduce3.default)(files, function (res, file) {
        if (!/js(on)?$/.test(file)) {
            return res;
        }
        //删除缓存
        delete require.cache[require.resolve(file)];
        var obj = require(file);
        log("obj ---> " + obj + "," + (typeof obj === "undefined" ? "undefined" : (0, _typeof3.default)(obj)) + "," + (0, _stringify2.default)(obj));
        if ((0, _isFunction3.default)(obj)) {
            obj = obj(file);
            log("obj ---> isFunction " + (0, _stringify2.default)(obj));
        }
        if ((0, _isPlainObject3.default)(obj)) {

            obj = [obj];
            log("obj ---> isPlainObject " + (0, _stringify2.default)(obj));
        }
        if (!(0, _isArray3.default)(obj)) {
            return res;
        }
        obj = (0, _map3.default)(obj, function (o) {
            o.__filename = file;
            return o;
        });
        var verification = verifyConfig(obj);
        if (verification.ok !== true) {
            throw new Error("" + _chalk2.default.red.underline("config verify error : '" + verification.message + "' ; config file path " + file));
        }
        res = res.concat(obj);
        return res;
    }, []);

    return options;
}

function verifyConfig(options) {
    log("options ---> " + (0, _stringify2.default)(options));
    var result = (0, _reduce3.default)(options, function (verify, option) {
        var mustInput = ['name', 'remote'];
        var choiceInput = [['branch', 'tag']];
        var keys = (0, _keys2.default)(option);
        log("keys ---> " + keys);
        while (mustInput.length) {
            var must = mustInput.shift();
            if (!keys.includes(must)) {
                return {
                    ok: false,
                    message: must + " \u4E3A\u5FC5\u586B"
                };
            }
            if (!option[must]) {
                return {
                    ok: false,
                    message: must + " \u503C\u4E0D\u80FD\u4E3A\u7A7A"
                };
            }
        }
        while (choiceInput.length) {
            var choice = choiceInput.shift();
            var choiceString = choice.join(',');
            var has = false;
            var hasValue = false;
            while (choice.length) {
                var key = choice.shift();
                if (keys.includes(key)) {
                    has = true;
                }
                if (option[key]) {
                    hasValue = true;
                }
            }
            if (has === false) {
                return {
                    ok: false,
                    message: choiceString + " \u4E3A\u4E4B\u4E2D\u5FC5\u987B\u5305\u542B\u4E00\u4E2A"
                };
            }
            if (hasValue === false) {
                return {
                    ok: false,
                    message: choiceString + " \u4E3A\u4E4B\u4E2D\u503C\u5FC5\u987B\u586B\u5199\u4E00\u4E2A"
                };
            }
        }
        return {
            ok: true,
            message: '参数验证通过'
        };
    }, {
        ok: false,
        message: '参数验证失败'
    });
    log("verify ---> " + (0, _stringify2.default)(result));
    return result;
}

exports.readConfig = readConfig;
exports.verifyConfig = verifyConfig;