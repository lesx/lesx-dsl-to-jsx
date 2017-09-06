import {
    acornParse,
} from 'lesx-parser';

import walk, {
    base
} from 'lesx-ast-walk';

const specTags = ['style', 'template', 'script'];
const needRaw = ['template']; // 这里只能再单独切出raw string

export default code => {
    /** 将DSL拆解为style、template、script三部分 start */
    const ast = acornParse(code, {
        specTags,
    });

    const resCollection = {}; // 收集特殊标签对应的Node节点
    const resContent = {}; // 收集特殊标签内部的内容，方便后面处理


    walk(ast, {
        LesxElement(node) {
            const tagName = node.openingElement.name.name;

            if (specTags.includes(tagName)) {
                resCollection[tagName] = node;

                if (needRaw.includes(tagName)) {
                    resContent[tagName] = code.slice(node.start - 6, node.end);
                } else {
                    resContent[tagName] = node.children[0].value;
                }
            }
        }
    });

    /** 将DSL拆解为style、template、script三部分 end */


};
