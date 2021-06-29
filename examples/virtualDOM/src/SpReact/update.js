import diff from "./diff"

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
        } else if (propName !== 'children' && propName !== 'ref') {
            el.setAttribute(propName, val)
        }
    })

    Object.keys(oldProps).forEach(oldPropName => {
        const oldVal = oldProps[oldPropName]
        const val = props[oldPropName]
        if (!val) {
            if (oldPropName.startsWith('on')) {
                const oldEventName = oldPropName.slice(2).toLowerCase()
                el.removeEventListener(oldEventName, oldVal)
            } else if (oldPropName === 'className') {
                el.removeAttribute('class', oldVal)
            } else if (oldPropName !== 'children') {
                el.removeAttribute(oldPropName, oldVal)
            }
        }
    })
}

export function updateNodeText(virtualDOM, oldVirtualDOM, oldDOM) {
    if (virtualDOM.props.textContent !== oldVirtualDOM.props.textContent) {
        oldDOM.textContent = virtualDOM.props.textContent
        oldDOM.__virtualDOM = virtualDOM
    }
}

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

export function unmountElement(el) {
    const virtualDOM = el.__virtualDOM
    if (virtualDOM.type === 'text') {
        el.remove()
        return
    }
    // 不是文本
    const component = virtualDOM.component
    if (virtualDOM.component) {
        component.componentWillMount()
    }
    const props = virtualDOM.props
    if (props && props.ref) {
        props.ref(null)
    }
    Object.keys(props).forEach(propName => {
        if (propName.startsWith('on')) {
            const event = propName.slice(2).toLowerCase()
            const val = virtualDOM.props[propName]
            el.removeEventListener(event, val)
        }
    })
    if (el.childNodes.length) {
        el.childNodes.forEach(child => {
            unmountElement(child)
        })
    }
    el.remove()
}