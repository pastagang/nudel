import { Decoration, ViewPlugin, WidgetType } from '@codemirror/view';
import { RegExpCursor } from '@codemirror/search';
import { EditorView } from 'codemirror';
import { syntaxTree } from '@codemirror/language';

class MsnWidget extends WidgetType {
  constructor(imgUrl) {
    super();
    this.imgUrl = imgUrl;
  }

  eq(other) {
    return other.imgUrl == this.imgUrl;
  }

  toDOM() {
    let wrap = document.createElement('img');
    wrap.className = 'msn-replacement';
    wrap.src = this.imgUrl;
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

const replacements = [
  [':wave:', '/msn/wave.gif'],
  ['tode', 'https://www.todepond.com/image/tode.gif'],
  ['gtg', '/msn/gtg.gif'],
  ['lol', '/msn/lol.gif'],
  ['hehe', '/msn/hehe.gif'],
  ['hi', '/msn/hi.gif'],
  ['hello', '/msn/hello.gif'],
  ['cool', '/msn/cool.png'],
  ['pasta', '/msn/pasta.png'],
  ['omg', '/msn/omg.gif'],
  ['(?!\\\\)n', '/msn/n.gif'],
  ['e', '/msn/e.gif'],
  ['//', '/msn/comment.gif'],
  ['kaleid', '/msn/kaleid.gif'],
  ['.jux\\(rev\\)', '/msn/thx_yaxu.gif'],
  ['reckter', '/msn/reckter.gif'],
  ['pastagang', '/msn/pastagang.gif'],
  ['trans', '/msn/trans.gif'],
  ['hh', '/msn/hi-hat.webp'],
  ['eggg','/msn/eggg.gif'],
];

function replaceTextWithMsn(view) {
  let widgets = [];
  for (let { from, to } of view.visibleRanges) {
    const text = view.state.sliceDoc(from, to);
    // debugger
    for (let replacement of replacements) {
      const cursor = new RegExpCursor(view.state.doc, replacement[0]);

      for (let match of cursor) {
        const decoration = Decoration.replace({
          widget: new MsnWidget(replacement[1]),
          // block: true
        });
        widgets.push(decoration.range(match.from, match.to));
      }
    }
  }

  widgets.sort((b, a) => b.from - a.from);
  return Decoration.set(widgets);
}

export const msnPlugin = ViewPlugin.fromClass(
  class {
    decorations; //: DecorationSet

    constructor(view) {
      this.decorations = replaceTextWithMsn(view);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = replaceTextWithMsn(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);
