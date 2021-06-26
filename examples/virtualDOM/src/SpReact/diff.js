import {
    updateNodeElement,
    updateNodeText,
    unmountElement
} from "./update"
import {
    isComponent,
    isFunctionComponent
} from "./utils"

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
            for (let i = virtualDOM.children.length, len = oldChildNodes.length; i < len; i++) {
                unmountElement(oldChildNodes[i])
            }
        }
    }
}

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

    if (isFunctionComponent(virtualDOM)) {
        newVirtualDOM = buildFunctionComponent(virtualDOM)
    } else {
        newVirtualDOM = buildClassComponent(virtualDOM)
    }
    mountElement(newVirtualDOM, container)
}

function buildFunctionComponent(virtualDOM) {
    return virtualDOM.type(virtualDOM.props || {})
}

function buildClassComponent(virtualDOM) {
    const component = new virtualDOM.type(virtualDOM.props)
    const newVirtualDOM = component.render()
    return newVirtualDOM
}

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