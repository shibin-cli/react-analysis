export function updateNodeElement(el, virtualDOM) {
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
export function updateNodeText(virtualDOM, oldVirtualDOM, oldDOM) {
    if (virtualDOM.props.textContent !== oldVirtualDOM.props.textContent) {
        oldDOM.textContent = virtualDOM.props.textContent
        oldDOM.__virtualDOM = virtualDOM
    }
}