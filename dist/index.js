'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _isRegExp2 = require('lodash/isRegExp');

var _isRegExp3 = _interopRequireDefault(_isRegExp2);

var _find2 = require('lodash/find');

var _find3 = _interopRequireDefault(_find2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _reduce2 = require('lodash/reduce');

var _reduce3 = _interopRequireDefault(_reduce2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _gulp2 = require('gulp');

var _gulp3 = _interopRequireDefault(_gulp2);

var _gulpReplace = require('gulp-replace');

var _gulpReplace2 = _interopRequireDefault(_gulpReplace);

var _gulpCached = require('gulp-cached');

var _gulpCached2 = _interopRequireDefault(_gulpCached);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _parseConfig = require('./libs/parse-config');

var _core = require('./libs/core');

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _vinyl = require('vinyl');

var _vinyl2 = _interopRequireDefault(_vinyl);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)(_package2.default.name);

function generateShells(bash, config, root) {
	if (!(0, _isArray3.default)(bash)) {
		bash = bash;
	}
	var shells = (0, _reduce3.default)(bash, function (res, b) {
		if ((0, _isString3.default)(b)) {
			var conf = (0, _extends3.default)({}, config);
			conf.cwd = _path2.default.resolve(root, conf.cwd || '');
			res.push((0, _core.runShell)(b, conf));
		}
		if ((0, _isArray3.default)(b)) {
			var st = b[0];
			var _conf = (0, _extends3.default)({}, config, b[1]);
			_conf.cwd = _path2.default.resolve(root, _conf.cwd || '');
			res.push((0, _core.runShell)(st, _conf));
		}
		return res;
	}, []);
	return shells;
}

var Kgr = function () {
	function Kgr(args) {
		(0, _classCallCheck3.default)(this, Kgr);

		this.setArgs(args);
		log('---start---');
		this.setConfig();
	}

	(0, _createClass3.default)(Kgr, [{
		key: 'setArgs',
		value: function setArgs(args) {
			this.args = args;
		}
	}, {
		key: 'getArgs',
		value: function getArgs() {
			return this.args;
		}
	}, {
		key: 'setConfig',
		value: function setConfig() {
			var config = (0, _parseConfig.readConfig)(this.getArgs().config);
			this.config = config;
			return config;
		}
	}, {
		key: 'configForName',
		value: function configForName(name) {
			var config = this.setConfig();
			var matched = (0, _find3.default)(config, function (conf) {
				return conf.name === name;
			});
			if (!matched) {
				throw new Error(name + ' not fount matched ' + (0, _stringify2.default)(config) + ' , please check config file');
			}
			return matched;
		}
	}, {
		key: 'sourcePath',
		value: function sourcePath(conf) {
			var version = conf.version;
			var source = this.getArgs().source || '.source';
			source = (0, _core.getAbsPath)(source);
			source = _path2.default.resolve(source, version);
			return source;
		}

		// destPath(conf) {
		// 	let version = conf.version;
		// 	let dest = this.getArgs().dest || 'dest';
		// 	dest = getAbsPath(dest);
		// 	dest = path.resolve(dest);
		// 	return dest;
		// }

	}, {
		key: 'outputPath',
		value: function outputPath(conf) {
			var version = conf.version;
			var output = this.getArgs().output || 'output';
			output = (0, _core.getAbsPath)(output);
			output = _path2.default.resolve(output);
			return output;
		}
	}, {
		key: 'init',
		value: function () {
			var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(name) {
				var _this = this;

				var conf, args, url, version, source, output, successFile, versionFile, tarName, _init, _copyOutput;

				return _regenerator2.default.wrap(function _callee3$(_context3) {
					while (1) {
						switch (_context3.prev = _context3.next) {
							case 0:
								conf = this.configForName(name);
								args = this.getArgs();
								url = conf.remote;
								version = conf.version;
								source = this.sourcePath(conf);
								output = this.outputPath(conf);
								successFile = '.kgr_success';
								versionFile = '.kgr_version_' + conf.version;
								tarName = conf.name + '-' + version + '.tar.gz';

								_init = function () {
									var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
										var _ref3, stdout, stderr;

										return _regenerator2.default.wrap(function _callee$(_context) {
											while (1) {
												switch (_context.prev = _context.next) {
													case 0:
														_context.next = 2;
														return (0, _core.runShell)('git version');

													case 2:
														_ref3 = _context.sent;
														stdout = _ref3.stdout;
														stderr = _ref3.stderr;

														if (/version/.test(stdout)) {
															_context.next = 7;
															break;
														}

														throw new Error('please install git on your pc');

													case 7:
														_context.next = 9;
														return (0, _core.runShell)('rm -rf ' + source + ' && git clone --depth=1 -b ' + version + ' ' + url + ' ' + source + ' && cd ' + source + ' && rm -rf .git');

													case 9:
														_context.next = 11;
														return _promise2.default.all(generateShells(conf.bash, null, source));

													case 11:
														_context.next = 13;
														return (0, _core.runShell)('cd ' + source + ' && b=' + tarName + '; tar --exclude=$b -zcf $b . && echo \'success\' > ' + successFile);

													case 13:
													case 'end':
														return _context.stop();
												}
											}
										}, _callee, _this);
									}));

									return function _init() {
										return _ref2.apply(this, arguments);
									};
								}();

								if (!args.init) {
									_context3.next = 13;
									break;
								}

								_context3.next = 13;
								return _init();

							case 13:
								if (_fs2.default.existsSync(_path2.default.resolve(source, successFile))) {
									_context3.next = 16;
									break;
								}

								_context3.next = 16;
								return _init();

							case 16:
								_copyOutput = function () {
									var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
										return _regenerator2.default.wrap(function _callee2$(_context2) {
											while (1) {
												switch (_context2.prev = _context2.next) {
													case 0:
														log('cp start');
														_context2.next = 3;
														return (0, _core.runShell)('rm -rf ' + output + ' && mkdir -p ' + output + ' && cd ' + output + ' && tar -zxf ' + _path2.default.resolve(source, tarName) + ' && echo \'' + version + '\' > ' + versionFile);

													case 3:
														log('cp end');

													case 4:
													case 'end':
														return _context2.stop();
												}
											}
										}, _callee2, _this);
									}));

									return function _copyOutput() {
										return _ref4.apply(this, arguments);
									};
								}();

								if (!args.copy) {
									_context3.next = 20;
									break;
								}

								_context3.next = 20;
								return _copyOutput();

							case 20:
								if (_fs2.default.existsSync(_path2.default.resolve(output, '' + versionFile))) {
									_context3.next = 23;
									break;
								}

								_context3.next = 23;
								return _copyOutput();

							case 23:
								return _context3.abrupt('return', conf);

							case 24:
							case 'end':
								return _context3.stop();
						}
					}
				}, _callee3, this);
			}));

			function init(_x) {
				return _ref.apply(this, arguments);
			}

			return init;
		}()
	}, {
		key: 'gulp',
		value: function gulp(name) {
			var _this2 = this;

			return new _promise2.default(function (resolve, reject) {
				try {
					var self = _this2;
					var conf = _this2.configForName(name);
					console.log('' + _chalk2.default.green('run pipe task...'));
					var tmp = _this2.sourcePath(conf);
					var output = _this2.outputPath(conf);
					var opt = { base: tmp, cwd: tmp };
					var glob = ['**/{*,.*}', '!**/package.json', '!**/package-lock.json', '!**/yarn.lock', '!**/{bower_components,node_modules,dist,build}/**', '!**/{*,.*}.{tar.gz,swf,mp4,webm,ogg,mp3,wav,flac,aac,png,jpg,gif,svg,eot,woff,woff2,ttf,otf,swf}'];

					if (conf.glob) {
						conf.glob = (0, _isArray3.default)(conf.glob) ? conf.glob : [conf.glob];
						glob = glob.concat(conf.glob);
					}

					var removeGlob = [];
					if (conf.remove) {
						//过滤掉源 , 避免再次push到output中
						removeGlob = _globby2.default.sync(conf.remove, opt).map(function (file) {
							console.log(_chalk2.default.underline.yellow('file        removed   ::   ' + file));
							//删除时清除缓存 , 以便下次重建
							delete self.cache[file];
							return '!' + file;
						});
					}

					log('gulp matched start');
					log('' + glob.join('\n'));
					log('gulp removeGlob start');
					log('' + removeGlob.join('\n'));
					var matched = _globby2.default.sync(glob.concat(removeGlob), opt);
					log('gulp matched end ' + (0, _stringify2.default)(matched));

					//得到需要追加或替换的文件
					var files = (0, _core.getFiles)(conf.replace, _path2.default.dirname(conf.__filename), matched);

					var sourceFiles = [];
					var stream = _gulp3.default.src(matched, opt);

					log('gulp file replace start');
					//对流进行预先处理 , 追加文件,替换文件,删除文件,等
					stream = stream.pipe((0, _core.gulpCUD)(files, tmp));
					log('gulp file replace end');

					var pipes = conf.pipe;
					if (!(0, _isArray3.default)(pipes)) {
						pipes = [pipes];
					}

					log('gulp content replace start');
					stream = (0, _reduce3.default)(pipes, function (stream, pipe) {
						if (!(0, _isArray3.default)(pipe)) {
							return stream;
						}
						var reg = pipe[0];
						var replacement = pipe[1];
						var options = pipe[2];
						if (((0, _isString3.default)(reg) || (0, _isRegExp3.default)(reg)) && ((0, _isFunction3.default)(replacement) || (0, _isString3.default)(replacement))) {
							stream = stream.pipe((0, _gulpReplace2.default)(reg, replacement, options));
						}
						return stream;
					}, stream);
					log('gulp content replace end');
					log('gulp record start');
					stream = stream.pipe(_through2.default.obj(function (file, encoding, cb) {
						sourceFiles.push(file.relative);
						var contents = file.checksum;
						if (!contents && file.isBuffer()) {
							contents = file.contents.toString('utf8');
						}
						if (file.__new === true) {
							console.log(_chalk2.default.underline.green('file          newed   ::   ' + file.relative));
						}
						if (file.__changed === true) {
							console.log(_chalk2.default.underline.green('file        changed   ::   ' + file.relative));
						}
						if (!self.cache.hasOwnProperty(file.relative)) {
							console.log(_chalk2.default.underline.green('content        init   ::   ' + file.relative));
							this.push(file);
							self.cache[file.relative] = contents;
						}
						if (self.cache[file.relative] !== contents) {
							console.log(_chalk2.default.underline.green('content     changed   ::   ' + file.relative));
							this.push(file);
							self.cache[file.relative] = contents;
						}
						cb();
					}));
					log('gulp record end');
					var _end = function _end() {
						log('clean start');
						//清理已删除或不应存在在output目录中的文件
						var cleanFiles = _globby2.default.sync(glob, { base: output, cwd: output });
						log('sourceFiles ' + (0, _stringify2.default)(sourceFiles));
						log('cleanFiles ' + (0, _stringify2.default)(cleanFiles));
						var versionFile = '.kgr_version_' + conf.version;
						//删除时清除缓存 , 以便下次重建
						var matchedClean = (0, _core.clean)(sourceFiles, cleanFiles);
						(0, _each3.default)(matchedClean, function (file) {
							if (file === versionFile) {
								return;
							}
							var _file = _path2.default.resolve(output, file);
							console.log(_chalk2.default.underline.yellow('file          clean   ::   ' + file));
							_del2.default.sync(_file);
							delete self.cache[file];
						});
						log('clean end');
						log('end pipe...');
						console.log('' + _chalk2.default.green('end pipe task...'));
						resolve(conf);
					};
					var _error = function _error(err) {
						log('error pipe... ' + err);
						reject(err);
					};
					stream.pipe(_gulp3.default.dest('' + output)).on('end', _end).on('error', _error);
				} catch (e) {
					reject(e);
				}
			});
		}
	}, {
		key: 'devServer',
		value: function () {
			var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(name) {
				var _this3 = this;

				var bash, watch, conf, output;
				return _regenerator2.default.wrap(function _callee6$(_context6) {
					while (1) {
						switch (_context6.prev = _context6.next) {
							case 0:
								bash = null;

								watch = function () {
									var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
										var _conf2, files;

										return _regenerator2.default.wrap(function _callee5$(_context5) {
											while (1) {
												switch (_context5.prev = _context5.next) {
													case 0:
														_context5.prev = 0;
														_conf2 = _this3.configForName(name);
														_context5.next = 4;
														return (0, _core.findDependen)(_conf2.__filename);

													case 4:
														files = _context5.sent;

														files = files.concat((0, _core.getExistsReplace)(_conf2.replace, _path2.default.dirname(_conf2.__filename)));
														log('watch start ... , ' + files);
														_gulp3.default.watch(files, function () {
															var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(event) {
																var _conf3, _output;

																return _regenerator2.default.wrap(function _callee4$(_context4) {
																	while (1) {
																		switch (_context4.prev = _context4.next) {
																			case 0:
																				_context4.prev = 0;

																				console.log('' + _chalk2.default.yellow('File ' + event.path + ' was ' + event.type + ' , running tasks...'));
																				_context4.next = 4;
																				return _this3.gulp(name);

																			case 4:
																				_conf3 = _this3.configForName(name);
																				_output = _this3.outputPath(_conf3);

																				if (_fs2.default.existsSync(_output)) {
																					_context4.next = 8;
																					break;
																				}

																				throw new Error('cann\'t fount output path ' + _output);

																			case 8:
																				if (!_conf3.restart) {
																					_context4.next = 14;
																					break;
																				}

																				if (bash) {
																					(0, _each3.default)(bash, function (shell) {
																						shell && shell.kill && shell.kill();
																					});
																				}
																				bash = generateShells(_conf3.restart, null, _output);
																				console.log('' + _chalk2.default.green.underline('restart : ' + _output));
																				_context4.next = 14;
																				return _promise2.default.all(bash);

																			case 14:
																				console.log('' + _chalk2.default.green.underline('restart : ' + _output));
																				_context4.next = 20;
																				break;

																			case 17:
																				_context4.prev = 17;
																				_context4.t0 = _context4['catch'](0);

																				console.error(_context4.t0);

																			case 20:
																			case 'end':
																				return _context4.stop();
																		}
																	}
																}, _callee4, _this3, [[0, 17]]);
															}));

															return function (_x3) {
																return _ref7.apply(this, arguments);
															};
														}());
														_context5.next = 13;
														break;

													case 10:
														_context5.prev = 10;
														_context5.t0 = _context5['catch'](0);

														console.error(_context5.t0);

													case 13:
													case 'end':
														return _context5.stop();
												}
											}
										}, _callee5, _this3, [[0, 10]]);
									}));

									return function watch() {
										return _ref6.apply(this, arguments);
									};
								}();

								this.cache = {};
								_context6.next = 5;
								return this.gulp(name);

							case 5:
								conf = this.configForName(name);
								output = this.outputPath(conf);

								if (_fs2.default.existsSync(output)) {
									_context6.next = 9;
									break;
								}

								throw new Error('cann\'t fount output path ' + output);

							case 9:
								_context6.next = 11;
								return watch();

							case 11:
								if (!conf.start) {
									_context6.next = 16;
									break;
								}

								bash = generateShells(conf.start, null, output);
								console.log('' + _chalk2.default.green.underline('success : ' + output));
								_context6.next = 16;
								return _promise2.default.all(bash);

							case 16:
								console.log('' + _chalk2.default.green.underline('success : ' + output));

							case 17:
							case 'end':
								return _context6.stop();
						}
					}
				}, _callee6, this);
			}));

			function devServer(_x2) {
				return _ref5.apply(this, arguments);
			}

			return devServer;
		}()
	}, {
		key: 'dev',
		value: function () {
			var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(name) {
				var _this4 = this;

				return _regenerator2.default.wrap(function _callee9$(_context9) {
					while (1) {
						switch (_context9.prev = _context9.next) {
							case 0:
								_context9.next = 2;
								return (0, _core.tasks)([(0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
									return _regenerator2.default.wrap(function _callee7$(_context7) {
										while (1) {
											switch (_context7.prev = _context7.next) {
												case 0:
													_context7.next = 2;
													return _this4.init(name);

												case 2:
													return _context7.abrupt('return', _context7.sent);

												case 3:
												case 'end':
													return _context7.stop();
											}
										}
									}, _callee7, _this4);
								})), (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
									return _regenerator2.default.wrap(function _callee8$(_context8) {
										while (1) {
											switch (_context8.prev = _context8.next) {
												case 0:
													_context8.next = 2;
													return _this4.devServer(name);

												case 2:
													return _context8.abrupt('return', _context8.sent);

												case 3:
												case 'end':
													return _context8.stop();
											}
										}
									}, _callee8, _this4);
								}))]);

							case 2:
							case 'end':
								return _context9.stop();
						}
					}
				}, _callee9, this);
			}));

			function dev(_x4) {
				return _ref8.apply(this, arguments);
			}

			return dev;
		}()
	}, {
		key: 'build',
		value: function () {
			var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(name) {
				var _this5 = this;

				return _regenerator2.default.wrap(function _callee12$(_context12) {
					while (1) {
						switch (_context12.prev = _context12.next) {
							case 0:
								_context12.next = 2;
								return (0, _core.tasks)([(0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
									return _regenerator2.default.wrap(function _callee10$(_context10) {
										while (1) {
											switch (_context10.prev = _context10.next) {
												case 0:
													_context10.next = 2;
													return _this5.init(name);

												case 2:
													return _context10.abrupt('return', _context10.sent);

												case 3:
												case 'end':
													return _context10.stop();
											}
										}
									}, _callee10, _this5);
								})), (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
									var conf, output;
									return _regenerator2.default.wrap(function _callee11$(_context11) {
										while (1) {
											switch (_context11.prev = _context11.next) {
												case 0:
													_this5.cache = {};
													_context11.next = 3;
													return _this5.gulp(name);

												case 3:
													conf = _this5.configForName(name);
													output = _this5.outputPath(conf);
													// let dest = this.destPath(conf);

													if (_fs2.default.existsSync(output)) {
														_context11.next = 7;
														break;
													}

													return _context11.abrupt('return');

												case 7:
													if (!conf.build) {
														_context11.next = 10;
														break;
													}

													_context11.next = 10;
													return _promise2.default.all(conf.build, { cwd: output });

												case 10:
												case 'end':
													return _context11.stop();
											}
										}
									}, _callee11, _this5);
								}))]
								// await runShell(
								// 	`mkdir -p ${dest} && cd ${dest} && tar -zcf ${conf.name}.${conf.version}.tar.gz -C ${output} . && echo '${conf.name}.${conf.version}' > version`
								// );
								);

							case 2:
							case 'end':
								return _context12.stop();
						}
					}
				}, _callee12, this);
			}));

			function build(_x5) {
				return _ref11.apply(this, arguments);
			}

			return build;
		}()
	}, {
		key: 'run',
		value: function () {
			var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
				var args, name, mode;
				return _regenerator2.default.wrap(function _callee13$(_context13) {
					while (1) {
						switch (_context13.prev = _context13.next) {
							case 0:
								_context13.prev = 0;
								args = this.getArgs();
								name = args.name || this.setConfig()[0].name;
								mode = args.mode || 'dev';

								if (name) {
									_context13.next = 6;
									break;
								}

								throw new Error('请设置一个启动项目的名称');

							case 6:
								if (!(mode === 'dev')) {
									_context13.next = 9;
									break;
								}

								_context13.next = 9;
								return this.dev(name);

							case 9:
								if (!(mode === 'build')) {
									_context13.next = 12;
									break;
								}

								_context13.next = 12;
								return this.build(name);

							case 12:
								_context13.next = 17;
								break;

							case 14:
								_context13.prev = 14;
								_context13.t0 = _context13['catch'](0);

								console.error(_context13.t0);

							case 17:
							case 'end':
								return _context13.stop();
						}
					}
				}, _callee13, this, [[0, 14]]);
			}));

			function run() {
				return _ref14.apply(this, arguments);
			}

			return run;
		}()
	}]);
	return Kgr;
}();

exports.default = Kgr;
module.exports = exports.default;