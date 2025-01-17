import { getPointer } from './pointer.js';

const popover = document.querySelector('#toast');
const span = document.querySelector('#toast span');

const pointer = getPointer();
export async function nudelToast(message = '!') {
  span.textContent = message;

  popover.style.left = `${pointer.clientX}px`;
  popover.style.top = `${pointer.clientY - 40}px`;
  popover.showPopover();
}
