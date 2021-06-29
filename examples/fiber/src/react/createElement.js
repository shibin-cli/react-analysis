export default function createElement(type, props, ...children) {
    const newChildren = [].concat(...children).reduce((res, child) => {
        if (typeof child === 'string' || typeof child === 'number') {
            res.push(createElement('text', {
                textContent: child
            }))
        } else if (typeof child !== 'undefined' && typeof child !== 'boolean' && child !== null) {
            res.push(child)
        }
        return res
    }, [])
    return {
        type,
        props: {
            ...props,
            children: newChildren
        },
        children: newChildren
    }
}