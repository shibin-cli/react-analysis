import {
    isFunctionComponent,
    isComponent
} from './utils'
import {
    updateNodeElement,
    unmountElement
} from "./update"
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

export function buildFunctionComponent(virtualDOM) {
    return virtualDOM.type(virtualDOM.props || {})
}

export function buildClassComponent(virtualDOM) {
    const component = new virtualDOM.type(virtualDOM.props)
    const newVirtualDOM = component.render()
    newVirtualDOM.component = component
    return newVirtualDOM
}

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
    // console.log(virtualDOM)
    if (virtualDOM && virtualDOM.props && virtualDOM.props.ref) {
        // console.log( virtualDOM.props)
        virtualDOM.props.ref(el)
    }
    el.__virtualDOM = virtualDOM
    return el
}