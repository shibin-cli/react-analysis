export function isComponent(virtualDOM){
    return virtualDOM&& typeof virtualDOM.type === 'function'
}
export function isFunctionComponent(virtualDOM){
    return isComponent(virtualDOM)&& !(virtualDOM.type.prototype &&  virtualDOM.type.prototype.render)
}