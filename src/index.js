import debug from 'debug';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import globby from 'globby';
import gulp from 'gulp';
import gulpSequence from 'gulp-sequence';
import gulpReplace from 'gulp-replace';
import gulpCached from 'gulp-cached';
import crypto from 'crypto';
import gulpChanged from 'gulp-changed';
import { readConfig } from './libs/parse-config';
import { getAbsPath, tasks, runShell, findDependen } from './libs/core';
import pkg from '../package.json';
import pify from 'pify';

const log = debug(pkg.name);
const stat = pify(fs.stat);
const dir = {
	source: path.resolve(__dirname, '../.__source')
};

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
		const matched = _.find(config, function(conf) {
			return conf.name === name;
		});
		if (!matched) {
			throw new Error(name + ' not fount matched ' + JSON.stringify(config) + ' , please check config file');
		}
		return matched;
	}

	sourcePath(conf) {
		const version = conf.version;
		const source = path.resolve(dir.source, '.source', conf.name, version);
		return source;
	}

	tmpPath(conf) {
		const version = conf.version;
		const tmp = path.resolve(dir.source, '.tmp', conf.name, version);
		return tmp;
	}

	destPath(conf) {
		let version = conf.version;
		let dest = path.resolve(dir.source, '.dest', conf.name, version);
		return dest;
	}

	async init(name) {
		const conf = await this.configForName(name);
		const args = this.getArgs();
		const [ sdtout, sdterr ] = await runShell('git version');
		if (!/version/.test(sdtout)) {
			throw new Error('please install git on your pc');
		}
		const url = conf.remote;
		const version = conf.version;
		const source = this.sourcePath(conf);
		const tmp = this.tmpPath(conf);
		const dest = this.destPath(conf);
		let tarName = `${conf.name}-${version}.tar.gz`;
		let successFile = `.kge_success`;
		const _init = async () => {
			await runShell(
				`rm -rf ${source} && git clone -b ${version} ${url} ${source} && cd ${source} && rm -rf .git && echo 'success' > ${successFile}`
			);
			await runShell(conf.bash, { cwd: source });
			await runShell(`cd ${source} && b=${tarName}; tar --exclude=$b -zcf $b .`);
		};
		if (args.init) {
			await _init();
		}
		if (!fs.existsSync(path.resolve(source, successFile))) {
			await _init();
		}

		const _copy = async () => {
			await runShell(`mkdir -p ${tmp} && cd ${tmp} && tar -zxf ${path.resolve(source, tarName)}`);
		};
		const _copyDest = async () => {
			await runShell(`mkdir -p ${dest} && cd ${dest} && tar -zxf ${path.resolve(source, tarName)}`);
		};
		if (args.copy) {
			await _copy();
			await _copyDest();
		}
		if (!fs.existsSync(path.resolve(tmp, successFile))) {
			await _copy();
		}
		if (!fs.existsSync(path.resolve(dest, successFile))) {
			await _copyDest();
		}
		return conf;
	}

	async gulp(name) {
		const conf = await this.configForName(name);
		let removePath = [];
		let replacePath = [];
		let addPath = [];
		let dest = this.destPath(conf);
		let tmp = this.tmpPath(conf);
		_.each(conf.replace, (file) => {
			file.source = !file.source ? file.source : getAbsPath(file.source, path.dirname(conf.__filename));
			file.target = !file.target ? file.target : getAbsPath(file.target, tmp);

			if (!fs.existsSync(file.source) && fs.existsSync(file.target)) {
				removePath.push(file);
			}
			if (fs.existsSync(file.source) && fs.existsSync(file.target)) {
				replacePath.push(file);
			}
			if (fs.existsSync(file.source) && !fs.existsSync(file.target)) {
				addPath.push(file);
			}
		});
		gulp.task('add', async () => {
			console.log(`${chalk.green(`run add ${JSON.stringify(addPath)} task...`)}`);
			const cmd = _.map(addPath, (file) => {
				return `cp -rf ${file.source} ${file.target}`;
			}).join('&&');
			return await runShell(cmd);
		});
		gulp.task('remove', async () => {
			console.log(`${chalk.green(`run remove ${JSON.stringify(removePath)} task...`)}`);
			const cmd = _.map(removePath, (file) => {
				return `rm -rf ${file.target}`;
			}).join('&&');
			return await runShell(cmd);
		});
		gulp.task('replace', async () => {
			console.log(`${chalk.green(`run replace ${JSON.stringify(replacePath)} task...`)}`);
			const cmd = _.map(replacePath, (file) => {
				return `cp -rf ${file.source} ${file.target}`;
			}).join('&&');
			return await runShell(cmd);
		});
		gulp.task('pipe', (done) => {
			console.log(`${chalk.green(`run pipe task...`)}`);
			let glob = [
				`./**/*`,
				'!./{bower_components,node_modules,dist,build}{,/**}',
				`!./**/*.{tar.gz,swf,mp4,webm,ogg,mp3,wav,flac,aac,png,jpg,gif,svg,eot,woff,woff2,ttf,otf,swf}`
			];

			if (conf.glob) {
				conf.glob = _.isArray(conf.glob) ? conf.glob : [ conf.glob ];
				glob = glob.concat(conf.glob);
			}

			log(`find glob ---> start`);

			glob = globby.sync(glob, { base: tmp, cwd: tmp, nodir: true });

			log(`find glob ---> end`);
			log(`${glob.join('\\n')}`);

			log(`gulp src start`);
			let stream = gulp.src(glob, { base: tmp, cwd: tmp, nodir: true });
			log(`gulp src end`);
			let pipes = conf.pipe;
			if (!_.isArray(pipes)) {
				pipes = [ pipes ];
			}

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

			stream
				.pipe(gulpCached(`${conf.name}:${conf.version}`))
				// .pipe(gulpChanged(`${dest}`, {
				//     hasChanged: function (stream, sourceFile, targetPath) {
				//         // console.log(stream, sourceFile, targetPath)
				//         return stat(targetPath).then((targetStat) => {
				//             console.log(sourceFile.relative)
				//             // console.log(stream)
				//         })
				//     }
				// }))
				.pipe(gulp.dest(`${dest}`))
				.on('end', () => {
					log('end  pipe...');
					done();
				})
				.on('error', function(err) {
					log(`error  pipe... ${err}`);
					done(err);
				});
		});
		return gulp.task('run', (done) => {
			return gulpSequence([ 'add', 'remove', 'replace' ], 'pipe', done);
		});
	}

	async devServer(task, name) {
		const conf = await this.configForName(name);
		gulpSequence('run')(async () => {
			const conf = await this.configForName(name);
			let dest = this.destPath(conf);
			if (!fs.existsSync(dest)) {
				throw new Error(`can fount dest path ${dest}`);
			}
			await runShell(conf.start, { cwd: dest });
			console.log(`${chalk.green.underline(`success : ${dest}`)}`);
		});
		const files = await findDependen(conf.__filename);
		_.each(conf.replace, (file) => {
			file.source = !file.source ? file.source : getAbsPath(file.source, path.dirname(conf.__filename));
			if (fs.existsSync(file.source)) {
				files.push(file.source);
			}
		});
		gulp.watch(files, async (event) => {
			console.log(`${chalk.yellow(`File ${event.path} was ${event.type} , running tasks...`)}`);
			await this.gulp(name);
			gulpSequence('run')(async () => {
				const conf = await this.configForName(name);
				let dest = this.destPath(conf);
				if (!fs.existsSync(dest)) {
					throw new Error(`can fount dest path ${dest}`);
				}
				await runShell(conf.restart, { cwd: dest });
				if (conf.restart) console.log(`${chalk.green.underline(`restart : ${dest}`)}`);
			});
		});
	}

	async dev(name) {
		await tasks([
			async () => {
				return await this.init(name);
			},
			async () => {
				return await this.gulp(name);
			},
			async (task) => {
				return await this.devServer(task, name);
			}
		]);
	}

	async build(name) {
		await tasks([
			async () => {
				return await this.init(name);
			},
			async () => {
				return await this.gulp(name);
			},
			async (task) => {
				const args = this.getArgs();
				const conf = await this.configForName(name);
				return gulpSequence('run')(async () => {
					let dest = this.destPath(conf);
					if (!fs.existsSync(dest)) return;
					if (fs.existsSync(args.output)) {
						await runShell(
							`cd ${args.output} && tar -zcf ${conf.name}.${conf.version}.tar.gz -C ${dest} .`
						);
					} else {
						console.log(`${chalk.yellow(`warning : args.output 不存在`)}`);
					}
					console.log(`${chalk.green.underline(`success : ${dest}`)}`);
				});
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
