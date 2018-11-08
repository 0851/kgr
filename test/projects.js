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
         */

        {
            //项目名 , 如没有output参数时,做导出目录的目录名
            name: 'components',
            //需要执行的初始化命令
            bash: 'npm install lodash --verbose',
            //启动命令 ,mode dev时执行
            start: 'ls',
            //文件改变后命令 , 空代表改变文件后不触发操作 , mode dev时执行
            restart: 'ls -l',
            //git 地址
            remote: 'http://xxxx/ksc-cns-fe/public-business-components.git',
            //分支
            version: 'yinhe-20190921-pbc-v1',
            glob: '',
            pipe: [ //请使用 [gulp-replace语法](https://www.npmjs.com/package/gulp-replace)
                ['console.ksyun.com', '{$common.sss}'],
                ['ksyun', 'lkkl'],
                ['com', function () {
                    return this.file.relative
                }]
            ],
            //待替换资源路径 , `source`为空时,`target`不为空删除 , `target`为空`source`不为空 追加 ,其他时替换
            replace: [
                {
                    //源路径 , 可以为静态地址, 或者网络地址 , git 仓库中分支文件
                    source: '',
                    //目标地址 , 当前git 仓库为根目录的路径 , 可以是目录或文件必须与source的文件类型保持一致
                    target: 'skdjldkjs.sj'
                },
                {
                    //源路径 , 可以为静态地址, 或者网络地址 , git 仓库中分支文件
                    source: 'sdsd',
                    //目标地址 , 当前git 仓库为根目录的路径 , 可以是目录或文件必须与source的文件类型保持一致
                    target: 'skdjldkjs.sj'
                },
                {
                    //源路径 , 可以为静态地址, 或者网络地址 , git 仓库中分支文件
                    source: 'sdsd',
                    //目标地址 , 当前git 仓库为根目录的路径 , 可以是目录或文件必须与source的文件类型保持一致
                    target: 'skdjldkjs.sj'
                },
                {
                    //源路径 , 可以为静态地址, 或者网络地址 , git 仓库中分支文件
                    source: 'sdsd',
                    //目标地址 , 当前git 仓库为根目录的路径 , 可以是目录或文件必须与source的文件类型保持一致
                    target: ''
                },
                {
                    //源路径 , 可以为静态地址, 或者网络地址 , git 仓库中分支文件
                    source: 'sdsd',
                    //目标地址 , 当前git 仓库为根目录的路径 , 可以是目录或文件必须与source的文件类型保持一致
                    target: ''
                }
            ]
        }
    ]
}