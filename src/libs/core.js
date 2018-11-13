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

function getFiles(replaces, source, dest) {
    const files = {
        add: [],
        remove: [],
        replace: [],
    }
    _.each(replaces, (file) => {
        file.source = !file.source ? undefined : getAbsPath(file.source, source);
        file.target = !file.target ? undefined : getAbsPath(file.target, dest);
        if (fs.existsSync(file.source) && !fs.existsSync(file.target)) {
            files.add.push(file);
        }
        if (!fs.existsSync(file.source) && fs.existsSync(file.target)) {
            files.remove.push(file);
        }
        if (fs.existsSync(file.source) && fs.existsSync(file.target)) {
            files.replace.push(file);
        }
        return file
    });
    return files;
}

function gulpCUD(files, source, dest) {
    let stream = through.obj(function (file, enc, cb) {
        const _path = file.path;
        const rmfind = _.find(files.remove, (_file) => {
            return _file.target === _path
        })
        if (rmfind) {
            cb()
            return
        }
        const find = _.find(files.replace, (_file) => {
            return _file.target === _path
        });
        if (find) {
            const content = fs.readFileSync(find.source);
            file.contents = content
        }
        this.push(file);
        cb();
    });
    _.each(files.remove, (remove) => {
        const _path = path.resolve(dest, path.relative(source, remove.target));
        del.sync(_path);
    });
    _.each(files.add, (add) => {
        const content = fs.readFileSync(add.source);
        stream.push(new Vinyl({
            cwd: source,
            base: source,
            path: `${add.target}`,
            contents: content
        }));
    });
    return stream;
}

export {
    getAbsPath,
    runShell,
    tasks,
    findDependen,
    gulpCUD,
    getFiles
};
