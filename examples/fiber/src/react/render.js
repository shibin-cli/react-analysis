import {
    createTaskQue
} from "./utils"
const taskQue = createTaskQue()

let subTask = null

function getFirstTask() {

}

function performTask(deadLine) {
    if (!subTask) {
        subTask = getFirstTask()
    }
    while (subeTask && deadLine.timeRemaining() > 1) {
        subTask = executeTask(subTask)
    }
    if (subTask || !taskQue.isEmpty()) {
        requestIdleCallback(performTask)
    }
}
// 执行任务
function executeTask() {

}
export function render(element, dom) {
    taskQue.push({
        dom,
        props: {
            children: element
        }
    })
    requestIdleCallback(performTask)
}