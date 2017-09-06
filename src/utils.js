export function isComponentTag(tag) {
    return /^[A-Z].+/.test(tag);
}

export function composeComponentImportCode(componentTags, uiLib) {
    return Array.isArray(componentTags) && componentTags.length ? `
        import {
            ${componentTags.join(', ')}
        } from '${uiLib}';
    ` : '';
}

export function trim(str = '') {
    return typeof(str) === 'string' 
    ? str.replace(/^(\s|\r|\n|\r\n)+|(\s|\r|\n|\r\n)+$/, '')
    : str;
}
