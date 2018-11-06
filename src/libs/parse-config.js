import _ from "lodash";
import globby from "globby";
import chalk from "chalk";
import debug from 'debug'
import {getAbsPath} from './core.js'
import pkg from "../../package.json";


const log = debug(`${pkg.name}:parse`);

function readConfig(config) {
    log(`config ---> ${JSON.stringify(config)}`)

    if (!config) {
        return []
    }
    config = _.map(config, (conf) => {
        return getAbsPath(conf)
    })
    log(`config ---> ${JSON.stringify(config)}`)

    const files = globby.sync(config);
    log(`files ---> ${JSON.stringify(files)}`)
    const options = _.reduce(files, (res, file) => {
        if (!/js(on)?$/.test(file)) {
            return res;
        }

        let obj = require(file);
        log(`obj ---> ${obj},${typeof obj},${JSON.stringify(obj)}`);
        if (_.isFunction(obj)) {
            obj = obj(file)
            log(`obj ---> isFunction ${JSON.stringify(obj)}`)
        }
        if (_.isPlainObject(obj)) {

            obj = [obj]
            log(`obj ---> isPlainObject ${JSON.stringify(obj)}`)
        }
        if (!_.isArray(obj)) {
            return res;
        }
        obj = _.map(obj, (o) => {
            o.__filename = file
            return o
        })
        const verification = verifyConfig(obj);
        if (verification.ok !== true) {
            throw new Error(`${chalk.red.underline(`config verify error : '${verification.message}' ; config file path ${file}`)}`)
        }
        res = res.concat(obj);
        return res
    }, []);

    return options;
}

function verifyConfig(options) {
    log(`options ---> ${JSON.stringify(options)}`)
    const result = _.reduce(options, (verify, option) => {
        let mustInput = ['name', 'remote'];
        let choiceInput = [['branch', 'tag']];
        const keys = Object.keys(option);
        log(`keys ---> ${keys}`)
        while (mustInput.length) {
            let must = mustInput.shift();
            if (!keys.includes(must)) {
                return {
                    ok: false,
                    message: `${must} 为必填`
                }
            }
            if (!option[must]) {
                return {
                    ok: false,
                    message: `${must} 值不能为空`
                }
            }
        }
        while (choiceInput.length) {
            let choice = choiceInput.shift();
            let choiceString = choice.join(',');
            let has = false;
            let hasValue = false;
            while (choice.length) {
                let key = choice.shift();
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
                    message: `${choiceString} 为之中必须包含一个`
                }
            }
            if (hasValue === false) {
                return {
                    ok: false,
                    message: `${choiceString} 为之中值必须填写一个`
                }
            }
        }
        return {
            ok: true,
            message: '参数验证通过'
        }
    }, {
        ok: false,
        message: '参数验证失败'
    });
    log(`verify ---> ${JSON.stringify(result)}`)
    return result;
}

export {
    readConfig,
    verifyConfig
}