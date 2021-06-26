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
export function updateNodeText(virtualDOM, oldVirtualDOM, oldDOM) {
    if (virtualDOM.props.textContent !== oldVirtualDOM.props.textContent) {
        oldDOM.textContent = virtualDOM.props.textContent
        oldDOM.__virtualDOM = virtualDOM
    }
}
export function unmountElement(el) {
    el.remove()
}