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

var _lesxCodeInject;

function _load_lesxCodeInject() {
    return _lesxCodeInject = require('lesx-code-inject');
}

var _lesxUndeclaredVars;

function _load_lesxUndeclaredVars() {
    return _lesxUndeclaredVars = _interopRequireDefault(require('lesx-undeclared-vars'));
}

var _jsBeautify;

function _load_jsBeautify() {
    return _jsBeautify = _interopRequireDefault(require('js-beautify'));
}

var _lodash;

function _load_lodash() {
    return _lodash = _interopRequireDefault(require('lodash.uniq'));
}

var _lodash2;

function _load_lodash2() {
    return _lodash2 = _interopRequireDefault(require('lodash.difference'));
}

var _lodash3;

function _load_lodash3() {
    return _lodash3 = _interopRequireDefault(require('lodash.intersection'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('colors');

const reactCodePath = (_path || _load_path()).default.resolve(__dirname, '../src/tpl.js');
const reactCode = (_fsExtra || _load_fsExtra()).default.readFileSync(reactCodePath, 'utf-8');

exports.default = ({
    uiLib,
    template = '',
    script = '',
    componentTags = []
}) => {
    componentTags = (0, (_lodash || _load_lodash()).default)(componentTags);

    // 返回整合好后的js代码
    const composeRes = {
        ahead: [], // 顶部插入
        renderVars: [], // render函数内部变量
        renderReactElements: `` // React.createElement()代码
    };

    const getLibRes = (0, (_utils || _load_utils()).composeComponentImportCode)(componentTags, uiLib);
    const componentImportCode = getLibRes.uiLibImports.join('');

    [].push.apply(composeRes.ahead, [`import React, {Component} from 'react';
         import reactMixin from 'react-mixin';
        `, componentImportCode, script]);

    // render方法中的变量声明
    composeRes.renderVars.push(`
        const {
            $setState,
            $getRef,
            $refresh,
            $getProps,
        } = this._innerMethods;
    `);

    // console.log('template:', template);

    try {
        composeRes.renderReactElements = (0, (_lesxJsx || _load_lesxJsx()).default)(template);
    } catch (e) {
        console.log(`template内容生成jsx出错：${e}`.red);
    }

    let jsCode = reactCode;

    // 顶部插入import代码
    try {
        jsCode = (0, (_lesxCodeInject || _load_lesxCodeInject()).insertImportCode)(jsCode, composeRes.ahead);
    } catch (e) {
        console.log(`[Warning] 顶部插入代码报错：${e}`.red);
    }

    // 未声明的变量获取全部来自：composeRes.renderReactElements
    var renderCode = `
        ${composeRes.renderVars.join('')}

        return ${composeRes.renderReactElements}
    `;

    // 获取js中所有未声明的变量
    var undeclaredVars = [];

    try {
        // TODO: 这里可能需要优化，最好按照：从组装好的代码找出未声明的变量，然后再组装最终的代码/render中插入组件获取代码
        undeclaredVars = (0, (_lodash || _load_lodash()).default)((0, (_lesxUndeclaredVars || _load_lesxUndeclaredVars()).default)(`
            ${jsCode}

            function __render() {
                ${renderCode}
            }
        `));
    } catch (e) {
        console.log(`[lesx-dsl-to-jsx] 获取未声明的变量出错：${e}`.red);
        console.log(`[lesx-dsl-to-jsx] 出错代码如下：`.red);
        console.log((0, (_jsBeautify || _load_jsBeautify()).default)(renderCode, {
            indent_size: 4
        }));
    }

    if (Array.isArray(undeclaredVars) && undeclaredVars.length) {
        // 去除掉一些全局变量
        undeclaredVars = (0, (_lodash2 || _load_lodash2()).default)(undeclaredVars, getLibRes.libComponentTags.concat(['React', 'Component', 'ReactDom', 'undefined', 'null', 'window', 'NaN', 'Infinity', 'module', 'Object', 'Array', 'Function', 'String', 'Boolean', 'RegExp', 'console', 'alert']));

        // 获取真正未声明的组件，这一部分通过组件props传递进来
        const realNotDefinedComponents = (0, (_lodash3 || _load_lodash3()).default)(getLibRes.notInLibtags, undeclaredVars);

        // 未声明的变量，从this声明
        undeclaredVars = (0, (_lodash2 || _load_lodash2()).default)(undeclaredVars, getLibRes.notInLibtags);

        // 组装render函数内部代码
        renderCode = `
            // 自带变量获取
            ${composeRes.renderVars.join('')}

            // 免写this
            const {
                ${undeclaredVars.join(', ')}
            } = this;

            // 未声明组件从props传递进来
            const {
                ${realNotDefinedComponents.join(',')}
            } = this.props.components || this;

            return ${composeRes.renderReactElements}
        `;
    }

    // 插入render方法
    try {
        jsCode = (0, (_lesxCodeInject || _load_lesxCodeInject()).insertCodeToScript)(jsCode, [{
            name: 'render', // 方法名
            body: renderCode, // 插入的代码
            isCover: true // 是否强制覆盖，默认不覆盖，设置为true则强制覆盖
        }]);
    } catch (e) {
        console.log(`[Warning] render方法插入代码报错：${e}`.red);
    }

    // console.log('jsCode:'.red);
    // console.log(beautify(jsCode, {
    //     indent_size: 4
    // }));

    return jsCode;
};

module.exports = exports['default'];