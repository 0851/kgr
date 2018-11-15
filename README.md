# kgr
> 项目修剪工具 , 输出项目前执行修剪工作 , 文件增删改 , 内容正则替换

### install
```bash
npm install kgr
```
```bash
Usage: kgr [options]

Options:
  -V, --version          output the version number
  -c, --config [config]  config file ',' separated, glob mode
  -o, --output [output]  output path (default: "dist")
  -t, --tmp [tmp]        tmp path (default: ".source")
  -m, --mode [mode]      run project mode , default dev (default: "dev")
  -n, --name [name]      run project name , default find first name in config file (default: "")
  --init [init]          init project (default: "") 是否需要重新init
  --copy [copy]          copy project (default: "") 是否需要重新拷贝项目
  -h, --help             output usage information

```

### 说明
执行流程
1. 检出配置文件中 `git` 对应的 `remote` `version(这里可以是branch , tag , commitid)` , 同时执行初始化操作 如 `npm install`
2. 复制到指定目录 \[下文中使用`tmp`代替\]
3. 删除配置文件中`remove`匹配的文件
4. 替换配置文件中`replace`参数内的文件到`tmp` , `replace` 规则如下:
    1. `source`,`target` 可使用绝对路径 , 或相对路径
    2. `source`相对路径 , 使用当前配置文件作为依据 , `target`相对路径使用的是`tmp`目录作为依据
    3. `source` 文件存在 , `target` 文件存在 --> 执行替换操作
    4. `source` 文件存在 , `target` 文件不存在 --> 执行添加操作
5. 使用配置文件中的`pipe`参数过滤`tmp`内部的所有文件 , 默认会忽略掉一些大文件 , 规则
    1. 使用glob`['./**/*','!./{bower_components,node_modules,dist,build}{,/**}','!./**/*.{tar.gz,swf,mp4,webm,ogg,mp3,wav,flac,aac,png,jpg,gif,svg,eot,woff,woff2,ttf,otf,swf}']`
    2. 可在配置文件中添加`glob`数组, 追加已经忽略的文件 如 `"glob":["./node_modules/kpc/src/components/*.js"]`
6. `dev` 模式下会监听配置文件,`replace`参数内的源文件改动 , 重新执行`2`,`3`,`4`步骤 ; `build`模式下将会导出`tar.gz`的文件到指定的`output`目录下,如`output`不存在,只做提示不做任何处理



### 配置文件示例
```js
module.exports = function () {
    return [

        /**
         * 参数说明
         * [name] <string> 必填
         * [remote] <string> 必填
         * [version] <string> (tag|branch|commitid) 必填
         * [glob] [tag|branch|commitid] <string> 必填
         * [pipe] <array[<function(content<string>,filename<string>,file<File Object>):content<string>>]> | <function(content<string>,filename<string>,file<File Object>):content<string>> 选填
         * [replace] <array[<object>[source,target]]> 选填
         * [start] <string> 选填 启动命令
         * [restart] <string> 选填 更改文件后触发重启命令
         * [build] <string> 选填 构建命令
         */

        {
            //项目名 , 如没有output参数时,做导出目录的目录名
            name: 'components',
            //需要执行的初始化命令
            init: 'npm install lodash --verbose',
            //启动命令 ,mode dev时执行
            start: 'ls',
            //文件改变后命令 , 空代表改变文件后不触发操作 , mode dev 时执行
            restart: 'ls -l',
            //构建命令 ,mode build时执行
            build:'',
            //git 地址
            remote: 'http://xxxx/xxxx/xxx.git',
            //分支
            version: 'yinhe-20190921-pbc-v1',
            glob: ['!./output/**/*','./output/test/*.js'],
            pipe: [ //请使用 [gulp-replace语法](https://www.npmjs.com/package/gulp-replace)
                ['console.ksyun.com', '{$common.sss}'],
                ['ksyun', 'lkkl'],
                ['com', function () {
                    return this.file.relative
                }]
            ],
            // 新增与替换资源路径
            //`source`路径不能为空,相对路径时以配置文件所在位置查找;
            //`target`路径不能为空,相对路径时以输出目录作为依据
            replace: {
                "target":"source",
                "target":"source"
            },
            // 待移除文件 glob模式以输出目录作为依据
            remove: []
        }
    ]
}
```


### 注意
1. 请确保有`git`仓库的clone 权限
2. 避免加入大文件 `replace` , 可使用golb 忽略
3. `pipe`使用方法, 请参考 [`gulp-replace`](https://www.npmjs.com/package/gulp-replace) , 参数以数组方式传入
4. 请确保运行环境 存在 `git` , `tar` 命令