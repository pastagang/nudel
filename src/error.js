import { RangeSet, StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';

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
    for (let _e of tr.effects) {
      /** @type {any} */
      const e = _e;
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
  /** @type {any} */
  const errorWidget = new ErrorWidget(docId, msg);
  effects.push(addError.of(errorWidget));

  if (!view.state.field(errorField, false)) {
    effects.push(StateEffect.appendConfig.of(errorField));
  }

  view.dispatch({ effects });
}

export function clearInlineErrors(docId) {
  const view = window.editorViews.get(docId);
  // @ts-expect-error
  view.dispatch({ effects: [clearErrors.of()] });
}

function showGlobalError(message) {
  let errorEl = document.querySelector(`#global-error`);
  if (errorEl) {
    errorEl.innerText = message;
  } else {
    document.body.insertAdjacentHTML('beforeend', `<div id="global-error">${message}</div>`);
  }
}

function showLocalError(docId, message) {
  const slot = document.querySelector(`#slot-${docId}`);
  let errorEl = document.querySelector(`#slot-${docId} #error-${docId}`);
  if (errorEl) {
    errorEl.innerText = message;
  } else {
    slot?.insertAdjacentHTML('beforeend', `<div class="error" id="error-${docId}">${message}</div>`);
  }
}

// error handling
export function setError(message, docId) {
  console.dir(message);
  console.error(message);
  if (!docId) {
    showGlobalError(message);
    return;
  }
  // messages will either be string or InlineErrorMessage
  if (typeof message != 'string') {
    displayInlineErrors(docId, message);
    return;
  }
  showLocalError(docId, message);
}

export function clearLocalError(docId) {
  document.querySelector(`#slot-${docId} #error-${docId}`)?.remove();
  clearInlineErrors(docId);
}

export function clearGlobalError() {
  document.querySelector(`#global-error`)?.remove();
}

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }
  if (event.data.type === 'onError') {
    const [err, docId] = event.data.msg;
    setError(err, docId);
  }
});

export function tryToGetErrorWithLine({ error, code, docId, onError, offset }) {
  const isMiniError = error.message.includes('[mini]');
  const line = (() => {
    if (isMiniError) {
      return error.stack.replace('Error: [mini] parse error at line ', '').split(':')[0];
    }

    if ('loc' in error) {
      return error.loc.line - offset;
    }

    const anonLocation = error.stack.split(`\n    at`)?.[1]?.split('(')?.[2]?.replace(/\)$/, '')?.split(',')?.[1];

    return anonLocation?.split(':')[1];
  })();

  const message = (() => {
    if (isMiniError) {
      return '[mini]' + error.message.split(':')[1];
    }
    return error.message.split('\n')[0];
  })();

  if (line != null) {
    onError(new InlineErrorMessage(line, message), docId);
    return;
  }

  onError(`${error}`, docId);

  const headElement = document.getElementsByTagName('head')[0];
  const scriptElem = document.createElement('script');
  window.addEventListener(
    'error',
    (e) => {
      console.log(
        e.message,
        '\n',
        e.filename,
        ':',
        e.lineno,
        e.colno ? ':' + e.colno : '',
        e.error && e.error.stack ? '\n' : '',
        e.error ? e.error.stack : undefined,
      );

      headElement.removeChild(scriptElem);
      const message = e.error.message.split('\n')[0]?.split(':')[1]?.trim();
      onError(new InlineErrorMessage(e.lineno - (offset ?? 0) - 1, message), docId);
    },
    false,
  );

  window.removeScript = () => {
    headElement.removeChild(headElement);
  };

  scriptElem.addEventListener('load', (e) => {
    headElement.removeChild(scriptElem);
  });

  scriptElem.innerHTML = `(async () => {
          ${code}
        removeScriptTag()
      })()`;
  headElement.appendChild(scriptElem);
  // throw error;
}
