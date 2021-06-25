import SpReact from "./SpReact"

export default class App extends SpReact.Component{
    // constructor(props){
    //     super(props)
    //     console.log(this.props)
    // }
    render() {
        return (<h1>{this.props.title}</h1>)
    }
}