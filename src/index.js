import debug from 'debug';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import globby from 'globby';
import gulp from 'gulp';
import gulpReplace from 'gulp-replace';
import gulpCached from 'gulp-cached';
import through from 'through2';
import crypto from 'crypto';
import {readConfig} from './libs/parse-config';
import {getAbsPath, tasks, runShell, findDependen, gulpCUD, getFiles, getExistsReplace, clean} from './libs/core';
import pkg from '../package.json';
import Vinyl from 'vinyl';
import del from 'del';

import pify from 'pify';

const log = debug(pkg.name);

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
        return this.args;
    }

    setConfig() {
        const config = readConfig(this.getArgs().config);
        this.config = config;
        return config;
    }

    configForName(name) {
        const config = this.setConfig();
        const matched = _.find(config, function (conf) {
            return conf.name === name;
        });
        if (!matched) {
            throw new Error(name + ' not fount matched ' + JSON.stringify(config) + ' , please check config file');
        }
        return matched;
    }

    sourcePath(conf) {
        const version = conf.version;
        let source = this.getArgs().source || '.source';
        source = getAbsPath(source);
        source = path.resolve(source, conf.name, version);
        return source;
    }


    destPath(conf) {
        let version = conf.version;
        let output = this.getArgs().output || 'dest';
        output = getAbsPath(output);
        output = path.resolve(output, conf.name, version);
        return output;
    }

    async init(name) {
        const conf = await this.configForName(name);
        const args = this.getArgs();
        const [sdtout, sdterr] = await runShell('git version');
        if (!/version/.test(sdtout)) {
            throw new Error('please install git on your pc');
        }
        const url = conf.remote;
        const version = conf.version;
        const source = this.sourcePath(conf);
        const dest = this.destPath(conf);
        let tarName = `${conf.name}-${version}.tar.gz`;
        let successFile = `.kge_success`;
        const _init = async () => {
            try {
                await runShell(
                    `rm -rf ${source} && git clone -b ${version} ${url} ${source} && cd ${source} && rm -rf .git && echo 'success' > ${successFile}`
                );
                await runShell(conf.bash, {cwd: source});
                await runShell(`cd ${source} && b=${tarName}; tar --exclude=$b -zcf $b .`);
            } catch (e) {
                console.log(e);
                throw e
            }
        };
        if (args.init) {
            await _init();
        }
        if (!fs.existsSync(path.resolve(source, successFile))) {
            await _init();
        }

        const _copyDest = async () => {
            log('cp start')
            try {
                await runShell(`rm -rf  ${dest} && mkdir -p ${dest} && cd ${dest} && tar -zxf ${path.resolve(source, tarName)}`);
            } catch (e) {
                throw e
            }
            log('cp end')
            // return new Promise((resolve, reject) => {
            //     // mkdirp.sync(dest);
            //     // log('cp start ')
            //     // ncp(source, dest, function (err) {
            //     //     if (err) {
            //     //         console.error(err)
            //     //         reject(err)
            //     //         return;
            //     //     }
            //     //     log('cp end')
            //     //     resolve()
            //     // });
            //     const opt = {base: source, cwd: source};
            //     log(`copy init`)
            //     gulp
            //         .src(globby.sync(`${source}/**/*`, opt), opt)
            //         .pipe(gulp.dest(`${dest}`))
            //         .on('end', () => {
            //             resolve();
            //             log(`copy end`)
            //         })
            //         .on('error', (e) => {
            //             log(`copy error`)
            //             reject(e)
            //         })
            // })
        };
        if (args.copy) {
            await _copyDest();
        }
        if (!fs.existsSync(path.resolve(dest, successFile))) {
            await _copyDest();
        }
        return conf;
    }

    async gulp(name) {
        return new Promise(async (resolve, reject) => {
            try {
                const self = this;
                const conf = await this.configForName(name);
                console.log(`${chalk.green(`run pipe task...`)}`);
                let tmp = this.sourcePath(conf);
                let dest = this.destPath(conf);
                const opt = {base: tmp, cwd: tmp}
                let glob = [
                    `./**/{*,.*}`,
                    '!./{bower_components,node_modules,dist,build}{,/**/{*,.*}}',
                    `!./**/{*,.*}.{tar.gz,swf,mp4,webm,ogg,mp3,wav,flac,aac,png,jpg,gif,svg,eot,woff,woff2,ttf,otf,swf}`
                ];

                if (conf.glob) {
                    conf.glob = _.isArray(conf.glob) ? conf.glob : [conf.glob];
                    glob = glob.concat(conf.glob);
                }

                let removeGlob = []
                if (conf.remove) {
                    //过滤掉源 , 避免再次push到dest中
                    removeGlob = globby.sync(conf.remove, opt).map((file) => {
                        console.log(chalk.underline.yellow(`file        removed   ::   ${file}`))
                        //删除时清除缓存 , 以便下次重建
                        delete self.cache[file]
                        return `!${file}`
                    });
                }

                log(`gulp matched start`);
                log(`${glob.join('\n')}`);
                log(`gulp removeGlob start`);
                log(`${removeGlob.join('\n')}`);
                let matched = globby.sync(glob.concat(removeGlob), opt);
                log(`gulp matched end ${JSON.stringify(matched)}`);

                //得到需要追加或替换的文件
                const files = getFiles(conf.replace, path.dirname(conf.__filename), matched);

                let sourceFiles = []
                let stream = gulp
                    .src(matched, opt)
                // .pipe(through.obj(function (file, encoding, cb) {
                //     let contents = file.checksum;
                //     if (!contents && file.isBuffer()) {
                //         contents = file.contents.toString('utf8');
                //     }
                //     file.__old = contents;
                //     this.push(file);
                //     cb();
                // }))
                log(`gulp file replace start`);
                //对流进行预先处理 , 追加文件,替换文件,删除文件,等
                stream = stream.pipe(gulpCUD(files, tmp))
                log(`gulp file replace end`);


                let pipes = conf.pipe;
                if (!_.isArray(pipes)) {
                    pipes = [pipes];
                }

                log(`gulp content replace start`);
                stream = _.reduce(
                    pipes,
                    (stream, pipe) => {
                        if (!_.isArray(pipe)) {
                            return stream;
                        }
                        const reg = pipe[0];
                        const replacement = pipe[1];
                        const options = pipe[2];
                        if (
                            (_.isString(reg) || _.isRegExp(reg)) &&
                            (_.isFunction(replacement) || _.isString(replacement))
                        ) {
                            stream = stream.pipe(gulpReplace(reg, replacement, options));
                        }
                        return stream;
                    },
                    stream
                );
                log(`gulp content replace end`);
                log(`gulp record start`);
                stream = stream.pipe((() => {
                    return through.obj(function (file, encoding, cb) {
                        sourceFiles.push(file.relative)
                        let contents = file.checksum;
                        if (!contents && file.isBuffer()) {
                            contents = file.contents.toString('utf8');
                        }
                        if (file.__new === true) {
                            console.log(chalk.underline.green(`file          newed   ::   ${file.relative}`))
                        }
                        if (file.__changed === true) {
                            console.log(chalk.underline.green(`file        changed   ::   ${file.relative}`))
                        }
                        if (!self.cache.hasOwnProperty(file.relative)) {
                            console.log(chalk.underline.green(`content         init  ::   ${file.relative}`))
                            this.push(file);
                            self.cache[file.relative] = contents;
                        }
                        if (self.cache[file.relative] !== contents) {
                            console.log(chalk.underline.green(`content     changed   ::   ${file.relative}`))
                            this.push(file);
                            self.cache[file.relative] = contents;
                        }
                        cb();
                    })
                })());
                log(`gulp record end`);
                stream
                    .pipe(gulp.dest(`${dest}`))
                    .on('end', function () {
                        log(`clean start`)
                        //清理已删除或不应存在在dest目录中的文件
                        const cleanFiles = globby.sync(glob, {base: dest, cwd: dest});
                        log(`sourceFiles ${JSON.stringify(sourceFiles)}`);
                        log(`cleanFiles ${JSON.stringify(cleanFiles)}`);
                        //删除时清除缓存 , 以便下次重建
                        const matchedClean = clean(sourceFiles, cleanFiles);
                        _.each(matchedClean, (file) => {
                            const _file = path.resolve(dest, file);
                            console.log(chalk.underline.yellow(`file          clean   ::   ${file}`))
                            del.sync(_file);
                            delete self.cache[file];
                        });
                        log(`clean end`);
                        log('end pipe...');
                        console.log(`${chalk.green(`end pipe task...`)}`);
                        resolve(conf);
                    })
                    .on('error', function (err) {
                        log(`error pipe... ${err}`);
                        reject(err);
                    });
            } catch (e) {
                reject(e);
            }
        })
    }

    async devServer(name) {
        let bash = null;
        const watch = async () => {
            const conf = await this.configForName(name);
            let files = await findDependen(conf.__filename);
            files = files.concat(getExistsReplace(conf.replace, path.dirname(conf.__filename)));
            log(`watch start ... , ${files}`)
            gulp.watch(files, async (event) => {
                console.log(`${chalk.yellow(`File ${event.path} was ${event.type} , running tasks...`)}`);
                try {
                    await this.gulp(name);
                    const conf = await this.configForName(name);
                    let dest = this.destPath(conf);
                    if (!fs.existsSync(dest)) {
                        throw new Error(`can fount dest path ${dest}`);
                    }
                    if (conf.restart) {
                        try {
                            bash && bash.kill && bash.kill();
                            const shell = await runShell(conf.restart, {cwd: dest});
                            bash = shell[2]
                        } catch (e) {
                            console.error(e)
                        }
                        console.log(`${chalk.green.underline(`restart : ${dest}`)}`);
                    }
                } catch (e) {
                    throw e;
                }
            });
        }
        try {
            this.cache = {};
            await this.gulp(name);
            const conf = await this.configForName(name);
            let dest = this.destPath(conf);
            if (!fs.existsSync(dest)) {
                throw new Error(`can fount dest path ${dest}`);
            }
            await watch();
            if (conf.start) {
                try {
                    let shell = await runShell(conf.start, {cwd: dest});
                    bash = shell[2]
                } catch (e) {
                    console.error(e)
                }
            }
            console.log(`${chalk.green.underline(`success : ${dest}`)}`);
        } catch (e) {
            throw e
        }
    }

    async dev(name) {
        await tasks([
            async () => {
                return await this.init(name);
            },
            async () => {
                return await this.devServer(name);
            }
        ]);
    }

    async build(name) {
        await tasks([
            async () => {
                return await this.init(name);
            },
            async () => {
                this.cache = {};
                await this.gulp(name);
                const args = this.getArgs();
                const conf = await this.configForName(name);
                let dest = this.destPath(conf);
                if (!fs.existsSync(dest)) return;
                if (conf.build) {
                    try {
                        await runShell(conf.build, {cwd: dest});
                    } catch (e) {
                        console.error(e)
                    }
                }
                // if (fs.existsSync(args.output)) {
                //     await runShell(
                //         `cd ${args.output} && tar -zcf ${conf.name}.${conf.version}.tar.gz -C ${dest} .`
                //     );
                // } else {
                //     console.log(`${chalk.yellow(`warning : args.output 不存在`)}`);
                // }
                // console.log(`${chalk.green.underline(`success : ${dest}`)}`);
            }
        ]);
    }

    async run() {
        let args = this.getArgs();
        let name = args.name || this.setConfig()[0].name;
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

export default Kgr;
