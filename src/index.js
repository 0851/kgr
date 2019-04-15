import debug from 'debug';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import chalk from 'chalk';
import globby from 'globby';
import gulp from 'gulp';
import gulpReplace from 'gulp-replace';
import {readConfig} from './libs/parse-config';
import {
    getAbsPath,
    tasks,
    runShell,
    findDependen,
    gulpAddReplace,
    getFiles,
    getExistsReplace,
    diffSourceAndDist,
    gulpChangeByLine,
    generateShells
} from './libs/core';
import pkg from '../package.json';
import del from 'del';
import through from "through2";


const log = debug(pkg.name);

class Kgr {
    constructor(args) {
        this.setArgs(args);
        log('---start---');
        this.setConfig();
        this.cache = {};
    }

    setArgs(args) {
        args.source = args.source || '.source';
        args.output = args.output || 'output';
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

    sourcePath() {
        let source = this.getArgs().source;
        source = getAbsPath(source);
        source = path.resolve(source);
        return source;
    }

    outputPath() {
        let output = this.getArgs().output;
        output = getAbsPath(output);
        output = path.resolve(output);
        return output;
    }

    async init(name) {
        const conf = this.configForName(name);
        const args = this.getArgs();
        const url = conf.remote;
        const version = conf.version;
        let source = args.source;
        let output = args.output;
        const sourcePath = this.sourcePath(conf);
        const outputPath = this.outputPath(conf);
        let successFile = `.kgr_success`;
        let versionFile = `.kgr_version_${conf.version}`;
        let tarName = `${conf.name}-${version}.tar.gz`;

        const tar = async () => {
            await runShell(
                `cd ${version} && tar --exclude .git --exclude ${successFile} -zcf ../${tarName} . && echo 'success' > ${successFile}`,
                {
                    cwd: sourcePath
                }
            );
        };

        const _init = async () => {
            const {stdout, stderr} = await runShell('git version');
            if (!/version/.test(stdout)) {
                throw new Error('please install git on your pc');
            }
            await runShell(
                `rm -rf ${version} && git clone --depth=1 -b ${version} ${url} ${version} && cd ${version}`,
                {
                    cwd: sourcePath
                }
            );
            await Promise.all(generateShells(conf.bash, null, path.resolve(sourcePath, version)));
            await tar();
        };

        if (args.init) {
            await _init();
        }
        if (args.repull) {
            await runShell(
                `git pull`, {
                    cwd: path.resolve(sourcePath, version)
                }
            );
            await tar();
        }
        if (args.retar) {
            await tar();
        }
        if (!fs.existsSync(path.resolve(sourcePath, successFile))) {
            await _init();
        }

        const _copyOutput = async () => {
            log('cp start');
            await runShell(
                `rm -rf ${output} && mkdir -p ${output} && cd ${output} && tar -zxf ${path.relative(outputPath, path.resolve(sourcePath, tarName))} && echo '${version}' > ${versionFile}`
            );
            log('cp end');
        };
        if (args.copy) {
            await _copyOutput();
        }
        if (!fs.existsSync(path.resolve(outputPath, `${versionFile}`))) {
            await _copyOutput();
        }
        return conf;
    }

    gulp(name) {
        return new Promise((resolve, reject) => {
            try {
                const self = this;
                const conf = this.configForName(name);
                console.log(`${chalk.green(`run pipe task...`)}`);
                let tmp = path.resolve(this.sourcePath(conf), conf.version);
                let output = this.outputPath(conf);
                const opt = {base: tmp, cwd: tmp};
                let glob = [
                    `**/{*,.*}`,
                    '!**/package.json',
                    '!**/package-lock.json',
                    '!**/yarn.lock',
                    '!**/{bower_components,node_modules,dist,build}/**',
                    '!**/{*,.*}.{tar.gz,swf,mp4,webm,ogg,mp3,wav,flac,aac,png,jpg,gif,svg,eot,woff,woff2,ttf,otf,swf}'
                ];

                if (conf.glob) {
                    conf.glob = _.isArray(conf.glob) ? conf.glob : [conf.glob];
                    glob = glob.concat(conf.glob);
                }

                let removeGlob = [];
                if (conf.remove) {
                    //过滤掉源 , 避免再次push到output中
                    removeGlob = globby.sync(conf.remove, opt).map((file) => {
                        //删除时清除缓存 , 以便下次重建
                        delete self.cache[file];
                        console.log(chalk.underline.yellow(`file        removed   ::   ${file}`));
                        return `!${file}`;
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

                let sourceFiles = [];
                let stream = gulp.src(matched, opt);

                log(`gulp file replace start`);
                //对流进行预先处理 , 追加文件,替换文件,删除文件,等
                stream = stream.pipe(gulpAddReplace(files, tmp));
                stream = stream.pipe(gulpChangeByLine(conf['changeByLine']));
                log(`gulp file replace end`);

                let pipes = conf.pipe;
                if (!_.isArray(pipes)) {
                    pipes = []
                }

                log(`gulp content replace start${pipes}`);

                stream = _.reduce(
                    pipes,
                    (stream, pipe) => {
                        if (!_.isArray(pipe)) {
                            return stream
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
                stream = stream.pipe(through.obj(function (file, encoding, cb) {
                    sourceFiles.push(file.relative);
                    let contents = file.checksum;
                    if (file.isBuffer()) {
                        contents = file.contents.toString('utf8');
                    }

                    if (file.is_append === true) {
                        console.log(chalk.underline.green(`file          newed   ::   ${file.relative}`));
                    }
                    if (file.is_replace === true) {
                        console.log(chalk.underline.green(`file        changed   ::   ${file.relative}`));
                    }

                    if (!self.cache.hasOwnProperty(file.relative)) {
                        console.log(chalk.underline.green(`content        init   ::   ${file.relative}`));
                        this.push(file);
                        self.cache[file.relative] = contents;
                    }
                    if (self.cache[file.relative] !== contents) {
                        console.log(chalk.underline.green(`content     changed   ::   ${file.relative}`));
                        this.push(file);
                        self.cache[file.relative] = contents;
                    }
                    cb();
                }));

                log(`gulp record end`);
                let _end = () => {
                    log(`clean start`);
                    //清理已删除或不应存在在output目录中的文件
                    const distFiles = globby.sync(glob, {base: output, cwd: output});
                    log(`sourceFiles ${JSON.stringify(sourceFiles)}`);
                    log(`distFiles ${JSON.stringify(distFiles)}`);
                    let versionFile = `.kgr_version_${conf.version}`;
                    //删除时清除缓存 , 以便下次重建
                    const matched = diffSourceAndDist(sourceFiles, distFiles);
                    _.each(matched, (file) => {
                        if (file === versionFile) {
                            return;
                        }
                        const _file = path.resolve(output, file);
                        console.log(chalk.underline.yellow(`file          clean   ::   ${file}`));
                        del.sync(_file);
                        //删除时清除缓存 , 以便下次重建
                        delete self.cache[file];
                    });
                    log(`clean end`);
                    log('end pipe...');
                    console.log(`${chalk.green(`end pipe task...`)}`);
                    resolve(conf);
                };
                let _error = (err) => {
                    log(`error pipe... ${err}`);
                    reject(err);
                };
                stream
                    .pipe(gulp.dest(`${output}`))
                    .on('end', _end)
                    .on('error', _error);
            } catch (e) {
                reject(e);
            }
        });
    }

    async runGulp(command, name) {
        try {
            await this.gulp(name);
            const conf = this.configForName(name);
            let output = this.outputPath(conf);
            if (!fs.existsSync(output)) {
                throw new Error(`cann't fount output path ${output}`);
            }
            const cmd = conf[command];
            if (cmd) {
                if (this.bash) {
                    _.each(this.bash, (shell) => {
                        shell && shell.kill && shell.kill();
                    });
                }
                this.bash = generateShells(cmd, null, output);
                console.log(`${chalk.green.underline(`success run : ${cmd} ${output}`)}`);
                await Promise.all(this.bash);
            }
            console.log(`${chalk.green.underline(`success run : ${cmd} ${output}`)}`);
        } catch (e) {
            throw e;
        }
    }

    async devServer(name) {
        const watch = async () => {
            try {
                const conf = this.configForName(name);
                let files = await findDependen(conf.__filename);
                files = files.concat(getExistsReplace(conf.replace, path.dirname(conf.__filename)));
                log(`watch start ... , ${files}`);
                gulp.watch(files, async (event) => {
                    try {
                        console.log(`${chalk.yellow(`File ${event.path} was ${event.type} , running tasks...`)}`);
                        await this.runGulp('restart', name);
                    } catch (e) {
                        console.error(e);
                    }
                });
            } catch (e) {
                console.error(e);
            }
        };
        await this.runGulp('start', name);
        await watch();
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
                await this.runGulp('build', name);
            }
        ]);
    }

    async run() {
        try {
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
        } catch (e) {
            console.error(e);
        }
    }
}

export default Kgr;
