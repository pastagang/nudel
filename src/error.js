import { StateEffect, StateField, RangeSet } from '@codemirror/state';
import { EditorView, Decoration, WidgetType } from '@codemirror/view';

export class InlineErrorMessage {
  constructor(lineno, text) {
    this.lineno = lineno;
    this.text = text;
  }
}

class ErrorWidget extends WidgetType {
  constructor(docId, msg) {
    super();
    this.docId = docId;
    this.msg = msg;
  }

  eq(other) {
    return other.msg.lineno == this.msg.lineno && other.msg.text == this.msg.text;
  }

  toDOM() {
    const msg = document.createElement('div');
    msg.classList.add('error-inline');
    msg.innerText = this.msg.text;
    return msg;
  }

  ignoreEvent() {
    return false;
  }
}

const addError = StateEffect.define();
const clearErrors = StateEffect.define();

const errorField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(errors, tr) {
    errors = errors.map(tr.changes);
    for (let e of tr.effects) {
      if (e.is(addError)) {
        const doc = tr.state.doc;
        const afterLineIndex = doc.line(e.value.msg.lineno).to + 1;
        const lastIndex = doc.length;
        const rangeFrom = Math.min(afterLineIndex, lastIndex);

        const deco = Decoration.widget({
          widget: e.value,
          block: true,
        }).range(rangeFrom);

        errors = errors.update({
          add: [deco],
        });
      } else if (e.is(clearErrors)) {
        errors = RangeSet.empty;
      }
    }
    return errors;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export function displayInlineErrors(docId, msg) {
  const view = window.editorViews.get(docId);
  const effects = [];
  effects.push(addError.of(new ErrorWidget(docId, msg)));

  if (!view.state.field(errorField, false)) {
    effects.push(StateEffect.appendConfig.of(errorField));
  }

  view.dispatch({ effects });
}

export function clearInlineErrors(docId) {
  const view = window.editorViews.get(docId);
  view.dispatch({ effects: [clearErrors.of()] });
}
