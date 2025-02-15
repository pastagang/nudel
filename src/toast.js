import { getPointer } from './pointer.js';

const popover = document.querySelector('#toast');
const span = document.querySelector('#toast span');

const pointer = getPointer();
export async function nudelToast(message = '!') {
  if (!span) throw new Error('No toast element found');
  if (!popover) throw new Error('No popover element found');
  span.textContent = message;

  popover.style.left = `${pointer.clientX}px`;
  popover.style.top = `${pointer.clientY - 40}px`;
  popover.showPopover();
}
