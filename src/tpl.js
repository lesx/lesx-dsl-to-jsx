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

const curModule = module.exports;

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
                } else if (!['state', 'props'].includes(name)) {
                    this[name] = curModule[name];
                }
            });
        }
    };
}


@reactMixin.decorate(curModule)
@reactMixin.decorate(autobind(Object.keys(curModule)))
class Lesx extends Component {
    constructor(props, context) {
        super(props, context);

        // 内部方法放在私有变量中
        this._innerMethods = getInnerScope(this);

        // 外面注册进来的scope也放到state里面
        this.state = Object.assign({}, curModule.state, props.scope);

        typeof(curModule.init) === 'function' && curModule.init.apply(this, [this.state, this.props]);
    }

    componentDidMount() {}
}

const mixin = {
    getDefaultProps() {
        return curModule.props || {};
    }
};

reactMixin.onClass(Lesx, mixin);

module.exports = Lesx;
