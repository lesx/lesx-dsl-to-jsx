import difference from 'lodash.difference';

export function isComponentTag(tag) {
    return /^[A-Z].+/.test(tag);
}

// TODO: 哪些组件需要从antd里获取，哪些不需要需要实现
export function composeComponentImportCode(componentTags, uiLib) {
    // 需要排除jsx-control-statements的控制流管理标签
    componentTags = difference(componentTags, ['If', 'Choose', 'When', 'Otherwise', 'For', 'With']);

    return Array.isArray(componentTags) && componentTags.length ? `
        import {
            ${componentTags.join(', ')}
        } from '${uiLib}';
    ` : '';
}
