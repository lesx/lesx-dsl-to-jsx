'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isComponentTag = isComponentTag;
exports.composeComponentImportCode = composeComponentImportCode;
exports.trim = trim;
function isComponentTag(tag) {
    return (/^[A-Z].+/.test(tag)
    );
}

function composeComponentImportCode(componentTags, uiLib) {
    return Array.isArray(componentTags) && componentTags.length ? `
        import {
            ${componentTags.join(', ')}
        } from '${uiLib}';
    ` : '';
}

function trim(str = '') {
    return typeof str === 'string' ? str.replace(/^(\s|\r|\n|\r\n)+|(\s|\r|\n|\r\n)+$/, '') : str;
}