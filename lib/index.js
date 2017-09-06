'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lesxParser;

function _load_lesxParser() {
    return _lesxParser = require('lesx-parser');
}

var _lesxAstWalk;

function _load_lesxAstWalk() {
    return _lesxAstWalk = _interopRequireDefault(require('lesx-ast-walk'));
}

var _lesxAstWalk2;

function _load_lesxAstWalk2() {
    return _lesxAstWalk2 = require('lesx-ast-walk');
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
    const ast = (0, (_lesxParser || _load_lesxParser()).acornParse)(code, {
        specTags
    });

    const resCollection = {}; // 收集特殊标签对应的Node节点
    const resContent = {}; // 收集特殊标签内部的内容，方便后面处理
    const componentTags = []; // 在这里做收集，保证AST只遍历一次


    (0, (_lesxAstWalk || _load_lesxAstWalk()).default)(ast, {
        LesxElement(node) {
            const tagName = node.openingElement.name.name;
            const children = node.children;

            if (specTags.includes(tagName)) {
                resCollection[tagName] = node;

                if (needRaw.includes(tagName)) {
                    resContent[tagName] = code.slice(Math.max(0, children[0].start - 6), Math.max(0, children[children.length - 1].end - 6));
                } else {
                    resContent[tagName] = children[0].value;
                }
            }

            if ((0, (_utils || _load_utils()).isComponentTag)(tagName)) {
                componentTags.push(tagName);
            }
        }
    });

    // console.log('resContent:', resContent);
    // console.log('componentTags:', componentTags);

    /** 将DSL拆解为style、template、script三部分 end */

    /** 最后生成js/style代码 */
    const lastRes = {
        style: resContent.style,
        js: (0, (_composeJsCode || _load_composeJsCode()).default)({
            template: resContent.template,
            script: resContent.script,
            componentTags,
            uiLib
        }) // 组装js
    };

    // console.log('lastRes:', lastRes);

    return lastRes;
};

module.exports = exports['default'];