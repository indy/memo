import { html, route, Link, useState, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';

import { ensureListingLoaded } from '/js/NoteUtils.js';
import { capitalise } from '/js/JsUtils.js';

function TriagedNotes() {
  const [state, dispatch] = useStateValue();

  ensureListingLoaded('triaged-notes');

  const notes = state.listing['triaged-notes'];
  const listing = notes ? notes.map((n, i) => NoteListItem(n, i)) : [];

  return html`
    <div>
      <div class="card-holder">
        ${ listing }
      </div>
    </div>`;
}

function NoteListItem(note, i) {
  // const [state, dispatch] = useStateValue();

  function onDeleteClicked(e) {
    e.preventDefault();
    // Net.post(`/api/notes/${ note.id }/archive`, {}).then(triagedNote => {
    //   console.log(triagedNote);
    // });
  }

  const pigmentNum = (i % 12) + 1;
  const pigmentClass = pigmentNum < 10 ? `pigment-clock-0${pigmentNum}` : `pigment-clock-${pigmentNum}`;

  const resource = 'triaged-notes';
  const href = `/${resource}/${note.id}`;

  return html`<div class="card ${pigmentClass}">
                <div class="card-body">
                  <h5 class="card-title">
                    <${Link} class="${pigmentClass}" href=${ href }>${ note.title }</${Link}>
                  </h5>
                  <p class="card-text">${ note.content }</p>
                  <div class="card-action">
                    <button onClick=${ onDeleteClicked }>Delete</button>
                  </div>
                </div>
              </div>`;

}

function noteFromText(text) {
  const lines = text.split("\n");

  const title = lines.shift();
  const content = lines.join("\n").trim();

  if (title.length === 0 && content.length === 0) {
    return null;
  }

  return {
    title,
    content
  }
}

function TriagedNote({ id }) {
  const [state, dispatch] = useStateValue();

  function getNoteById(id) {
    return state.listing.notes.find(n => n.id === id);
  }

  const noteId = parseInt(id, 10);
  const note = getNoteById(noteId);

  return html`
    <article>
      <h1>${ note.title }</h1>
      <p>${ note.content }</p>
    </article>`;
}

export { TriagedNotes, TriagedNote };