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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const specTags = ['style', 'template', 'script'];
const needRaw = ['template']; // 这里只能再单独切出raw string

exports.default = code => {
    /** 将DSL拆解为style、template、script三部分 start */
    const ast = (0, (_lesxParser || _load_lesxParser()).acornParse)(code, {
        specTags
    });

    const resCollection = {}; // 收集特殊标签对应的Node节点
    const resContent = {}; // 收集特殊标签内部的内容，方便后面处理


    (0, (_lesxAstWalk || _load_lesxAstWalk()).default)(ast, {
        LesxElement(node) {
            const tagName = node.openingElement.name.name;

            if (specTags.includes(tagName)) {
                resCollection[tagName] = node;

                if (needRaw.includes(tagName)) {
                    resContent[tagName] = code.slice(node.start - 6, node.end);
                } else {
                    resContent[tagName] = node.children[0].value;
                }
            }
        }
    });

    /** 将DSL拆解为style、template、script三部分 end */
};

module.exports = exports['default'];