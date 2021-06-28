import SpReact from "./SpReact"
import App from './App'

// function fn(){
//     console.log('click')
// }
// function fn1(){
//     console.log('click')
// }
// // function App(){
// //     return (<div>123</div>)
// // }
// const container = document.getElementById('container')

// const jsx = (<div className="aa"><h1 id="title">VirtualDOM</h1><div>创建VirtualDOM</div><p>123</p></div>)
// const jsx1 = (<div><h1 id="title">VirtualDOM123</h1><div>修改了VirtualDOM</div></div>)
// SpReact.render(jsx, container)
// setTimeout(() => {
//     SpReact.render(jsx1, container)
// },1000)
// console.log(jsx)

SpReact.render(<App title="App"/>, container)
// setTimeout(() => {
//     SpReact.render(<App title="App1"/>, container)
// },1000)
