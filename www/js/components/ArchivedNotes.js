import { html, route, Link, useState, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';

import { ensureListingLoaded } from '/js/NoteUtils.js';
import { capitalise } from '/js/JsUtils.js';

function ArchivedNotes() {
  const [state, dispatch] = useStateValue();

  ensureListingLoaded('archived-notes');

  const notes = state.listing['archived-notes'];
  const listing = notes ? notes.map(n => NoteListItem(n, dispatch)) : [];

  return html`
    <div>
      <ul>
        ${ listing }
      </ul>
    </div>`;
}

function NoteListItem(note, dispatch) {
  function onDeleteClicked(e) {
    e.preventDefault();
    // Net.post(`/api/notes/${ note.id }/archive`, {}).then(archivedNote => {
    //   console.log(archivedNote);
    // });
  }

  const resource = 'archived-notes';
  const href = `/${resource}/${note.id}`;
  return html`<li>
                <${Link} class="pigment-fg-${resource}" href=${ href }>${ note.title }</${Link}>
                <p>${ note.content }</p>
                <button onClick=${ onDeleteClicked }>Delete</button>
              </li>`;
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

function ArchivedNote({ id }) {
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

export { ArchivedNotes, ArchivedNote };
