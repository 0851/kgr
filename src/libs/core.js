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

function gulpCUD(replaces, tmp, dest, conf) {
    const add = [];
    const remove = [];
    const repl = [];
    replaces = _.map(replaces, (file) => {
        file.source = !file.source ? file.source : getAbsPath(file.source, path.dirname(conf.__filename));
        file.target = !file.target ? file.target : getAbsPath(file.target, tmp);
        if (fs.existsSync(file.source) && !fs.existsSync(file.target)) {
            add.push(file);
        }
        if (!fs.existsSync(file.source) && fs.existsSync(file.target)) {
            remove.push(file);
        }
        if (fs.existsSync(file.source) && fs.existsSync(file.target)) {
            repl.push(file);
        }
        return file
    });

    let stream = through.obj(function (file, enc, cb) {
        const _path = file.path;
        const find = _.find(replaces, (_file) => {
            return _file.target === _path
        })
        let has = true;
        if (find.source) {
            file.contents = fs.readFile();
        } else {
            try {
                del.sync(path.resolve(dest, relative))
            } catch (e) {
                console.log(e)
            }
            has = false
        }
        if (file.relative) {

        }
        // 确保文件进入下一个 gulp 插件
        if (has) {

        }
        this.push(file);
        // 告诉 stream 引擎，我们已经处理完了这个文件
        cb();
    });

    return stream;
}

export {getAbsPath, runShell, tasks, findDependen, gulpCUD};
