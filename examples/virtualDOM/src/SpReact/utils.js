export function isComponent(virtualDOM){
    return virtualDOM&& typeof virtualDOM.type === 'function'
}
export function isFunctionComponent(virtualDOM){
    return isComponent(virtualDOM)&& !(virtualDOM.type.prototype &&  virtualDOM.type.prototype.render)
}
export function isSameComponent(virtualDOM,oldVirtualDOM){
    const oldComponent = oldVirtualDOM.component
    return oldComponent && virtualDOM.type === oldComponent.constructor
}