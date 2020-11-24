import { html, route, Link, useState, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';

import { ensureListingLoaded } from '/js/NoteUtils.js';
import { capitalise } from '/js/JsUtils.js';

function Bin() {
  const [state, dispatch] = useStateValue();

  //  ensureListingLoaded('notes');


  //  const notes = state.listing.notes;
  const notes = [];
  const listing = notes ? notes.map(n => NoteListItem(n)) : [];

  return html`
    <div>
      <div class="card-holder">
        ${ listing }
      </div>
    </div>`;
}

function NoteListItem(note) {
  const [state, dispatch] = useStateValue();

  function onTriagedClicked(e) {
    e.preventDefault();
    Net.post(`/api/notes/${ note.id }/triage`, {}).then(triagedNote => {
      dispatch({
        type: 'triage-note',
        note: triagedNote
      });
    });
  }

  function onDeleteClicked(e) {
    e.preventDefault();
    Net.delete(`/api/notes/${ note.id }`, {}).then(n => {
      dispatch({
        type: 'delete-note',
        note
      });
    });
  }

  const pigmentNum = (note.id % 12) + 1;
  const pigmentClass = pigmentNum < 10 ? `pigment-clock-0${pigmentNum}` : `pigment-clock-${pigmentNum}`;

  const resource = 'notes';
  const href = `/${resource}/${note.id}`;

  return html`<div class="card ${pigmentClass}">
                <div class="card-body">
                  <h3><${Link} class="${pigmentClass}" href=${ href }>${ note.title }</${Link}></h3>
                  <p>${ note.content }</p>
                  <div class="card-action">
                    <button class="button" onClick=${ onTriagedClicked }>Triage</button>
                    <button class="button button-delete" onClick=${ onDeleteClicked }>Delete</button>
                  </div>
                </div>
              </div>`;
}

export { Bin };
