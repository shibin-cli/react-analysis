import diff from "./diff"
export default class Component {
    constructor(props) {
        this.props = props
    }
    setState(state) {
        this.state = {
            ...this.state,
            ...state
        }
        const virtualDOM = this.render()
        const oldDOM = this.getDOM()
        virtualDOM.component = this
        diff(virtualDOM, oldDOM.parentNode, oldDOM)
    }
    setDOM(dom) {
        this.__DOM = dom
    }
    getDOM() {
        return this.__DOM
    }
    updateProps(props) {
        this.props = props
    }
    render() {

    }
    componentWillReceiveProps(nextProps) {

    }
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps !== this.props || nextState !== this.state
    }
    componentWillMount() {

    }
    componentDidMount() {

    }
    componentWillUpdate() {

    }
    componentDidUpdate() {

    }
    componentWillUnMount() {

    }
}