import path from 'path';
import debug from 'debug';
import pkg from '../../package.json';
import _ from 'lodash';
import fs from 'fs';
import execa from 'execa';
import detect from 'detect-import-require';
import through from 'through2';
import globby from 'globby';
import del from 'del';
import Vinyl from 'vinyl';
import chalk from 'chalk';

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
    console.log(chalk.green(`run shell cmd : ${cmd}`));
    let child = execa(cmd, {
        ...{
            shell: true,
            maxBuffer: 1000000000,
            // stdio: [ 0, 1, 2 ],
            env: {
                ...{
                    FORCE_COLOR: true,
                    COLOR: 'always',
                    NPM_CONFIG_COLOR: 'always'
                },
                ...process.env,
                ...(options.env || {})
            }
        },
        ...options
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    return child
        .then((child) => {
            return child;
        })
        .catch((e) => {
            throw e;
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
        }
    } while (processes.length);
    return data;
}

function getExistsReplace(replaces, source) {
    const files = [];
    _.each(replaces, (value, key) => {
        if (!_.isString(value) || !_.isString(key)) {
            return;
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
        replace: []
    };
    _.forEach(replaces, (value, key) => {
        if (!_.isString(value) || !_.isString(key)) {
            return;
        }
        let source = !value ? undefined : getAbsPath(value, source);
        if (!source || !fs.existsSync(source)) {
            return;
        }
        const _find = _.find(matched, (_match) => {
            return _match === key;
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

function gulpAddReplace(files, source) {
    let stream = through.obj(function (file, enc, cb) {
        const _relative = file.relative;
        const find = _.find(files.replace, (_file) => {
            return _file.target === _relative;
        });
        if (find) {
            const content = fs.readFileSync(find.source);
            file.contents = content;
            file.is_replace = true;
        }
        this.push(file);
        cb();
    });
    log(`add files ${JSON.stringify(files.add)}`);
    log(`replace files ${JSON.stringify(files.replace)}`);
    _.each(files.add, (add) => {
        const content = fs.readFileSync(add.source);
        const vl = new Vinyl({
            cwd: source,
            base: source,
            path: `${path.resolve(source, add.target)}`,
            contents: content
        });
        vl.is_append = true;
        stream.push(vl);
    });
    return stream;
}

function gulpChangeByLine(options) {
    options = _.isObject(options) ? options : {};
    options = _.reduce(Object.keys(options), (res, option) => {
        const _path = option.split(':');
        const _file = _path[0];
        const _number = _path[1];
        const _range = _number.split('-');
        if (_range.length > 1) {
            if (!/^\d+$/.test(_range[0]) || !/^\d+$/.test(_range[1])) {
                return
            }
            let _start = parseInt(_range[0]);
            let _end = parseInt(_range[1]);
            for (let i = _start; i <= _end; i++) {
                if (i === parseInt(_range[0])) {
                    res[`${_file}:${i}`] = options[option];
                } else {
                    res[`${_file}:${i}`] = '';
                }
            }
        } else {
            res[option] = options[option]
        }

        return res;
    }, {});
    return through.obj(function (file, enc, cb) {
        if (!file.isBuffer()) {
            this.push(file);
            cb();
            return

        }
        const relative = file.relative;
        let contents = file.contents.toString('utf8')
            .replace(/\r\n/, '\n')
            .replace(/\r/, '\n')
            .split(/\n/);

        contents = contents.map((text, number) => {
            const method = options[`${relative}:${number + 1}`];
            if (_.isFunction(method)) {
                console.log(chalk.underline.green(`content     changedByLine   ::   ${file.relative}`));
                return method(number, text)
            } else if (_.isString(method)) {
                console.log(chalk.underline.green(`content     changedByLine   ::   ${file.relative}`));
                return method;
            } else {
                return text
            }
        });

        file.contents = new Buffer(contents.join('\n'));

        this.push(file);
        cb();
    });
}


function diffSourceAndDist(exists, cleanFiles) {
    const existMap = _.keyBy(exists, function (exist) {
        return exist;
    });
    return _.filter(cleanFiles, (file) => {
        return !existMap[file];
    });
}

function generateShells(bash, config, root) {
    if (!_.isArray(bash)) {
        bash = [bash];
    }
    const shells = _.reduce(
        bash,
        (res, b) => {
            if (_.isString(b)) {
                const conf = {...config};
                conf.cwd = path.resolve(root, conf.cwd || '');
                res.push(runShell(b, conf));
            }
            if (_.isArray(b)) {
                const st = b[0];
                const conf = {...config, ...b[1]};
                conf.cwd = path.resolve(root, conf.cwd || '');
                res.push(runShell(st, conf));
            }
            return res;
        },
        []
    );
    return shells;
}

export {
    getAbsPath,
    runShell,
    tasks,
    findDependen,
    generateShells,
    gulpAddReplace,
    getFiles,
    getExistsReplace,
    diffSourceAndDist,
    gulpChangeByLine
};
