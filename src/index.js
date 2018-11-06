import debug from 'debug';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import gulp from 'gulp';
import gulpSequence from 'gulp-sequence';
import gulpCached from 'gulp-cached';
import {readConfig} from './libs/parse-config';
import {getAbsPath, tasks, runShell} from './libs/core';
import pkg from '../package.json'

const log = debug(pkg.name);
const git_source = path.resolve(__dirname, '../.__source');

class Kgr {
    constructor(args) {
        this.setArgs(args);
        log('---start---');
        this.setConfig();
    }

    setArgs(args) {
        this.args = args;
    }

    getArgs() {
        return this.args
    }

    getOutput() {
        let output = this.getArgs().output;
        output = getAbsPath(output || 'dist');
        log('output ---> ' + output);
        return output;
    }

    setConfig() {
        const config = readConfig(this.getArgs().config)
        this.config = config;
    }

    getConfig() {
        return this.config;
    }

    configForName(name) {
        const config = this.getConfig();
        const matched = _.find(config, function (conf) {
            return conf.name === name;
        });
        if (!matched) {
            throw new Error(name + ' not fount matched ' + JSON.stringify(config) + ' , please check config file');
        }
        return matched;
    }

    async init(conf) {
        const args = this.getArgs();
        const [sdtout, sdterr] = await runShell('git version');
        if (!/version/.test(sdtout)) {
            throw new Error('please install git on your pc');
        }
        const url = conf.remote;
        const version = conf.tag || conf.branch;
        const clonePath = path.resolve(git_source, '.source', conf.name, version);
        const tmpPath = path.resolve(git_source, '.tmp', conf.name, version);
        let tarName = `${conf.name}-${version}.tar.gz`;
        const _init = async () => {
            await runShell(`rm -rf ${clonePath} && git clone -b ${version} ${url} ${clonePath} && cd ${clonePath} && rm -rf .git && echo 'success' > .kge_success`);
            await runShell(conf.bash, {cwd: clonePath});
            await runShell(`cd ${clonePath} && tar -zcf ${tarName} ./`)
        };
        if (args.init) {
            await _init();
        }
        if (!fs.existsSync(path.resolve(clonePath, '.kge_success'))) {
            await _init();
        }

        const _copy = async () => {
            await runShell(`mkdir -p ${tmpPath} && cd ${tmpPath} && tar -zxf ${path.resolve(clonePath, tarName)}`)
        };
        if (args.copy) {
            await _copy()
        }
        if (!fs.existsSync(path.resolve(tmpPath, '.kge_success'))) {
            await _copy()
        }
        return conf
    }

    async gulp(conf) {
        let remove_path = [];
        let replace_path = [];
        let add_path = [];
        let version = conf.tag || conf.branch;
        let tmpPath = path.resolve(git_source, '.tmp', conf.name, version);
        let destPath = path.resolve(git_source, '.dest', conf.name, version);
        conf['__dest'] = destPath;
        _.each(conf.replace, (file) => {
            file.source = !file.source ? file.source : getAbsPath(file.source, path.dirname(conf.__filename));
            file.target = !file.target ? file.target : getAbsPath(file.target, tmpPath);

            if (!fs.existsSync(file.source) && fs.existsSync(file.target)) {
                remove_path.push(file);
            }
            if (fs.existsSync(file.source) && fs.existsSync(file.target)) {
                replace_path.push(file);
            }
            if (fs.existsSync(file.source) && !fs.existsSync(file.target)) {
                add_path.push(file);
            }
        })
        gulp.task('add', async () => {
            console.log(`${chalk.green(`run add task...`)}`)
            const cmd = _.map(add_path, (file) => {
                return `cp -rf ${file.source} ${file.target}`
            }).join('&&')
            return await runShell(cmd)
        })
        gulp.task('remove', async () => {
            console.log(`${chalk.green(`run remove task...`)}`)
            const cmd = _.map(add_path, (file) => {
                return `rm -rf ${file.target}`
            }).join('&&')
            return await runShell(cmd)
        })
        gulp.task('replace', async () => {
            console.log(`${chalk.green(`run replace task...`)}`)
            const cmd = _.map(add_path, (file) => {
                return `cp -rf ${file.source} ${file.target}`
            }).join('&&')
            return await runShell(cmd)
        })
        gulp.task('pipe', (done) => {
            console.log(`${chalk.green(`run pipe task...`)}`);
            const stream = gulp.src([tmpPath + '/**/*'])
                .pipe(gulpCached(`${conf.name}:${version}`))
                .pipe(gulp.dest(`${destPath}`))
            stream.on('end', () => {
                done()
            })
            stream.on('error', function (err) {
                done(err);
            });
        })
        return [gulp.task('run', (done) => {
            return gulpSequence(['add', 'remove', 'replace'], 'pipe', done)
        }), conf]
    }

    async devServer(task, conf) {
        if (!conf.__dest) return
        gulpSequence('run')(async () => {
            await runShell(conf.start, {cwd: conf.__dest});
            console.log(`${chalk.green.underline(`success : ${conf.__dest}`)}`);
        })
        const files = [conf.__filename]
        _.each(conf.replace, (file) => {
            file.source = !file.source ? file.source : getAbsPath(file.source, path.dirname(conf.__filename));
            if (fs.existsSync(file.source)) {
                files.push(file.source)
            }
        });
        gulp.watch(files, (event) => {
            console.log(`${chalk.yellow(`File ${event.path} was ${event.type} , running tasks...`)}`);
            gulpSequence('run')(async () => {
                await runShell(conf.restart, {cwd: conf.__dest});
                if (conf.restart) console.log(`${chalk.green.underline(`restart : ${conf.__dest}`)}`);
            })
        })
    }

    async dev(name) {
        await tasks([
            async () => {
                return await this.configForName(name)
            },
            async (conf) => {
                return await this.init(conf)
            },
            async (conf) => {
                return await this.gulp(conf)
            },
            async ([task, conf]) => {
                return await this.devServer(task, conf)
            }
        ])
    }

    async build(name) {
        await tasks([
            async () => {
                return await this.configForName(name)
            },
            async (conf) => {
                return await this.init(conf)
            },
            async (conf) => {
                return await this.gulp(conf)
            },
            async ([task, conf]) => {
                return gulpSequence('run')(() => {
                    console.log(`${chalk.green.underline(`success : ${conf.__dest}`)}`);
                })
            }
        ])
    }

    async run() {
        let args = this.getArgs();
        let name = args.name || this.getConfig()[0].name;
        let mode = args.mode || 'dev';
        if (!name) {
            throw new Error('请设置一个启动项目的名称');
        }
        if (mode === 'dev') {
            await this.dev(name);
        }
        if (mode === 'build') {
            await this.build(name);
        }
    }
}

export default Kgr