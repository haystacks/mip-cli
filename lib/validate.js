/**
 * @file mip页面验证
 * @author mengke01(kekee000@gmail.com)
 */

'use strict';
const validator = require('mip-validator')();
const path = require('path');
const fs = require('fs');
const request = require('request');
const cli = require('./cli');

function validate(fileOrUrl) {
    // add 本地资源检测
    if(/https?:\/\//.test(fileOrUrl)) {

        let chunks = [];
        let size = 0;
        let buf;
        let content = '';
        request(fileOrUrl).on('data', function(chunk) {
            chunks.push(chunk);
            size += chunk.length;
        }).on('end', function() {
            buf = Buffer.concat(chunks, size);
            content = buf.toString();
            dovalidate(content, fileOrUrl);
        });

    } else {

        let filePath = path.resolve(baseDir, fileOrUrl);
        if (!fs.existsSync(filePath)) {
            return;
        }
        let content = fs.readFileSync(filePath, 'utf-8');
        dovalidate(content, filePath);

    }
}

function dovalidate(content, fileOrUrl) {

    let errs = validator.validate(content);
    if (errs && errs.length) {
        cli.log('validate error', cli.chalk.green(fileOrUrl));
        errs.forEach(error => {
            cli.error('line', error.line, 'col', error.col +  ':', error.message);
        });
    }
    else {
        cli.log('validate success', cli.chalk.green(fileOrUrl));
    }

}

exports.exec = function (config) {
    const baseDir = config.baseDir || process.cwd();
    const files = config.files;
    files.forEach(fileOrUrl => {
        validate(fileOrUrl);
    });
};
