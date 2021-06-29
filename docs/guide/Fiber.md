# Fiber
 ## [requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback)
* `requestIdleCallback()`在浏览器的空闲时段内调用的函数排队
```js
requestIdleCallback(deadline => {
   console.log(deadline.timeRemaining()) //获取浏览器的空余时间 
})
```
页面是一帧一帧绘制出来的，当每秒绘制帧数达到60时，页面是流畅的，小于这个值时用户就会感觉到卡顿

1s 60帧，每一帧的时间是1000/60≈16ms，如果每一帧的时间小于16ms,就说明浏览器有空余时间

### React之前版本的问题

React 16之前的版本对比更新VirtualDOM的过程采用循环递归实现，任务一开始就无法中断,如果组件数量庞大，主线程被长期占用，直到整棵VirtualDOM树对比更新完主线程才会被释放，导致期间无法执行其他任务

解决方案 
* 利用浏览器空余时间，拒绝占用主进程
* 放弃递归，采用循环
* 任务拆分，将任务拆分成一个个小任务

## 开发环境
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
```json
{
    "presets": [
        "@babel/preset-env",
        "@babel/preset-react"
    ]
}
```
编写入口文件
```js
import React,{render} from './react'
const container = document.getElementById('container')
const jsx = (
    <div>123</div>
)
render(jsx, container)
```
实现createElement
```js
export default function createElement(type, props, ...children) {
    const newChildren = [].concat(...children).reduce((res, child) => {
        if (typeof child === 'string' || typeof child === 'number') {
            res.push(createElement('text', {
                textContent: child
            }))
        } else if (typeof child !== 'undefined' && typeof child !== 'boolean' && child !== null) {
            res.push(child)
        }
        return res
    }, [])
    return {
        type,
        props: {
            ...props,
            children: newChildren
        },
        children: newChildren
    }
}
```
## 创建任务队列
实现创建任务队列方法
```js
export function createTaskQue() {
    const taskQue = []
    return {
        // 添加任务
        push: item => taskQue.push(item),
        // 获取任务，先添加的任务先执行，并删除任务
        pop: () => taskQue.shift(),
        // 任务是否为空
        isEmpty: () => taskQue.length
    }
}
```
初始的render函数
```js
const taskQue = createTaskQue()

export function render(element, dom) {
    taskQue.push({
        dom,
        props: {
            children: element
        }
    })
}
```
## 任务调度
首先，在首次执行render函数时，如果浏览器有空闲时间，就执行任务
```js
export function render(element, dom) {
    taskQue.push({
        dom,
        props: {
            children: element
        }
    })
    requestIdleCallback(performTask)
}
```
下面实现整体流程
* 首先执行任务（没有任务时获取任务）
* 执行任务过程中，浏览器
  * 如果有空余时间就一个任务接一个任务执行
  * 没有空余时间就先暂停，当浏览器有空余时间时继续执行任务
  * 最终，所有任务执行完毕后跳出
```js
const taskQue = createTaskQue()

let subTask = null
// 获取第一个任务
function getFirstTask() {

}

function performTask(deadLine) {
    // 执行任务,当任务执行完毕浏览器没有空余时会跳出,执行后面的逻辑
    workLoop(deadLine)
    // 如果任务存在,或者任务列表中还存在有任务
    if (subTask || !taskQue.isEmpty()) {
        requestIdleCallback(performTask)
    }
}
function workLoop(deadLine){
    if (!subTask) {
        subTask = getFirstTask()
    }
    // 如果任务存在 并且浏览器有空余时间就执行任务
    while (subeTask && deadLine.timeRemaining() > 1) {
        subTask = executeTask(subTask)
    }
}
// 执行任务，并返回下一个任务
function executeTask(subTask) {

}
```
## 构建Fiber对象
## 构建Effects数组
## 初始渲染
## 处理组件
### 类组件
### 函数组件
## 更新