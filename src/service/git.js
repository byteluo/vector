const path = require('path');

const Log = require('./log');
const { spawn } = require('child_process');
const { isDirExist } = require('./file');

module.exports = class GitTools {
    constructor(gitUrl) {
        this.gitUrl = gitUrl;
    }

    add() {
        const params = ['add', '.'];
        return this.startChildProcess('git', params);
    }

    commit(remark = 'vector commit') {
        const params = ['commit', '-m', remark];
        return this.startChildProcess('git', params);
    }

    push(branch) {
        if (!branch) {
            throw 'please input branch name !';
        }

        const params = ['push', 'origin', branch];

        return this.startChildProcess('git', params);
    }

    checkout(branch) {
        if (!branch) {
            throw 'please input branch name !';
        }

        const params = ['checkout', branch];

        return this.startChildProcess('git', params);
    }

    async pull() {
        const result = await this.startChildProcess('git', ['pull']);
        return result.indexOf('Already up to date') < 0;
    }

    async status() {
        try {
            const params = ['status', '-s'];
            const result = await this.startChildProcess('git', params);
            return result ? true : false;
        } catch (err) {
            console.error(err);
        }

        return false;
    }

    async init() {
        const startIndex =
            'git@gitee.com:bytesci/treecat-doc.git'.lastIndexOf('/') + 1;
        const repoName = this.gitUrl.substring(
            startIndex,
            this.gitUrl.length - 4
        );

        const repoIsExist = await isDirExist(repoName);
        const repoPath = path.resolve(repoName);

        if (!repoIsExist) {
            Log.info('try to clone repo', this.gitUrl);
            await this.startChildProcess('git', ['clone ' + this.gitUrl]);
        }
        this.cwd = repoPath;
    }

    startChildProcess(command, params) {
        const cmd = command + ' ' + params.join(' ');

        return new Promise((resolve, reject) => {
            const process = spawn(cmd, {
                shell: true,
                cwd: this.cwd,
            });

            process.stdout.on('data', (data) => {
                resolve(data.toString());
            });

            process.on('close', (returnCode) => {
                if (returnCode != 0) {
                    reject(`> ${cmd}`);
                } else {
                    resolve();
                }
            });
        });
    }
};
