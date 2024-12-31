// currently unused
import { EditorView } from "codemirror";
import { tags } from "@lezer/highlight";
import { HighlightStyle } from "@codemirror/language";
import { syntaxHighlighting } from "@codemirror/language";

let colors = {
  teal600: "#c084fc", // text
  teal400: "#2dd4bf",
  amber: "#d97706",
  violet400: "#a78bfa",
  violet300: "#c4b5fd",
  indigo300: "#a5b4fc",
  indigo400: "#818cf8",
  fuchsia400: "#e879f9",
  fuchsia300: "#78716c", // brackets
  fuchsia200: "#f5d0fe",
  whitish: "#d9f99d", // text
  stone400: "#a8a29e",
  stone500: "#78716c",
};

let theme = EditorView.theme(
  {
    "&": {
      color: colors.teal600,
      overflow: "hidden",
      backgroundColor: "transparent",
      fontSize: "16px",
      height: "100%",
    },
    ".cm-gutters": {
      "background-color": "transparent",
      color: colors.stone500,
    },
    ".cm-cursor": {
      "border-left-color": "#d9770696",
      "border-left-width": "11px",
    },
    ".cm-activeLine, .cm-activeLineGutter": {
      "background-color": "#aaaaaa20",
    },
    ".cm-cursorLayer": {
      // "animation-name": "inherit !important;", // disables blinking
    },
    ".cm-matchingBracket": {
      "text-decoration": "underline 0.12rem",
      "text-underline-offset": "0.24rem",
      "text-decoration-color": colors.fuchsia300,
    },
  },
  { dark: true }
);

const highlightStyle = HighlightStyle.define([
  { tag: tags.labelName, color: "#7dd3fc" },
  { tag: tags.keyword, color: colors.teal600 },
  { tag: tags.literal, color: colors.whitish },
  { tag: tags.squareBracket, color: colors.amber },
  { tag: tags.punctuation, color: colors.fuchsia300 },
  { tag: tags.operator, color: colors.fuchsia300 },
  { tag: tags.comment, color: colors.stone500, fontStyle: "italic" },
]);

export let strudelTheme = [theme, syntaxHighlighting(highlightStyle)];
