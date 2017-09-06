const trans = require('./');

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

            <Button>按钮</Button>
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

const res = trans(code);
