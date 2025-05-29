import { nudelAlert } from './alert.js';
import { applySettingsToNudel, getSettings } from './settings.js';
import { PastaMirror } from './editor.js';
import './style.css';
import { updateMiniLocations } from '@strudel/codemirror';
import { getSession } from './session.js';
import { repeatRepeatRepeatRepeat } from './timedEvents/update.js';
import { showSongText } from './song.js';
import { getSyncOffset } from './sync-nonsense.js';

export const pastamirror = new PastaMirror();

export const Frame = {
  hydra: document.getElementById('hydra'),
  shader: document.getElementById('shader'),
  strudel: document.getElementById('strudel'),
  kabesalat: document.getElementById('kabelsalat'),
};

window.editorViews = pastamirror.editorViews;
window.getSyncOffset = getSyncOffset;

applySettingsToNudel();

// Reveal all development elements in development
if (window.location.hostname === 'localhost') {
  const elements = document.querySelectorAll('.development');
  elements.forEach?.((el) => el.classList.remove('development'));
}

const params = new URLSearchParams(window.location.search);
if (params.has('song')) showSongText();

//=======================================================================================
// Hello. If you've come here to re-enable paste, then please think carefully.
// Paste has been disabled as an experiment, to see if it affects various things.
//
// - Perhaps disabling paste can lower the overall quality and cleanliness of our code
//   ... which might help to lower standards, and encourage more people to make stuff.
//           It could help people to worry less, and "just type".
//
// - Paste allows people to force certain things to exist for a long time.
//   ... which can give too much power to keen individuals.
//          Let's disable paste for a while, to see if it encourages new trends to form.
//
// - Paste can be a crutch for me during learning.
//   ... I learn much better when I have to manually type things out.
//           Perhaps disabling paste can help me and others to learn better.
//
// - If paste is an option, we'll be tempted to build tools and languages that rely on it.
//    ... I think we should build tools that are optimised for manual typing.
//
// - By disabling paste, we prioritise being in the moment, and creating with others in the open.
//=======================================================================================
addEventListener(
  //~~~~~~~~~~~~~~~~~~~~~~~
  // Try keeping paste disabled in your algorave!
  // Set yourself free. The results may surprise you.
  //
  // https://www.youtube.com/watch?v=mKE-aMVR0E4
  //~~~~~~~~~~~~~~~~~~~~~~~
  'paste',
  (e) => {
    //===== PASTING MODE MODE =====
    const settings = getSettings();
    if (settings.pastingMode) {
      return;
    }

    e.preventDefault();
    // Temporarily switching this on for the keynote
    nudelAlert(
      '<h2>pasting is disabled</h2><p>to enable pasting, turn on <strong>PASTING MODE</strong> in the settings.</p>',
    );

    //===== HHHHHHH MODE =====
    // nudelAlert('<h2>hhhhhhhhhhhhhhhhhhhh</p>');
  },
  { passive: false, capture: true },
);
