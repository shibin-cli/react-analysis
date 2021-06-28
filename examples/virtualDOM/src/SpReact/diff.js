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
            const oldChildNodes = oldDOM.childNodes
            virtualDOM.children.forEach((child, index) => {
                diff(child, oldDOM, oldChildNodes[index])
            })

            if (oldChildNodes.length > virtualDOM.children.length) {
                for (let i = oldChildNodes.length - 1, len = virtualDOM.children.length; i > len - 1; i--) {
                    unmountElement(oldChildNodes[i])
                }
            }
        } else if (!isComponent(virtualDOM)) {
            // const el = createDOM(virtualDOM)
            // container.replaceChild(el, oldDOM)
            mountElement(virtualDOM, container,oldDOM)
        } else {
            diffComponent(virtualDOM, oldVirtualDOM, oldDOM, container)
        }


    }
}

function diffComponent(virtualDOM, oldVirtualDOM, oldDOM, container) {
    if (isSameComponent(virtualDOM, oldVirtualDOM)) {
        updateComponent(virtualDOM, oldVirtualDOM, oldDOM, container)
        console.log('同一组件',oldVirtualDOM)
    } else {
        mountElement(virtualDOM, container, oldDOM)
        console.log('不是同一组件')
    }
}