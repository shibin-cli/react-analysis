import SpReact from "./SpReact"
// class  Alert extends SpReact.Component{
//     render(){
//         console.log(this.props)
//         return <h1>Alert</h1>
//     }
// }
// export default class App extends SpReact.Component{
//     constructor(props) {
//         super(props)
//         this.state = {
//             text: 'Hello',
//             a: 1
//         }
//         this.handleClick = this.handleClick.bind(this)
//     }

//     handleClick() {
//         this.setState({
//             text: 'Hello，123',
//             a: 2
//         })
//         console.log(this.alert)
//     }
//     componentDidMount(){
//         console.log('componentDidMount')
//     }
//     componentDidUpdate(){
//         console.log('componentDidUpdate')
//     }

//     render() {
//         return (<div>
//             <h1 ref={title => this.title = title}>{this.props.title}</h1>           
//             <button onClick={this.handleClick}>click</button>
//             <Alert ref={alert => this.alert = alert}/>
//             </div>)
//     }
// }
export default class App extends SpReact.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [{
                id: 0,
                name: '张三'
            }, {
                id: 1,
                name: '李四'
            }, {
                id: 2,
                name: '王五'
            }]
        }
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        const data = JSON.parse(JSON.stringify(this.state.data))
        data.push(data.shift())
        console.log(data)
        this.setState({
            data
        })
    }
    render() {
        return (
            <div>
                <ul>
                    {
                        this.state.data.map(item => (
                            <li >{item.name}{item.id}</li>
                        ))
                    }

                </ul>
                <button onClick={this.handleClick}>按钮</button>
            </div>

        )
    }
}