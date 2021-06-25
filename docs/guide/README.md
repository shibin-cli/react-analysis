## 什么是jsx
它是一种 JavaScript 语法的扩展，React 使用它来描述用户界面长成什么样子。

虽然它看起来非常像 HTML，但它确实是 JavaScript 。在 React 代码执行之前，Babel 会对将 JSX 编译为 React API

```jsx
<div className="app">
  <h1>Hello</h1>
  <p>Hello,world</p>
</div>
```
babel默认会jsx对象转化为react.createElement(xxx)，我们可以在 [https://www.babeljs.cn/repl](https://www.babeljs.cn/repl) 上尝试下

```js
React.createElement(
  "div",
  {
    className: "app"
  },
  React.createElement("h1", null, "Hello"),
  React.createElement("p", null, "Hello,world")
)
```
