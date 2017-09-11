import fse from 'fs-extra';
import path from 'path';

import {composeComponentImportCode} from './utils';

import lesxJsx from 'lesx-jsx';

import {insertImportCode, insertCodeToScript, insertCodeToMethod} from 'lesx-code-inject';

import getUndeclaredVars from 'lesx-undeclared-vars';
const difference = require('lodash.difference');

require('colors');

const reactCodePath = path.resolve(__dirname, '../src/tpl.js');
const reactCode = fse.readFileSync(reactCodePath, 'utf-8');

export default({
    uiLib,
    template = '',
    script = '',
    componentTags = []
}) => {
    // 返回整合好后的js代码
    const composeRes = {
        ahead: [], // 顶部插入
        renderVars: [], // render函数内部变量
        renderReactElements: ``, // React.createElement()代码
    };

    const getLibRes = composeComponentImportCode(componentTags, uiLib);
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
        composeRes.renderReactElements = lesxJsx(template);
    } catch (e) {
        console.log(`template内容生成jsx出错：${e}`.red);
    }

    let jsCode = reactCode;

    // 顶部插入import代码
    try {
        jsCode = insertImportCode(jsCode, composeRes.ahead);
    } catch (e) {
        console.log(`[Warning] 顶部插入代码报错：${e}`.red);
    }

    let renderCode = `
        ${composeRes.renderVars.join('')}

        const {
            ${getLibRes.notInLibtags.join(',')}
        } = this.props.components || {};

        return ${composeRes.renderReactElements}
    `;

    // 获取js中所有未声明的变量
    let undeclaredVars = getUndeclaredVars(`function render() {
            ${renderCode}
        }`);

    if (Array.isArray(undeclaredVars) && undeclaredVars.length) {
        undeclaredVars = difference(undeclaredVars, getLibRes.libComponentTags.concat([
            'React',
            'Component',
            'ReactDom',
            'undefined',
            'null',
            'window',
            'NaN',
            'Infinity',
            'module',
            'Object',
            'Array',
            'Function',
            'String',
            'Boolean',
            'RegExp'
        ]));

        if (Array.isArray(undeclaredVars) && undeclaredVars.length) {
            renderCode = `
                const {
                    ${undeclaredVars.join(', ')}
                } = this;

                ${renderCode}
            `;
        }
    }

    // 插入render方法
    try {
        jsCode = insertCodeToScript(jsCode, [
            {
                name: 'render', // 方法名
                body: renderCode, // 插入的代码
                isCover: true // 是否强制覆盖，默认不覆盖，设置为true则强制覆盖
            }
        ]);
    } catch (e) {
        console.log(`[Warning] render方法插入代码报错：${e}`.red);
    }

    console.log('jsCode:'.red, jsCode);

    return jsCode;
};
