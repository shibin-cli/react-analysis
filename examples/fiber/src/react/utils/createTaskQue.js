export function createTaskQue() {
    const taskQue = []
    return {
        push: item => taskQue.push(item),
        pop: () => taskQue.shift(),
        isEmpty: ()=> taskQue.length
    }
}