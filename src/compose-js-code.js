import fse from 'fs-extra';
import path from 'path';

import {
    composeComponentImportCode,
} from './utils';

import lesxJsx from 'lesx-jsx';

import {
    insertImportCode,
    insertCodeToScript,
    insertCodeToMethod,
} from 'lesx-code-inject';

require('colors');


const reactCodePath = path.resolve(__dirname, '../src/tpl.js');
const reactCode = fse.readFileSync(reactCodePath, 'utf-8');

export default ({
    uiLib,
    template = '',
    script = '',
    componentTags = [],
}) => {
    // 返回整合好后的js代码
    const composeRes = {
        ahead: [], // 顶部插入
        renderVars: [], // render函数内部变量
        renderReactElements: ``, // React.createElement()代码
    };

    const getLibRes = composeComponentImportCode(componentTags, uiLib);
    const componentImportCode = getLibRes.uiLibImports.join('');

    [].push.apply(composeRes.ahead, [
        `import React, {Component} from 'react';
         import reactMixin from 'react-mixin';
        `,
        componentImportCode,
        script
    ]);

    composeRes.renderVars.push(`
        const {
            $setState,
            $getRef,
            $refresh,
            $getProps,
        } = this._innerMethods;
    `);

    composeRes.renderReactElements = lesxJsx(template);

    let jsCode = reactCode;

    // 顶部插入import代码
    try {
        jsCode = insertImportCode(jsCode, composeRes.ahead);
    } catch (e) {
        console.log(`[Warning] 顶部插入代码报错：${e}`.red);
    }

    // 插入render方法
    try {
        jsCode = insertCodeToScript(jsCode, [{
            name: 'render', // 方法名
            body: `
                ${composeRes.renderVars.join('')}

                const {
                    ${getLibRes.notInLibtags.join(',')}
                } = this.props.components || {};

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
