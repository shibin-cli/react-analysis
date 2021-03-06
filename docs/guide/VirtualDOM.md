# VirtualDOM
## VirtualDOM是什么
Virtual DOM 对象就是DOM对象的JavaScript表现形式，就是使用JavaScript对象来描述DOM对象信息
```jsx
<div className="app">
  <h1>Hello</h1>
  <p>Hello,world</p>
</div>
```
上面代码转化为jsx代码
```js
{
    type: 'div',
    props: {
        className: 'app'
    },
    children: [{
        type: 'h1',
        props: null,
        children: [{
            type: 'text',
            props: {
                textContent: 'Hello'
            }
        },
        {
        type: 'p',
        props: null,
        children: [{
            type: 'text',
            props: {
                textContent: 'Hello,world'
            }
        }]
    }]
}
```
## 环境搭建
``` bash
npm init -y
# 安装依赖 webpack相关 和 babel
npm i -D webpack webpack-dev-server webpack-cli @babel/core @babel/preset-env @babel/preset-react babel-loader html-webpack-plugin
```
配置webpack
```js
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/**@type {import ('webpack').Configuration} */
module.exports = {
    mode: 'development',
    entry: './src/main.js',
    output: {
        filename: 'main.bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.js(x?)$/,
            loader: 'babel-loader'
        }]
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 8080,
        hot: true,
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Simple react',
            template: './public/index.html'
        }),
        new webpack.HotModuleReplacementPlugin({})
    ]
}
```
创建webpack入口文件`src/main.js`、`public/index.html`

配置babel，其中```pragma```是编译 JSX 表达式时替用于换所使用的函数，默认是`React.createElement`，这个我们可以查看 [https://www.babeljs.cn/docs/babel-preset-react](https://www.babeljs.cn/docs/babel-preset-react)

```js
{
    "presets": [
        "@babel/preset-env",
        ["@babel/preset-react", {
            "pragma": "SpReact.createElement"
        }]
    ]
}
```
这里我们只需要把它配置成我们想要的函数名即可

这样开发环境就搭建完毕
## 创建VirtualDOM对象
创建`SpReact/index.js`、`SpReact/createElement.js`

`SpReact/index.js`用来导出所有`SpReact`上的所有方法
```js
import createElement from './createElement'

export default {
    createElement
}
```
`SpReact.createElement`用来创建VirtualDOM对象，之前我已经将编译 JSX 表达式换成了这个
```js
export default function createElement(type, props, ...children) {
    return {
        type,
        props,
        children
    }
}
```
就这个，一个简单的VirtualDOM对象就创建完成了，后续会逐渐完善这个方法

在`main.js`中打印下转换过后的VirtualDOM对象
```js 
import SpReact from "./SpReact"

const jsx = (<div><h1>VirtualDOM</h1><div>创建VirtualDOM</div></div>)

console.log(jsx)
```
转换过后的jsx
```js
{
    "type": "div",
    "props": null,
    "children": [{
        "type": "h1",
        "props": null,
        "children": ["VirtualDOM"]
    }, {
        "type": "div",
        "props": null,
        "children": ["创建VirtualDOM"]
    }]
}
```
我们需要在完善一下
* 文本节点为对应的virtualDOM转换成对象
* 布尔值和null在页面上不显示
* props中可以访问到children
```js
export default function createElement(type, props, ...children) {
    const newChildren = children.reduce((res, child) => {
        if (typeof child === 'string') {
            res.push(createElement('text', {
                textContent: child
            }))
        } else if (typeof child !== 'boolean' && child !== null) {
            res.push(child)
        }
        return res
    }, [])
    return {
        type,
        props:{
            ...props,
            children: newChildren
        },
        children: newChildren
    }
}
```
## VirtualDOM对象转化为真实DOM对象
创建`render`方法，我们会调用`SpReact.render`方法将`VirtualDOM`渲染到页面上
```js
import diff from "./diff";

export default function render(VirtualDOM, container, oldDOM = container.lastChild) {
    diff(VirtualDOM, container, oldDOM)
}
```
```js
export default function diff(virtualDOM, container, oldDOM) {
    if (!oldDOM) {
        mountElement(virtualDOM, container)
    }
}
```
```js
// 创建的DOM节点，将创建的DOM节点添加到页面上
function mountElement(virtualDOM, container) {
    // 创建当前virtualDOM的DOM节点，遍历创建子元素,调用mountElement
    const dom = createDOM(virtualDOM)
    // 将创建的DOM节点添加到页面上
    container.appendChild(dom)
}

// 创建当前virtualDOM的DOM节点， 遍历创建子元素的DOM节点
function createDOM(virtualDOM) {
    const type = virtualDOM.type
    let el
    if (type === 'text') {
        el = document.createTextNode(virtualDOM.props.textContent)
    } else {
        el = document.createElement(type)
    }
    virtualDOM.children.forEach(child => {
        mountElement(child, el)
    })
    return el
}
```
## 给DOM元素添加属性
```js
const jsx = (<div className="aa"><h1 id="title" onClick={fn}>VirtualDOM</h1><div>创建VirtualDOM</div></div>)
```
我们需要为元素节点添加事件

```js
function createDOM(virtualDOM) {
    const type = virtualDOM.type
    let el
    if (type === 'text') {
        el = document.createTextNode(virtualDOM.props.textContent)
    } else {
        el = document.createElement(type)
        // 绑定事件
        updateNodeElement(el,virtualDOM)
    }
    virtualDOM.children.forEach(child => {
        mountElement(child, el)
    })
    return el
}
```
把props上的属性（除了children）添加到DOM上
```js
export default function updateNodeElement(el, virtualDOM) {
    const props = virtualDOM.props
    Object.keys(virtualDOM.props).forEach(propName => {
        const val = props[propName]
        if (propName.startsWith('on')) {
            const eventName = propName.slice(2).toLowerCase()
            el.addEventListener(eventName, val)
        } else if (propName === 'className') {
            el.setAttribute('class', val)
        } else if (propName !== 'children') {
            el.setAttribute(propName, val)
        }
    })
}
```
## 组件
区分函数组件和类组件
```js
// 区分是否是组件
export function isComponent(virtualDOM){
    return virtualDOM&& typeof virtualDOM.type === 'function'
}
// 判断是否是函数组件
export function isFunctionComponent(virtualDOM){
    // (virtualDOM.prototype &&  virtualDOM.prototype.render)表示是类组件,
    // 因为类组件下有render方法，即使没有定义，也会从父类中（Component）继承
    return isComponent(virtualDOM)&& !(virtualDOM.type.prototype &&  virtualDOM.type.prototype.render)
}
```
首先对之前的代码进行改造
* 判断是否为组件，不是组件就调用`mounNativeElement`
* 是组件就调用`mountComponent`
  * 判断是否是函数组件
  * 函数组件调用 `buildFunctionComponent`
  * 类组件调用 `buildClassComponent`
  * 最后，将返回的虚拟DOM调用`mountElement`
    * 这里没有直接调用`mounNativeElement`是因为组件可能会返回一个组件
```js
function mountElement(virtualDOM, container) {
    if (isComponent(virtualDOM)) {
        mountComponent(virtualDOM, container)
    } else {
        mounNativeElement(virtualDOM, container)
    }
}

function mounNativeElement(virtualDOM, container) {
    const dom = createDOM(virtualDOM)
    container.appendChild(dom)
}

function mountComponent(virtualDOM, container) {
    let newVirtualDOM
    if (isFunctionComponent) {
        newVirtualDOM = buildFunctionComponent(virtualDOM)
    } else {
        newVirtualDOM = buildClassComponent(virtualDOM)
    }
    mountElement(newVirtualDOM, container)
}

```
### 处理函数组件
函数组件处理非常简单，只需要调用函数组件，将函数组件返回的virtualDOM返回即可
```js
function buildFunctionComponent(virtualDOM) {
    return virtualDOM.type(virtualDOM.props || {})
}
```
```js
function App(){
    return (<div>123</div>)
}

SpReact.render(<App/>, document.getElementById('container'))
```
### 处理类组件
首先需要定义类组件的父类
```js
export default class Component {
    constructor(props){
        this.props = props
    }
    render() {

    }
}
```
返回组件render函数的VirtualDOM
```js
function buildClassComponent(virtualDOM) {
    const component = new virtualDOM.type(virtualDOM.props)
    const newVirtualDOM = component.render()
    return newVirtualDOM
}
```
```js
import SpReact from "./SpReact"

export default class App extends SpReact.Component{
    render() {
        return (<h1>{this.props.title}</h1>)
    }
}
```

## 更新
```js
const jsx = (<div className="aa"><h1 id="title">VirtualDOM</h1><div>创建VirtualDOM</div></div>)
const jsx1 = (<div className="aa"><h1 id="title">VirtualDOM123</h1><div>创建VirtualDOM123</div></div>)

SpReact.render(jsx, container)
setTimeout(() => {
    SpReact.render(jsx1, container)
},1000)
```
### VitrualDOM对象比对
```js
export default function diff(virtualDOM, container, oldDOM) {
    if (!oldDOM) {
        mountElement(virtualDOM, container)
    } else {
        // VirtualDOM对象比对
    }
}
```
比对时，我们需要拿到新旧的VirtualDOM对象进行比较，所以在创建DOM对象时，需要保存下VirtualDOM对象保存下来。

这里把VirtualDOM对象保存在DOM上
```js {13}
function createDOM(virtualDOM) {
    const type = virtualDOM.type
    let el
    if (type === 'text') {
        el = document.createTextNode(virtualDOM.props.textContent)
    } else {
        el = document.createElement(type)
        updateNodeElement(el, virtualDOM)
    }
    virtualDOM.children.forEach(child => {
        mountElement(child, el)
    })
    el.__virtualDOM = virtualDOM
    return el
}
```
### 节点类型相同
接下来,处理节点类型（type）相同时
* 当前节点不需要更新，需要更新节点的属性事件
* 节点相同时，需要对比子节点
* 节点多余时需要删除多余的节点

```js {5-27}
export default function diff(virtualDOM, container, oldDOM) {
    if (!oldDOM) {
        mountElement(virtualDOM, container)
    } else {
        const oldVirtualDOM = oldDOM.__virtualDOM

        // type相同时，说明当前节点不需要更新 
        if (oldVirtualDOM.type === virtualDOM.type) {
            // 更新文本
            if (virtualDOM.type === 'text') {
                updateNodeText(virtualDOM, oldVirtualDOM, oldDOM)
            } else {
                // 更新节点上的事件和属性
                updateNodeElement(oldDOM, virtualDOM)
            }
            // 节点进行比对
            const oldChildNodes = oldDOM.childNodes
            virtualDOM.children.forEach((child, index) => {
                diff(child, oldDOM, oldChildNodes[index])
            })
            // 当节点多余时，需要删除多余的节点
            if (oldChildNodes.length > virtualDOM.children.length) {
                for (let i = oldChildNodes.length - 1, len = virtualDOM.children.length; i > len - 1; i--) {
                    unmountElement(oldChildNodes[i])
                }
            }
        }
    }
}
```
```js
// 更新文本节点
export function updateNodeText(virtualDOM, oldVirtualDOM, oldDOM) {
    if (virtualDOM.props.textContent !== oldVirtualDOM.props.textContent) {
        oldDOM.textContent = virtualDOM.props.textContent
        oldDOM.__virtualDOM = virtualDOM
    }
}
// 删除节点
export function unmountElement(el) {
    el.remove()
}
```
更新元素上的事件，对原来的`updateNodeElement`方法进行完善
```js
export function updateNodeElement(el, virtualDOM, oldVirtualDOM) {
    const props = virtualDOM.props || {}
    const oldProps = oldVirtualDOM && oldVirtualDOM.props || {}
    Object.keys(virtualDOM.props).forEach(propName => {
        const val = props[propName]
        const oldVal = oldProps[propName]
        if (val === oldVal) {
            return
        }
        if (propName.startsWith('on')) {
            const eventName = propName.slice(2).toLowerCase()
            el.addEventListener(eventName, val)
            if (oldVal) {
                el.removeEventListener(eventName, oldVal)
            }
        } else if (propName === 'className') {
            el.setAttribute('class', val)
        } else if (propName !== 'children') {
            el.setAttribute(propName, val)
        }
    })

    // 删除旧VirtualDOM对象中存在，而新VirtualDOM对象中不存在的属性
    // 即删除DOM中多余的事件和属性
    Object.keys(oldProps).forEach(oldPropName => {
        const oldVal = oldProps[oldPropName]
        const val = props[oldPropName]
        if (!val) {
            if (oldPropName.startsWith('on')) {
                const oldEventName = oldPropName.slice(2).toLowerCase()
                el.removeEventListener(oldEventName, oldVal)
            } else if (oldPropName === 'className') {
                el.removeAttribute('class', oldVal)
            } else if(propName !== 'children') {
                el.removeAttribute(oldPropName, oldVal)
            }
        }
    })
}
```
### 节点类型不相同
节点类型不相同并且不是组件，直接创建新的`VirtualDOM`所对应的DOM并替换掉原来的DOM元素
```js {13-16}
export default function diff(virtualDOM, container, oldDOM) {
    if (!oldDOM) {
        mountElement(virtualDOM, container)
    } else {
        const oldVirtualDOM = oldDOM.__virtualDOM

        if (oldVirtualDOM.type === virtualDOM.type) {
            if (virtualDOM.type === 'text') {
                updateNodeText(virtualDOM, oldVirtualDOM, oldDOM)
            } else {
                updateNodeElement(oldDOM, virtualDOM, oldVirtualDOM)
            }
        } else if (!isComponent(virtualDOM)) {
            const el = createDOM(virtualDOM)
            container.replaceChild(el, oldDOM)
        }

        const oldChildNodes = oldDOM.childNodes
        virtualDOM.children.forEach((child, index) => {
            diff(child, oldDOM, oldChildNodes[index])
        })

        if (oldChildNodes.length > virtualDOM.children.length) {
            for (let i = oldChildNodes.length - 1, len = virtualDOM.children.length; i > len - 1; i--) {
                unmountElement(oldChildNodes[i])
            }
        }
    }
}
```
### 组件更新

#### setState更新
需要在子组件的父组件上声明`setState`方法，修改组件的state值，调用组件的render方法生产新的`VirtualDOM`对象，然后比对新旧`VirtualDOM`对象，更新页面DOM元素
```js {5-19}
export default class Component {
    constructor(props) {
        this.props = props
    }
    setState(state) {
        this.state = {
            ...this.state,
            ...state
        }
        // 生成新的VirtualDOM对象
        const virtualDOM = this.render()
        // 获取旧的DOM对象
        const oldDOM = this.getDOM()
        // 将component属性添加的virtualDOM上
        virtualDOM.component = this
        // 比对
        diff(virtualDOM, oldDOM.parentNode, oldDOM)
    }
    setDOM(dom) {
        this.__DOM = dom
    }
    getDOM() {
        return this.__DOM
    }
    render() {

    }
```
将组件保存到新的`VirtualDOM`对象上
```js {4}
function buildClassComponent(virtualDOM) {
    const component = new virtualDOM.type(virtualDOM.props)
    const newVirtualDOM = component.render()
    newVirtualDOM.component = component
    return newVirtualDOM
}
```
创建`VirtualDOM`对象的DOM元素之后，如果是**组件**对应的`VirtualDOM`对象，需要将组件的DOM元素保存到组件上。
```js {4-7}
function mounNativeElement(virtualDOM, container) {
    const dom = createDOM(virtualDOM)
    container.appendChild(dom)
    const component = virtualDOM.component
    if (component) {
        component.setDOM(dom)
    }
}
```
#### 判断组件是否是同一节点
```js
SpReact.render(<App title="App"/>, container)
setTimeout(() => {
    SpReact.render(<App title="App1"/>, container)
},1000)
```
如果新的`VirtualDOM`对象是个组件
```js {17}
export default function diff(virtualDOM, container, oldDOM) {
    if (!oldDOM) {
        mountElement(virtualDOM, container)
    } else {
        const oldVirtualDOM = oldDOM.__virtualDOM

        if (oldVirtualDOM.type === virtualDOM.type) {
            if (virtualDOM.type === 'text') {
                updateNodeText(virtualDOM, oldVirtualDOM, oldDOM)
            } else {
                updateNodeElement(oldDOM, virtualDOM, oldVirtualDOM)
            }
        } else if (!isComponent(virtualDOM)) {
            const el = createDOM(virtualDOM)
            container.replaceChild(el, oldDOM)
        } else {
            diffComponent(virtualDOM, oldVirtualDOM, oldDOM, container)
        }

        const oldChildNodes = oldDOM.childNodes
        virtualDOM.children.forEach((child, index) => {
            diff(child, oldDOM, oldChildNodes[index])
        })

        if (oldChildNodes.length > virtualDOM.children.length) {
            for (let i = oldChildNodes.length - 1, len = virtualDOM.children.length; i > len - 1; i--) {
                unmountElement(oldChildNodes[i])
            }
        }
    }
}
```
判断是不是同一个组件
```js
export function isSameComponent(virtualDOM,oldVirtualDOM){
    const oldComponent = oldVirtualDOM.component
    return oldComponent && virtualDOM.type === oldComponent.constructor
}
```
新旧`VirtualDOM`进行比对时，如果不是同一个组件，则需要创建新的`VirtualDOM`对象的节点对应的DOM，并删除掉`oldDOM`
```js
function diffComponent(virtualDOM, oldVirtualDOM, oldDOM, container) {
    if (isSameComponent(virtualDOM, oldVirtualDOM)) {
        updateComponent(virtualDOM, oldVirtualDOM, oldDOM, container)
    } else {
        // 这里没有直接创建对应的DOM元素，
        // 是因为创建组件对应的DOM元素逻辑比较多，如将component保存到VirtualDOM对象上等
        // 可以对原来的逻辑进行完善，复用之前的逻辑
        mountElement(virtualDOM, container, oldDOM)
    }
}
```
mountElement后，最终都会调用`mounNativeElement`，这里在`mounNativeElement`里将oldDOM对象删除
```js {23-25}
export function mountElement(virtualDOM, container, oldDOM) {
    if (isComponent(virtualDOM)) {
        mountComponent(virtualDOM, container, oldDOM)
    } else {
        mounNativeElement(virtualDOM, container, oldDOM)
    }
}

export function mountComponent(virtualDOM, container, oldDOM) {
    let newVirtualDOM

    if (isFunctionComponent(virtualDOM)) {
        newVirtualDOM = buildFunctionComponent(virtualDOM)
    } else {
        newVirtualDOM = buildClassComponent(virtualDOM)
    }
    mountElement(newVirtualDOM, container, oldDOM)
}

export function mounNativeElement(virtualDOM, container, oldDOM) {
    const dom = createDOM(virtualDOM)
    container.appendChild(dom)
    if (oldDOM) {
        unmountElement(oldDOM)
    }
    const component = virtualDOM.component
    if (component) {
        component.setDOM(dom)
    }
}
```
如果是同一个组件，就更新组件的props，重新生成virtualDOM对象，进行比对
```js
export function updateComponent(virtualDOM, oldVirtualDOM, oldDOM, container) {
    const oldComponent = oldVirtualDOM.component
    // 更新组件的props
    oldComponent.updateProps(virtualDOM.props)
    const nextVirtualDOM = oldComponent.render()
    nextVirtualDOM.component = oldComponent
    diff(nextVirtualDOM, container, oldDOM)
}
```
调用生命周期函数，首先需要在Component类上加上生命周期函数
```js {3,6,7,12}
export function updateComponent(virtualDOM, oldVirtualDOM, oldDOM, container) {
    const oldComponent = oldVirtualDOM.component
    oldComponent.componentWillReceiveProps()
    let props = virtualDOM.props
    let oldProps = oldVirtualDOM.props
    if (oldComponent.shouldComponentUpdate(props, oldProps)) {
        oldComponent.componentWillUpdate(props)
        oldComponent.updateProps(virtualDOM.props)
        const nextVirtualDOM = oldComponent.render()
        nextVirtualDOM.component = oldComponent
        diff(nextVirtualDOM, container, oldDOM)
        oldComponent.componentDidUpdate(oldProps)
    }
}
```
## ref属性
```jsx
<h1 ref={title => this.title = title}>{this.props.title}</h1>
```
创建DOM元素时，执行ref属性对应的函数
```js {13-15}
export function createDOM(virtualDOM) {
    const type = virtualDOM.type
    let el
    if (type === 'text') {
        el = document.createTextNode(virtualDOM.props.textContent)
    } else {
        el = document.createElement(type)
        updateNodeElement(el, virtualDOM)
    }
    virtualDOM.children.forEach(child => {
        mountElement(child, el)
    })
    if (virtualDOM && virtualDOM.props && virtualDOM.props.ref) {
        virtualDOM.props.ref(el)
    }
    el.__virtualDOM = virtualDOM
    return el
}
```
给组件添加ref属性,ref对应的属性值就是该组件
```jsx
<Alert ref={alert => this.alert = alert}/>
```
```js {13-20}
export function mountComponent(virtualDOM, container, oldDOM) {
    let newVirtualDOM

    if (isFunctionComponent(virtualDOM)) {
        newVirtualDOM = buildFunctionComponent(virtualDOM)
    } else {
        newVirtualDOM = buildClassComponent(virtualDOM)
    }
   
    mountElement(newVirtualDOM, container, oldDOM)

    const component = newVirtualDOM.component
    // 如果是组件，就调用组件的生命周期函数
    //  props中存在ref属性，就调用ref属性所对应的函数
    if(component){
        component.componentDidMount()
        if (component.props && component.props.ref) {
            component.props.ref(component)
        }
    }
}
```
## key属性比对
同一父节点下的子节点，可以通过key属性比对VirtualDOM对象
```diff
export default function diff(virtualDOM, container, oldDOM) {
    if (!oldDOM) {
        mountElement(virtualDOM, container)
    } else {
        const oldVirtualDOM = oldDOM.__virtualDOM

        if (oldVirtualDOM.type === virtualDOM.type) {
            if (virtualDOM.type === 'text') {
                updateNodeText(virtualDOM, oldVirtualDOM, oldDOM)
            } else {
                updateNodeElement(oldDOM, virtualDOM, oldVirtualDOM)
            }
-            const oldChildNodes = oldDOM.childNodes
-            virtualDOM.children.forEach((child, index) => {
-               diff(child, oldDOM, oldChildNodes[index])
-            })

            // 比对子节点
+           diffChildren(virtualDOM, oldDOM)

-            if (oldChildNodes.length > virtualDOM.children.length) {
-                for (let i = oldChildNodes.length - 1, len = virtualDOM.children.length; i > len - 1; i--) {
-                    unmountElement(oldChildNodes[i])
-                }
-            }
        } else if (!isComponent(virtualDOM)) {
-            const el = createDOM(virtualDOM)
-            container.replaceChild(el, oldDOM)
            // 这里修改下不是组件的逻辑，因为virtualDOM对象有可能是组件创建的
            // 最终会调用mounNativeElement处理组件的逻辑
+            mountElement(virtualDOM, container, oldDOM)
        } else {
            diffComponent(virtualDOM, oldVirtualDOM, oldDOM, container)
        }
    }
}
```
* 首先判断旧的节点上存不存在key属性，不存在，就还用之前的逻辑(循环调用diff进行比对)
* 存在key属性
  * 用新virtualDOM中的key属性去去旧节点中查找，如果存在，判断位置是否正确，不正确，就将旧节点移动的正确的位置
  * 如果不存在就创建virtualDOM对应的DOM
```js
function diffChildren(virtualDOM, oldDOM) {
    const oldChildNodes = oldDOM.childNodes

    let keyElements = {}
    for (let i = 0, len = oldChildNodes.length; i < len; i++) {
        const el = oldChildNodes[i]
        if (el.nodeType === 1) {
            const key = el.getAttribute('key')
            if (key) {
                keyElements[key] = el
            }
        }
    }

    const hasNoKey = Object.keys(keyElements).length === 0

    if (hasNoKey) {
        virtualDOM.children.forEach((child, index) => {
            diff(child, oldDOM, oldChildNodes[index])
        })
    } else {
        // 存在key属性
        virtualDOM.children.forEach((child, index) => {
            const key = child.props.key
            if (key) {
                const el = keyElements[key]
                if (el) {
                    // 移动oldChilNodes位置
                    if(el !== oldChildNodes[index])  oldDOM.insertBefore(el, oldChildNodes[index])
                    // 比对
                    else diff(child, oldDOM, el)
                } else {
                    // 重新创建
                    mountElement(child, oldDOM, oldChildNodes[index], true)
                }
            } 
        })
    }
    if (oldChildNodes.length > virtualDOM.children.length) {
        for (let i = oldChildNodes.length - 1, len = virtualDOM.children.length; i > len - 1; i--) {
            unmountElement(oldChildNodes[i])
        }
    }
}
```
`mountElement`加了个参数，是否是新增，如果是新增，在调用`mounNativeElement`时，就不会删除oldDOM。在插入元素时，需要将新元素插入到oldDOM之前
```js {13-17}
export function mountElement(virtualDOM, container, oldDOM, isNew) {
    if (isComponent(virtualDOM)) {
        mountComponent(virtualDOM, container, oldDOM, isNew)
    } else {
        mounNativeElement(virtualDOM, container, oldDOM, isNew)
    }
}

export function mounNativeElement(virtualDOM, container, oldDOM, isNew) {
    const dom = createDOM(virtualDOM)

    if (oldDOM) {
        // 将元素插入的oldDOM元素之前
        container.insertBefore(dom, oldDOM)
        if (!isNew) {
            unmountElement(oldDOM)
        }
    } else {
        container.appendChild(dom)
    }
    const component = virtualDOM.component
    if (component) {
        component.setDOM(dom)
    }
}

export function mountComponent(virtualDOM, container, oldDOM, isNew) {
    let newVirtualDOM

    if (isFunctionComponent(virtualDOM)) {
        newVirtualDOM = buildFunctionComponent(virtualDOM)
    } else {
        newVirtualDOM = buildClassComponent(virtualDOM)
    }

    mountElement(newVirtualDOM, container, oldDOM, isNew)
    const component = newVirtualDOM.component
    if (component) {
        component.componentDidMount()
        if (component.props && component.props.ref) {
            component.props.ref(component)
        }
    }
}
```
#### key属性删除节点
如果不存在key属性，则还是使用之前的根据索引去删除多余元素

如果存在key属性，则需要遍历旧的节点，并使用旧节点的key到新节点中查找对应key属性的元素，如果新节点中不存在，则说明当前节点已经被删除
```js {23-27,43-49}
function diffChildren(virtualDOM, oldDOM) {
    const oldChildNodes = oldDOM.childNodes

    let keyElements = {}
    for (let i = 0, len = oldChildNodes.length; i < len; i++) {
        const el = oldChildNodes[i]
        if (el.nodeType === 1) {
            const key = el.getAttribute('key')
            if (key) {
                keyElements[key] = el
            }
        }
    }

    const hasNoKey = Object.keys(keyElements).length === 0

    if (hasNoKey) {
        // 比对节点
        virtualDOM.children.forEach((child, index) => {
            diff(child, oldDOM, oldChildNodes[index])
        })
        // 删除节点
        if (oldChildNodes.length > virtualDOM.children.length) {
            for (let i = oldChildNodes.length - 1, len = virtualDOM.children.length; i > len - 1; i--) {
                unmountElement(oldChildNodes[i])
            }
        }
    } else {
        const newKeyElements = {}
        virtualDOM.children.forEach((child, index) => {
            const key = child.props.key
            if (key) {
                newKeyElements[key] = child
                const el = keyElements[key]
                if (el) {
                    if (el !== oldChildNodes[index]) oldDOM.insertBefore(el, oldChildNodes[index])
                    else diff(child, oldDOM, el)
                } else {
                    mountElement(child, oldDOM, oldChildNodes[index], true)
                }
            }
        })
        for (let i = 0; i < oldChildNodes.length; i++) {
            let oldChild = oldChildNodes[i]
            let oldKey = oldChild.__virtualDOM.props.key
            if (!newKeyElements[oldKey]) {
                unmountElement(oldChild)
            }
        }
    }
}
```
## 删除节点
删除节点还需要考虑节点是节点还是文本
* 文本，直接删除节点
* 组件，调用卸载组件的生命周期函数
* 如果删除的节点有ref属性，则需要删除ref属性
* 如果有事件，则需要删除对应节点的事件

```js
export function unmountElement(el) {
    const virtualDOM = el.__virtualDOM
    if (virtualDOM.type === 'text') {
        el.remove()
        return
    }
    // 不是文本
    const component = virtualDOM.component
    // 组件生命周期
    if (virtualDOM.component) {
        component.componentWillMount()
    }
    const props = virtualDOM.props
    // 清空ref属性
    if (props && props.ref) {
        props.ref(null)
    }
    // 删除事件
    Object.keys(props).forEach(propName => {
        if (propName.startsWith('on')) {
            const event = propName.slice(2).toLowerCase()
            const val = virtualDOM.props[propName]
            el.removeEventListener(event, val)
        }
    })
    // 删除子节点事件
    if (el.childNodes.length) {
        el.childNodes.forEach(child => {
            unmountElement(child)
        })
    }
    // 删除当前元素
    el.remove()
}
```