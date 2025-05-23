// bad code only
const REPEAT_INTERVAL = 5000;
export function repeatRepeatRepeatRepeat(func) {
  func();
  setTimeout(() => repeatRepeatRepeatRepeat(func), REPEAT_INTERVAL);
}
