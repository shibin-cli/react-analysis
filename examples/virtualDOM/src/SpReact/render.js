import diff from "./diff";

export default function render(VirtualDOM, container, oldDOM = container.firstChild) {
    diff(VirtualDOM, container, oldDOM)
}