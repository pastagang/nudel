const pointer = {
  offsetX: 0,
  offsetY: 0,
  clientX: 0,
  clientY: 0,
};

export function getPointer() {
  return pointer;
}

function updatePointerFromPointerEvent(event) {
  pointer.clientX = event.clientX;
  pointer.clientY = event.clientY;
  pointer.offsetX = event.offsetX;
  pointer.offsetY = event.offsetY;
}

addEventListener('pointermove', updatePointerFromPointerEvent);
addEventListener('pointerdown', updatePointerFromPointerEvent);
addEventListener('pointerup', updatePointerFromPointerEvent);
