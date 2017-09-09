# lesx-dsl-to-jsx

lesx DSL编译成JSX。


## Use

```js
const trans = require('lesx-dsl-to-jsx');

const code = `
    <style>
        a {
            color: #999;
        }
    </style>

    <template>
        <div>
            <a onClick={() => {
                alert(1);
            }}></a>

            <Button>an antd button</Button>
        </div>
    </template>

    <script>
        module.exports = {
            props: {},

            state: {},

            // React其他生命周期钩子函数
        };
    </script>
`;

const res = trans(code, {
	libName: 'antd',
	libDirectory: 'lib',
}); // print a react component code
```

具体见：`demo.js`，可以通过`node demo.js`来查看实际效果。