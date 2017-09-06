'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fsExtra;

function _load_fsExtra() {
    return _fsExtra = _interopRequireDefault(require('fs-extra'));
}

var _path;

function _load_path() {
    return _path = _interopRequireDefault(require('path'));
}

var _utils;

function _load_utils() {
    return _utils = require('./utils');
}

var _lesxJsx;

function _load_lesxJsx() {
    return _lesxJsx = _interopRequireDefault(require('lesx-jsx'));
}

var _codeInject;

function _load_codeInject() {
    return _codeInject = require('./code-inject');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('colors');

const reactCodePath = (_path || _load_path()).default.resolve(__dirname, '../src/tpl.js');
const reactCode = (_fsExtra || _load_fsExtra()).default.readFileSync(reactCodePath, 'utf-8');

exports.default = ({
    uiLib = 'antd',
    template = '',
    script = '',
    componentTags = []
}) => {
    // 返回整合好后的js代码
    const composeRes = {
        ahead: [], // 顶部插入
        renderVars: [], // render函数内部变量
        renderReactElements: `` // React.createElement()代码
    };

    const componentImportCode = (0, (_utils || _load_utils()).composeComponentImportCode)(componentTags, uiLib);

    [].push.apply(composeRes.ahead, [`import React, {Component} from 'react';
         import reactMixin from 'react-mixin';
        `, componentImportCode, script]);

    composeRes.renderVars.push(`
        const {
            $setState,
            $getRef,
            $refresh,
            $getProps,
        } = this._innerMethods;
    `);

    composeRes.renderReactElements = (0, (_lesxJsx || _load_lesxJsx()).default)(template);

    let jsCode = reactCode;

    // 顶部插入import代码
    try {
        jsCode = (0, (_codeInject || _load_codeInject()).insertImportCode)(jsCode, composeRes.ahead);
    } catch (e) {
        console.log(`[Warning] 顶部插入代码报错：${e}`.red);
    }

    // 插入render方法
    try {
        jsCode = (0, (_codeInject || _load_codeInject()).insertCodeToScript)(jsCode, [{
            name: 'render', // 方法名
            body: `
                ${composeRes.renderVars.join('')}

                return ${composeRes.renderReactElements}
            `, // 插入的代码
            isCover: true // 是否强制覆盖，默认不覆盖，设置为true则强制覆盖
        }]);
    } catch (e) {
        console.log(`[Warning] render方法插入代码报错：${e}`.red);
    }

    // console.log('jsCode:'.red, jsCode);

    return jsCode;
};

module.exports = exports['default'];