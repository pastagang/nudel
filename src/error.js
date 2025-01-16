import { StateEffect, StateField, RangeSet } from '@codemirror/state';
import { EditorView, Decoration, WidgetType } from '@codemirror/view';

const lineFromStackRegex = /:(\d+):\d+$/m;

export class ErrorMessage {
  /** if lineno is 0, will display at end of file */
  constructor(lineno, text) {
    this.lineno = lineno;
    this.text = text;
  }

  static fromError(err, lineOffset) {
    console.log(err.stack);
    let lineno = 1;
    try {
      lineno = lineFromStackRegex.exec(err.stack)[1] - lineOffset;
      console.log(`parsed lineno ${lineno}`);
    } catch (e) {
      console.log('parse failure', e);
    }
    return new ErrorMessage(lineno, err.message);
  }

  eq(other) {
    const eqPos = other.lineno == this.lineno;
    const eqText = other.text == this.text;
    return eqPos && eqText;
  }

  toString() {
    return `(line ${this.lineno}) ${this.text}`;
  }
}

class ErrorWidget extends WidgetType {
  constructor(docId, msg) {
    super();
    this.docId = docId;
    this.msg = msg;

    const view = window.editorViews.get(docId);
    this.from = view.state.doc.length;
    if (msg.lineno > 0) {
      // display this after the line
      const afterLineIndex = view.state.doc.line(msg.lineno).to + 1;
      const lastIndex = view.state.doc.length;
      this.from = Math.min(afterLineIndex, lastIndex);
    }
  }

  eq(other) {
    return this.msg.eq(other.msg);
  }

  toDOM() {
    const msg = document.createElement('div');
    msg.classList.add('error');
    msg.classList.add(this.msg.lineno > 0 ? 'error-inline' : 'error-file');
    msg.classList.add(`error-${this.docId}`);
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
        const deco = Decoration.widget({
          widget: e.value,
          block: true,
        }).range(e.value.from);

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

export function displayEditorError(docId, msg) {
  const view = window.editorViews.get(docId);
  const effects = [];
  effects.push(addError.of(new ErrorWidget(docId, msg)));

  if (!view.state.field(errorField, false)) {
    effects.push(StateEffect.appendConfig.of(errorField));
  }

  view.dispatch({ effects });
}

export function clearEditorErrors(docId) {
  const view = window.editorViews.get(docId);
  view.dispatch({ effects: [clearErrors.of()] });
}
