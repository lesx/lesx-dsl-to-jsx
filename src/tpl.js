function noop() {}

// 提供一些DSL辅助性变量
const getInnerScope = lesx => ({
    $setState: (a, b, c = noop) => {
        if (typeof(a) === 'object') {
            lesx.setState(a, b);
        } else {
            lesx.setState(a, b, c);
        }
    },
    $getRef: name => lesx.refs[name],
    $refresh: opts => lesx.loadAsync(opts),
    $getProps: name => {
        return lesx[name];
    },
});

function autobind(methodNames) {
    return {
        componentWillMount() {
            methodNames.forEach(name => {
                if (typeof(this[name]) === 'function') {
                    this[name] = this[name].bind(this, {
                        setState: this._innerMethods.$setState,
                        getRef: this._innerMethods.$getRef,
                        refresh: this._innerMethods.$refresh,
                        getProps: this._innerMethods.$getProps,
                    });
                }
            });
        }
    };
}

@reactMixin.decorate(module.exports)
@reactMixin.decorate(autobind(Object.keys(module.exports)))
class Lesx extends Component {
    constructor(props, context) {
        super(props, context);

        // 内部方法放在私有变量中
        this._innerMethods = getInnerScope(this);

        // 外面注册进来的scope也放到state里面
        this.state = Object.assign({}, props.scope);
    }

    componentDidMount() {}
}

module.exports = Lesx;
