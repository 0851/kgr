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
import { readConfig } from './libs/parse-config';
import { getAbsPath, tasks, runShell, findDependen, gulpCUD, getFiles, getExistsReplace, clean } from './libs/core';
import pkg from '../package.json';
import Vinyl from 'vinyl';
import del from 'del';

import pify from 'pify';

const log = debug(pkg.name);

function generateShells(bash, config, root) {
	if (!_.isArray(bash)) {
		bash = bash;
	}
	const shells = _.reduce(
		bash,
		(res, b) => {
			if (_.isString(b)) {
				const conf = { ...config };
				conf.cwd = path.resolve(root, conf.cwd || '');
				res.push(runShell(b, conf));
			}
			if (_.isArray(b)) {
				const st = b[0];
				const conf = { ...config, ...b[1] };
				conf.cwd = path.resolve(root, conf.cwd || '');
				res.push(runShell(st, conf));
			}
			return res;
		},
		[]
	);
	return shells;
}

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
		let source = this.getArgs().source || '.source';
		source = getAbsPath(source);
		source = path.resolve(source, conf.name, version);
		return source;
	}

	destPath(conf) {
		let version = conf.version;
		let dest = this.getArgs().dest || 'dest';
		dest = getAbsPath(dest);
		dest = path.resolve(dest);
		return dest;
	}

	outputPath(conf) {
		let version = conf.version;
		let output = this.getArgs().output || 'output';
		output = getAbsPath(output);
		output = path.resolve(output, conf.name, version);
		return output;
	}

	async init(name) {
		const conf = this.configForName(name);
		const args = this.getArgs();
		const url = conf.remote;
		const version = conf.version;
		const source = this.sourcePath(conf);
		const output = this.outputPath(conf);
		let successFile = `.kgr_success`;
		let versionFile = `.kgr_version_${conf.name}_${conf.version}`;
		let tarName = `${conf.name}-${version}.tar.gz`;

		const _init = async () => {
			const { stdout, stderr } = await runShell('git version');
			if (!/version/.test(stdout)) {
				throw new Error('please install git on your pc');
			}
			await runShell(
				`rm -rf ${source} && git clone --depth=1 -b ${version} ${url} ${source} && cd ${source} && rm -rf .git`
			);
			await Promise.all(generateShells(conf.bash, null, source));
			await runShell(
				`cd ${source} && b=${tarName}; tar --exclude=$b -zcf $b . && echo 'success' > ${successFile}`
			);
		};
		if (args.init) {
			await _init();
		}
		if (!fs.existsSync(path.resolve(source, successFile))) {
			await _init();
		}

		const _copyOutput = async () => {
			log('cp start');
			await runShell(
				`rm -rf ${output} && mkdir -p ${output} && cd ${output} && tar -zxf ${path.resolve(
					source,
					tarName
				)} && echo '${conf.name}:${version}' > ${versionFile}`
			);
			log('cp end');
		};
		if (args.copy) {
			await _copyOutput();
		}
		if (!fs.existsSync(path.resolve(output, `${versionFile}`))) {
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
				let tmp = this.sourcePath(conf);
				let output = this.outputPath(conf);
				const opt = { base: tmp, cwd: tmp };
				let glob = [
					`**/{*,.*}`,
					'!**/package.json',
					'!**/package-lock.json',
					'!**/yarn.lock',
					'!**/{bower_components,node_modules,dist,build}/**',
					'!**/{*,.*}.{tar.gz,swf,mp4,webm,ogg,mp3,wav,flac,aac,png,jpg,gif,svg,eot,woff,woff2,ttf,otf,swf}'
				];

				if (conf.glob) {
					conf.glob = _.isArray(conf.glob) ? conf.glob : [ conf.glob ];
					glob = glob.concat(conf.glob);
				}

				let removeGlob = [];
				if (conf.remove) {
					//过滤掉源 , 避免再次push到output中
					removeGlob = globby.sync(conf.remove, opt).map((file) => {
						console.log(chalk.underline.yellow(`file        removed   ::   ${file}`));
						//删除时清除缓存 , 以便下次重建
						delete self.cache[file];
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
				stream = stream.pipe(gulpCUD(files, tmp));
				log(`gulp file replace end`);

				let pipes = conf.pipe;
				if (!_.isArray(pipes)) {
					pipes = [ pipes ];
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
				stream = stream.pipe(
					through.obj(function(file, encoding, cb) {
						sourceFiles.push(file.relative);
						let contents = file.checksum;
						if (!contents && file.isBuffer()) {
							contents = file.contents.toString('utf8');
						}
						if (file.__new === true) {
							console.log(chalk.underline.green(`file          newed   ::   ${file.relative}`));
						}
						if (file.__changed === true) {
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
					})
				);
				log(`gulp record end`);
				let _end = () => {
					log(`clean start`);
					//清理已删除或不应存在在output目录中的文件
					const cleanFiles = globby.sync(glob, { base: output, cwd: output });
					log(`sourceFiles ${JSON.stringify(sourceFiles)}`);
					log(`cleanFiles ${JSON.stringify(cleanFiles)}`);
					let versionFile = `.kgr_version_${conf.name}_${conf.version}`;
					//删除时清除缓存 , 以便下次重建
					const matchedClean = clean(sourceFiles, cleanFiles);
					_.each(matchedClean, (file) => {
						if (file === versionFile) {
							return;
						}
						const _file = path.resolve(output, file);
						console.log(chalk.underline.yellow(`file          clean   ::   ${file}`));
						del.sync(_file);
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
				stream.pipe(gulp.dest(`${output}`)).on('end', _end).on('error', _error);
			} catch (e) {
				reject(e);
			}
		});
	}

	async devServer(name) {
		let bash = null;
		const watch = async () => {
			try {
				const conf = this.configForName(name);
				let files = await findDependen(conf.__filename);
				files = files.concat(getExistsReplace(conf.replace, path.dirname(conf.__filename)));
				log(`watch start ... , ${files}`);
				gulp.watch(files, async (event) => {
					try {
						console.log(`${chalk.yellow(`File ${event.path} was ${event.type} , running tasks...`)}`);
						await this.gulp(name);
						const conf = this.configForName(name);
						let output = this.outputPath(conf);
						if (!fs.existsSync(output)) {
							throw new Error(`cann't fount output path ${output}`);
						}
						if (conf.restart) {
							if (bash) {
								_.each(bash, (shell) => {
									shell && shell.kill && shell.kill();
								});
							}
							bash = generateShells(conf.restart, null, output);
							console.log(`${chalk.green.underline(`restart : ${output}`)}`);
							await Promise.all(bash);
						}
						console.log(`${chalk.green.underline(`restart : ${output}`)}`);
					} catch (e) {
						console.error(e);
					}
				});
			} catch (e) {
				console.error(e);
			}
		};
		this.cache = {};
		await this.gulp(name);
		const conf = this.configForName(name);
		let output = this.outputPath(conf);
		if (!fs.existsSync(output)) {
			throw new Error(`cann't fount output path ${output}`);
		}
		await watch();
		if (conf.start) {
			bash = generateShells(conf.start, null, output);
			console.log(`${chalk.green.underline(`success : ${output}`)}`);
			await Promise.all(bash);
		}
		console.log(`${chalk.green.underline(`success : ${output}`)}`);
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
				const conf = this.configForName(name);
				let output = this.outputPath(conf);
				let dest = this.destPath(conf);
				if (!fs.existsSync(output)) return;
				if (conf.build) {
					await Promise.all(conf.build, { cwd: output });
					await runShell(
						`mkdir -p ${dest} && cd ${dest} && tar -zcf ${conf.name}.${conf.version}.tar.gz -C ${output} . && echo '${conf.name}.${conf.version}' > version`
					);
				}
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
