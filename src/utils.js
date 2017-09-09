const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;
const intersection = require('lodash.intersection');
const difference = require('lodash.difference');

export function isComponentTag(tag) {
    return /^[A-Z].+/.test(tag);
}

// 哪些组件需要从antd里获取，哪些是通过props传递进来的
export function composeComponentImportCode(componentTags = [], uiLib) {
    // 需要排除jsx-control-statements的控制流管理标签
    componentTags = difference(componentTags, ['If', 'Choose', 'When', 'Otherwise', 'For', 'With']);

    const uiLibTags = getUiLibComponentsTags(uiLib);

    const libComponentTags = intersection(componentTags, uiLibTags);

    let res = {
        uiLibImports: [],
        notInLibtags: difference(componentTags, uiLibTags),
    };

    if (Array.isArray(libComponentTags) && libComponentTags.length) {
        res.uiLibImports.push(`
            import {
                ${libComponentTags.join(', ')}
            } from '${uiLib.libName}';
        `);
    }

    return res;
}

// 获取项目的根路径
function normalize() {
    let projectPath;

    try {
        projectPath = execSync('git rev-parse --show-toplevel').toString().trim().replace(/\\n/g);

        if (process.platform === 'win32' || process.platform === 'win64') {
            projectPath = projectPath.replace(/\\/g, '/').replace(/^([A-Z]+:)(\/[^\/]+)/, '$1');
        }
    } catch (e) {
        projectPath = path.join(__dirname, '../../..');
    }

    return projectPath;
}

const projectPath = normalize();

function getUiLibComponentsTags({
    libName,
    libDirectory
}) {
    const libPath = path.resolve(projectPath, 'node_modules', `${libName}/${libDirectory}`);

    // console.log('libPath:', libPath);

    let dir = [];

    if (fs.existsSync(libPath)) {
        dir = fs.readdirSync(libPath).filter(item => !item.startsWith('_')).map(item => (item.charAt(0).toUpperCase() + item.slice(1)));
    }

    return dir;
}
