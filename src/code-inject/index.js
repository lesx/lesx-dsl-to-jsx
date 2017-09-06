const traverse = require('babel-traverse').default;
const generator = require('babel-generator').default;
const Types = require('babel-types');
const babel = require('babel-core');
const colors = require('colors');
const logSymbols = require('log-symbols');
const util = require('./util');

/**
 *  批量插入ClassMethod、在组件顶部插入引用代码
 */
export function insertCodeToScript(originCode, insert) {
    const ast = util.parse2AST(originCode);
    traverse(ast, {
        ClassBody(path) {
            if (!Array.isArray(insert)) {
                throw TypeError('插入字段类型必须为数组');
            }
            for (let key in insert) {
                const methodObj = insert[key],
                    name = methodObj.name,
                    argv = methodObj.argv,
                    body = methodObj.body,
                    isCover = methodObj.isCover;

                if (typeof name !== 'string') {
                    throw TypeError('方法名必须为字符串');
                }

                const newAst = util.getTemplateAst(body, {
                    sourceType: "script"
                });

                const isExist = util.overideSameMethod(name, path, isCover);
                if (isExist && !isCover) {
                    console.log(logSymbols.warning, ('方法' + name + '()已经存在，如果要强制覆盖，请设置参数isCover: true').yellow);
                    continue;
                }
                const params = util.checkParams(argv, newAst);
                const property = Types.ClassMethod('method', Types.identifier(name), params, Types.BlockStatement(newAst));
                path.node.body.push(property);
            }
        }
    });

    return generator(ast).code;
}

/**
 *  向js文件顶部插入组件引入代码
 */
export function insertImportCode(originCode, importsCode) {
    if(Array.isArray(importsCode)) {
        importsCode = importsCode.join('');
    }

    const ast = util.parse2AST(originCode);
    traverse(ast, {
        Program: {
            exit: function(path) {
                if (importsCode) {
                    const importAst = util.getTemplateAst(importsCode, {
                        sourceType: 'module'
                    });
                    path.unshiftContainer('body', importAst)
                }
            }
        }
    });

    return generator(ast).code;
}

/**
 *  向方法里面插入代码
 */
export function insertCodeToMethod(originCode, injectCode) {
    const ast = util.parse2AST(originCode);
    traverse(ast, {
        ClassMethod(path) {
            if (!Array.isArray(injectCode)) {
                throw TypeError('插入字段类型必须为数组');
            }
            const methodName = path.get('body').container.key.name;
            for (let key in injectCode) {
                const inject = injectCode[key],
                    name = inject.name,
                    code = inject.code,
                    pos = inject.pos;

                const newAst = util.getTemplateAst(code, {
                    sourceType: "script"
                });
                if (methodName === name) {
                    if (pos === 'prev') {
                        Array.prototype.unshift.apply(path.node.body.body, newAst);
                    } else {
                        Array.prototype.push.apply(path.node.body.body, newAst);
                    }
                }
            }
        }
    });

    return generator(ast).code;
}
