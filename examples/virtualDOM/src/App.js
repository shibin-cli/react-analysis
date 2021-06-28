import SpReact from "./SpReact"
class  Alert extends SpReact.Component{
    render(){
        console.log(this.props)
        return <h1>Alert</h1>
    }
}
export default class App extends SpReact.Component{
    constructor(props) {
        super(props)
        this.state = {
            text: 'Hello',
            a: 1
        }
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.setState({
            text: 'Hello，123',
            a: 2
        })
        console.log(this.alert)
    }
    componentDidMount(){
        console.log('componentDidMount')
    }
    componentDidUpdate(){
        console.log('componentDidUpdate')
    }

    render() {
        return (<div>
            <h1 ref={title => this.title = title}>{this.props.title}</h1>           
            <button onClick={this.handleClick}>click</button>
            <Alert ref={alert => this.alert = alert}/>
            </div>)
    }
}