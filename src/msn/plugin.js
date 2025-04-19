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
  ['gtg', 'http://www.sherv.net/cm/emo/word/gtg-emoticon.gif'],
  ['lol', 'http://www.sherv.net/cm/emo/lol/glowing-lol.gif'],
  ['hehe', 'http://www.sherv.net/cm/emo/lol/hehe.gif'],
  ['hi', 'http://www.sherv.net/cm/emo/word/hi.gif'],
  ['hello', 'http://www.sherv.net/cm/emo/word/hello-wave-smiley-emoticon.gif'],
  ['cool', 'http://www.sherv.net/cm/emo/word/cool-sign-smiley-emoticon.png'],
  ['pasta', 'http://www.sherv.net/cm/emoticons/eating/pasta-smiley-emoticon-emoji.png'],
  ['omg', 'http://www.sherv.net/cm/emo/word/glitter-omg-emoticon.gif'],
  ['(?!\\\\)n', '/msn/n.gif'],
  ['e', '/msn/e.gif'],
  ['//', '/msn/comment.gif'],
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
