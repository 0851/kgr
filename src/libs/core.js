import path from 'path';
import debug from 'debug';
import pkg from '../../package.json';
import _ from 'lodash';
import fs from 'fs';
import {spawn, exec} from 'child_process';
import detect from 'detect-import-require';
import through from 'through2';
import globby from 'globby';
import del from 'del';
import Vinyl from 'vinyl';
import chalk from "chalk";

const log = debug(`${pkg.name}:core`);

const noop = () => {
};

const findDependen = async (files) => {
    if (!_.isArray(files)) {
        files = [files];
    }
    const result = [];
    while (files.length) {
        let file = files.shift();
        if (path.extname(file) === '') {
            files.push(`${path.resolve(file, 'index.js')}`);
            files.push(`${file}.js`);
            continue;
        }
        if (!fs.existsSync(file)) {
            continue;
        }
        const stat = fs.statSync(file);

        if (!stat.isFile() || !/\.js$/.test(file)) {
            continue;
        }
        const content = fs.readFileSync(file, 'utf8');

        result.push(file);
        const dep = _.map(detect(content), (f) => {
            return getAbsPath(f, path.dirname(file));
        });
        files = files.concat(dep);
    }
    return result;
};

function getAbsPath(output, base) {
    const isAbs = path.isAbsolute(output);
    base = base || process.cwd();
    log(`base cwd ${base}`);
    output = isAbs ? output : path.resolve(base, output);
    return output;
}

function runShell(cmd, options = {}) {
    if (!cmd) {
        return;
    }
    log(`run shell cmd : ${cmd}`);
    return new Promise(function (resolve, reject) {
        const child = exec(
            cmd,
            {
                ...{
                    maxBuffer: 20000 * 1024,
                    env: {
                        ...{
                            FORCE_COLOR: 1,
                            COLOR: 'always',
                            NPM_CONFIG_COLOR: 'always'
                        },
                        ...process.env,
                        ...(options.env || {})
                    }
                },
                ...options
            },
            (error, stdout, stderr) => {
                if (error) {
                    console.log(cmd, error);
                    reject(error);
                    return;
                }
                resolve([stdout, stderr, child]);
            }
        );
        console.log(`---exec ${cmd} start--- `);
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    });
}

async function tasks(processes) {
    if (!_.isArray(processes)) {
        return;
    }
    let data = null;
    do {
        let work = processes.shift();
        if (!_.isFunction(work)) {
            continue;
        }
        try {
            data = await work(data);
        } catch (e) {
            console.error(e);
            throw e;
        }
    } while (processes.length);
    return data;
}

function getExistsReplace(replaces, source) {
    const files = []
    _.each(replaces, (value, key) => {
        if (!_.isString(value) || !_.isString(key)) {
            return
        }
        value = !value ? value : getAbsPath(value, source);
        if (value && fs.existsSync(value)) {
            files.push(value);
        }
    });
    return files;
}

function getFiles(replaces, source, matched) {
    const files = {
        add: [],
        replace: [],
    }
    _.forEach(replaces, (value, key) => {
        if (!_.isString(value) || !_.isString(key)) {
            return
        }
        let source = !value ? undefined : getAbsPath(value, source);
        if (!source || !fs.existsSync(source)) {
            return
        }
        const _find = _.find(matched, (_match) => {
            return _match === key
        });
        if (_find) {
            files.replace.push({
                source,
                target: key
            });
        } else {
            files.add.push({
                source,
                target: key
            });
        }
    });
    return files;
}

function gulpCUD(files, source) {
    let stream = through.obj(function (file, enc, cb) {
        const _relative = file.relative;
        const find = _.find(files.replace, (_file) => {
            return _file.target === _relative
        });
        if (find) {
            const content = fs.readFileSync(find.source);
            file.contents = content
            file.__changed = true
        }
        this.push(file);
        cb();
    });
    log(`add files ${JSON.stringify(files.add)}`)
    log(`replace files ${JSON.stringify(files.replace)}`)
    _.each(files.add, (add) => {
        const content = fs.readFileSync(add.source);
        const vl = new Vinyl({
            cwd: source,
            base: source,
            path: `${path.resolve(source, add.target)}`,
            contents: content
        })
        vl.__new = true;
        stream.push(vl);
    });
    return stream;
}

function clean(exists, cleanFiles) {
    const existMap = _.keyBy(exists, function (exist) {
        return exist;
    });
    return _.filter(cleanFiles, (file) => {
        return !existMap[file]
    })
}

export {
    getAbsPath,
    runShell,
    tasks,
    findDependen,
    gulpCUD,
    getFiles,
    getExistsReplace,
    clean
};
