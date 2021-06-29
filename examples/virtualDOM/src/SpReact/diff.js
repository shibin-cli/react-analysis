import {
    updateNodeElement,
    updateNodeText,
    unmountElement,
    updateComponent
} from "./update"
import {
    isComponent,
    isSameComponent
} from "./utils"
import {
    mountElement,
    createDOM
} from './mount'
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

            diffChildren(virtualDOM, oldDOM)

        } else if (!isComponent(virtualDOM)) {
            // 这里修改下不是组件的逻辑，因为virtualDOM对象有可能是组件创建的
            // 最终会调用mounNativeElement处理组件的逻辑
            mountElement(virtualDOM, container, oldDOM)
        } else {
            diffComponent(virtualDOM, oldVirtualDOM, oldDOM, container)
        }
    }
}

function diffComponent(virtualDOM, oldVirtualDOM, oldDOM, container) {
    if (isSameComponent(virtualDOM, oldVirtualDOM)) {
        updateComponent(virtualDOM, oldVirtualDOM, oldDOM, container)
    } else {
        mountElement(virtualDOM, container, oldDOM)
    }
}

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