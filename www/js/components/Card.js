import { html, route } from '/lib/preact/mod.js';
import { parseNoteContent, parseCardTitle } from '/js/NoteUtils.js';

export default function Card({ note, pigment, resource, children }) {
  const href = `/${resource}/${note.id}`;

  function onCardClicked(e) {
    if (!clickedOnButton(e.target) && !clickedOnInCardHyperlink(e.target)) {
      e.preventDefault();
      route(href);
    }
  }

  return html`<div class="card ${pigment.class} darken-border" onClick=${ onCardClicked }>
                <div class="card-body">
                  ${ children }
                  ${ parseCardTitle(note)}
                  ${ parseNoteContent(note) }
                </div>
              </div>`;

}


function clickedOnButton(n) {
  if (!n) {
    return false;
  }

  // svg elements have a property called className but it isn't a string
  // fucking retarded web development.
  if (!(n instanceof SVGElement) && n.className && n.className.includes("button")) {
    return true;
  }

  return clickedOnButton(n.parentNode);
}

function clickedOnInCardHyperlink(n) {
  return n.className.includes("in-note-link");
}
