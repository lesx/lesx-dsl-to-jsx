export function isComponentTag(tag) {
    return /^[A-Z].+/.test(tag);
}

export function composeComponentImportCode(componentTags, uiLib) {
    return `
        import {
            ${componentTags.join(', ')}
        } from '${uiLib}';
    `;
}
