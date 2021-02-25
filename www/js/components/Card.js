import { html, route } from '/lib/preact/mod.js';
import { parseNoteContent, parseCardTitle } from '/js/NoteUtils.js';

export default function Card({ note, pigment, resource, fullHeight, children }) {
  const href = `/${resource}/${note.id}`;

  function onCardClicked(e) {
    if (!clickedOnCardUI(e.target) && !clickedOnInCardHyperlink(e.target)) {
      e.preventDefault();

      let selection = document.getSelection();
      selection += ""; // coerce into a string
      if (selection.length === 0) {
        route(href);
      }
    }
  }

  let classes = `card ${pigment.class} darken-border`;

  fullHeight = !!fullHeight;
  if (!fullHeight) {
    classes += ' card-height-limited';
  }

  return html`<div class=${classes} onClick=${ onCardClicked }>
                <div class="card-body">
                  ${ children }
                  ${ parseCardTitle(note)}
                  ${ parseNoteContent(note) }
                </div>
              </div>`;

}

function clickedOnCardUI(n) {
  if (!n) {
    return false;
  }

  // svg elements have a property called className but it isn't a string
  // fucking retarded web development.
  if (!(n instanceof SVGElement) &&
      n.className &&
      (n.className.includes("button") || n.className.includes("triage-dropdown-item"))) {
    return true;
  }

  return clickedOnCardUI(n.parentNode);
}

function clickedOnInCardHyperlink(n) {
  return n.className.includes("in-note-link");
}
