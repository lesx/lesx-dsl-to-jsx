const {
    babylon,
} = require('lesx-parser');
const Traverse = require('babel-traverse').default;
const generator = require('babel-generator').default;
const Types = require('babel-types');
const babel = require('babel-core');
const colors = require('colors');
const logSymbols = require('log-symbols');

/**
 *  检测传入参数是否已在插入代码中定义
 */
exports.checkParams = function(argv, newAst) {
    let params = [];
    const vals = getAstVals(newAst);
    if (argv && argv.length !== 0) {
        for (let i = 0; i < argv.length; i++) {
            if (vals.indexOf(argv[i]) === -1) {
                params.push(Types.identifier(argv[i]));
            } else {
                throw TypeError('参数名' + argv[i] + '已在插入代码中定义，请更名');
            }
        }
    }
    return params;
}

/**
 *  获取AST中所有的VariableDeclarator变量名
 */
function getAstVals(ast) {
    let vals = [];
    for (let i = 0; i < ast.length; i++) {
        if (ast[i].type === 'VariableDeclaration') {
            const declars = ast[i].declarations;
            for (let j = 0; j < declars.length; j++) {
                vals.push(declars[j].id.name);
            }
        }
    }
    return vals;
}

/**
 *  检测要插入的方法名，是否跟已存在的ClassMethod重名，如果重名则进行覆盖，反之直接插入
 */
exports.overideSameMethod = function(name, path, isCover) {
    let isExist = false;
    path.get('body').forEach(path => {
        const node = path.node;
        if (node.type === 'ClassMethod' && node.key.name === name) {
            isExist = true;
            if (isCover) {
                path.remove();
                console.log(logSymbols.warning, ('方法' + name + '()已经被新插入的' + name + '()方法覆盖').yellow);
            }
        }
    })
    return isExist;
}

/**
 *  code转化成对应的抽象语法树（AST）
 */
exports.parse2AST = function(content) {
    return babylon.parse(content, {
        sourceType: 'module',
        plugins: [
            'asyncFunctions',
            'classConstructorCall',
            'jsx',
            'flow',
            'trailingFunctionCommas',
            'doExpressions',
            'objectRestSpread',
            'decorators',
            'classProperties',
            'exportExtensions',
            'exponentiationOperator',
            'asyncGenerators',
            'functionBind',
            'functionSent'
        ]
    });
}

exports.getTemplateAst = function(tpl, opts = {}) {
    let ast = babel.template(tpl, opts)({});
    if (!Array.isArray(ast)) {
        let arrAst = [];
        arrAst.push(ast);
        return arrAst;
    } else {
        return ast;
    }
}
