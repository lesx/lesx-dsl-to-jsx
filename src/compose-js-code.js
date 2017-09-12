import fse from 'fs-extra';
import path from 'path';

import {
    composeComponentImportCode
} from './utils';

import lesxJsx from 'lesx-jsx';

import {
    insertImportCode,
    insertCodeToScript,
    insertCodeToMethod,
} from 'lesx-code-inject';

import getUndeclaredVars from 'lesx-undeclared-vars';
import beautify from 'js-beautify';
import uniq from 'lodash.uniq';
import difference from 'lodash.difference';
import intersection from 'lodash.intersection';

require('colors');

const reactCodePath = path.resolve(__dirname, '../src/tpl.js');
const reactCode = fse.readFileSync(reactCodePath, 'utf-8');

export default ({
    uiLib,
    template = '',
    script = '',
    componentTags = []
}) => {
    componentTags = uniq(componentTags);

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

    // 未声明的变量获取全部来自：composeRes.renderReactElements
    var renderCode = `
        ${composeRes.renderVars.join('')}

        return ${composeRes.renderReactElements}
    `;

    // 获取js中所有未声明的变量
    var undeclaredVars = [];

    try {
        // TODO: 这里可能需要优化，最好按照：从组装好的代码找出未声明的变量，然后再组装最终的代码/render中插入组件获取代码
        undeclaredVars = uniq(getUndeclaredVars(`
            ${jsCode}

            function __render() {
                ${renderCode}
            }
        `));
    } catch (e) {
        console.log(`[lesx-dsl-to-jsx] 获取未声明的变量出错：${e}`.red);
        console.log(`[lesx-dsl-to-jsx] 出错代码如下：`.red);
        console.log(beautify(renderCode, {
            indent_size: 4
        }));
    }

    if (Array.isArray(undeclaredVars) && undeclaredVars.length) {
        // 去除掉一些全局变量
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
            'RegExp',
            'console',
            'alert',
        ]));

        // 获取真正未声明的组件，这一部分通过组件props传递进来
        const realNotDefinedComponents = intersection(getLibRes.notInLibtags, undeclaredVars);

        // 未声明的变量，从this声明
        undeclaredVars = difference(undeclaredVars, getLibRes.notInLibtags);

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
        jsCode = insertCodeToScript(jsCode, [{
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
