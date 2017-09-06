'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isComponentTag = isComponentTag;
exports.composeComponentImportCode = composeComponentImportCode;
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