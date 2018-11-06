import path from "path";
import debug from "debug";
import pkg from "../../package.json";
import _ from 'lodash'
import {spawn, exec} from "child_process";

const log = debug(`${pkg.name}:core`);

const noop = () => {
}

function getAbsPath(output, base) {
    const isAbs = path.isAbsolute(output);
    base = base || process.cwd()
    log(`base cwd ${base}`)
    output = isAbs ? output : path.resolve(base, output);
    return output
}

function runShell(cmd, options = {}) {
    if (!cmd) {
        return;
    }
    log(`run shell cmd : ${cmd}`)
    return new Promise(function (resolve, reject) {
        const child = exec(cmd, {
            ...{
                maxBuffer: 20000 * 1024,
                env: {
                    ...{
                        FORCE_COLOR: 1,
                        COLOR: 'always',
                        NPM_CONFIG_COLOR: 'always'
                    },
                    ...process.env,
                    ...(options.env || {})
                }
            },
            ...options
        }, (error, stdout, stderr) => {
            if (error) {
                console.log(cmd, error)
                reject(error);
                return;
            }
            resolve([stdout, stderr])
        })
        console.log(`---exec ${cmd} start--- `);
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    })
}

async function tasks(processes) {
    if (!_.isArray(processes)) {
        return
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
            throw e;
        }
    } while (processes.length);
    return data
}

export {
    getAbsPath,
    runShell,
    tasks
}