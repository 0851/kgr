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
         * [restart] <string>  选填 更改文件后触发重启命令 , true 时代表重新运行start , 其他命令时 代表停止start 重启一个restart 的命令
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