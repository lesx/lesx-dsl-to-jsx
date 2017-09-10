import {
    acornParse,
} from 'lesx-parser';

import walk, {
    base
} from 'lesx-ast-walk';

import cheerio from 'cheeriox';

import {
    isComponentTag,
} from './utils';

import composeJsCode from './compose-js-code';

const specTags = ['style', 'template', 'script'];
const needRaw = ['template']; // 这里只能再单独切出raw string

export default (code, uiLib) => {
    /** 将DSL拆解为style、template、script三部分 start */
    // const ast = acornParse(code, {
    //     specTags,
    // });

    const resContent = {}; // 收集特殊标签内部的内容，方便后面处理
    const componentTags = []; // 在这里做收集，保证AST只遍历一次


    /**walk(ast, {
        LesxElement(node) {
            const tagName = node.openingElement.name.name;
            const children = node.children;

            if (specTags.includes(tagName)) {
                if(tagName === 'style') {
                    console.log('node:', node);    
                }

                if (needRaw.includes(tagName)) {
                    resContent[tagName] = code.slice(Math.max(0, children[0].start - 6), Math.max(0, children[children.length -1].end - 6));
                } else {
                    resContent[tagName] = children[0].value;
                }
            }

            if(isComponentTag(tagName)) {
                componentTags.push(tagName);
            }
        }
    });*/

    const $ = cheerio.load(code, {
        decodeEntities: false,
    });

    const styleEl = $('style');
    const templateEl = $('template');
    const scriptEl = $('script');

    resContent['style'] = {
        content: styleEl.html(),
        lang: styleEl.attr('lang') || 'sass'
    };

    resContent['template'] = templateEl.html();
    resContent['script'] = scriptEl.html();


    // console.log('resContent:', resContent);
    // console.log('componentTags:', componentTags);

    /** 将DSL拆解为style、template、script三部分 end */

    /** 最后生成js/style代码 */
    const lastRes = {
        style: resContent.style, // style部分
        js: composeJsCode({
            template: resContent.template,
            script: resContent.script,
            componentTags,
            uiLib,
        }), // 组装js
    };

    // console.log('lastRes:', lastRes);

    return lastRes;
};
