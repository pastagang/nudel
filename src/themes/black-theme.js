// currently unused
import { EditorView } from 'codemirror';
import { tags } from '@lezer/highlight';
import { HighlightStyle } from '@codemirror/language';
import { syntaxHighlighting } from '@codemirror/language';

let theme = EditorView.theme(
  {
    '&': {
      color: 'white',
      overflow: 'hidden',
      backgroundColor: 'transparent',
      fontSize: '16px',
      height: '100%',
    },
    '.cm-gutters': {
      'background-color': 'transparent',
      color: 'white',
    },
    '.cm-cursor': {
      'border-left-color': 'transparent',
      // the regular cursor is hidden, because we're showing a nametag..
      // the cursor is part of https://github.com/felixroos/y-codemirror.next
      // i had to fork again because the scrollIntoView was messing with the global scroll
    },
    '.cm-activeLine, .cm-activeLineGutter, .cm-line': {
      'background-color': 'rgba(0,0,0,.7) !important',
    },
    '.cm-selectionBackground': {
      'background-color': 'rgba(255,255,255,.7) !important',
    },
    '.cm-cursorLayer': {
      'animation-name': 'inherit !important;', // disables blinking
    },
    '.cm-matchingBracket': {
      'text-decoration': 'underline 0.12rem',
      'text-underline-offset': '0.24rem',
      'text-decoration-color': 'white',
    },
    '.cm-ySelectionInfo': {
      opacity: '1',
      fontFamily: 'monospace',
      color: 'black',
      padding: '2px 2px',
      fontSize: '0.8rem',
      //"font-weight": "bold",
      top: '1.45em',
      'z-index': '1000',
    },
  },
  { dark: true },
);

const highlightStyle = HighlightStyle.define([
  { tag: tags.labelName, color: 'white' },
  { tag: tags.keyword, color: 'white' },
  { tag: tags.literal, color: 'white' },
  { tag: tags.squareBracket, color: 'white' },
  { tag: tags.punctuation, color: 'white' },
  { tag: tags.operator, color: 'white' },
  { tag: tags.comment, color: 'white', fontStyle: 'italic' },
]);

export default [theme, syntaxHighlighting(highlightStyle)];
