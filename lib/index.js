'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _cheeriox;

function _load_cheeriox() {
    return _cheeriox = _interopRequireDefault(require('cheeriox'));
}

var _utils;

function _load_utils() {
    return _utils = require('./utils');
}

var _composeJsCode;

function _load_composeJsCode() {
    return _composeJsCode = _interopRequireDefault(require('./compose-js-code'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const specTags = ['style', 'template', 'script'];
const needRaw = ['template']; // 这里只能再单独切出raw string

exports.default = (code, uiLib) => {
    /** 将DSL拆解为style、template、script三部分 start */

    const resContent = {}; // 收集特殊标签内部的内容，方便后面处理
    let componentTags = []; // 在这里做收集，保证AST只遍历一次

    const $ = (_cheeriox || _load_cheeriox()).default.load(code, {
        decodeEntities: false,
        xmlMode: true
    });

    const styleEl = $('style');
    const templateEl = $('template');
    const scriptEl = $('script');

    resContent['style'] = {
        lang: styleEl.attr('lang') || 'sass',
        content: styleEl.html()
    };

    resContent['template'] = templateEl.html();
    resContent['script'] = scriptEl.html();

    if (templateEl.length) {
        componentTags = getComponentTag(templateEl[0]);
    }

    // console.log('resContent:', resContent);
    // console.log('componentTags:', componentTags);

    /** 将DSL拆解为style、template、script三部分 end */

    /** 最后生成js/style代码 */
    const lastRes = {
        style: resContent.style, // style部分
        js: {
            lang: 'js',
            content: (0, (_composeJsCode || _load_composeJsCode()).default)({
                template: resContent.template,
                script: resContent.script,
                componentTags,
                uiLib
            })
        } // 组装js
    };

    // console.log('lastRes:', lastRes);

    return lastRes;
};

function getComponentTag(el) {
    let res = [];

    if (el.children && el.children.length) {
        el.children.forEach(child => {
            if (child.name && (0, (_utils || _load_utils()).isComponentTag)(child.name)) {
                res.push(child.name);
            }

            if (child.children && child.children.length) {
                res = res.concat(getComponentTag(child));
            }
        });
    }

    return res;
}
module.exports = exports['default'];