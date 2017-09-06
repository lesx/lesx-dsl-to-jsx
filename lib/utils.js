'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isComponentTag = isComponentTag;
exports.composeComponentImportCode = composeComponentImportCode;

var _lodash;

function _load_lodash() {
    return _lodash = _interopRequireDefault(require('lodash.difference'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isComponentTag(tag) {
    return (/^[A-Z].+/.test(tag)
    );
}

// TODO: 哪些组件需要从antd里获取，哪些不需要需要实现
function composeComponentImportCode(componentTags, uiLib) {
    // 需要排除jsx-control-statements的控制流管理标签
    componentTags = (0, (_lodash || _load_lodash()).default)(componentTags, ['If', 'Choose', 'When', 'Otherwise', 'For', 'With']);

    return Array.isArray(componentTags) && componentTags.length ? `
        import {
            ${componentTags.join(', ')}
        } from '${uiLib}';
    ` : '';
}