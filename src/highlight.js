import { updateMiniLocations } from '@strudel/codemirror';
import { pastamirror } from './main.js';

// highlights
export function clearStrudelHighlights() {
  for (const view of pastamirror.editorViews.values()) {
    updateMiniLocations(view, []);
  }
}
