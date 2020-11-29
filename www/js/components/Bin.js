import { html, route, Link, useState, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';

import { ensureListingLoaded } from '/js/NoteUtils.js';
import { capitalise } from '/js/JsUtils.js';

function Bin() {
  const [state, dispatch] = useStateValue();

  ensureListingLoaded('bin');

  const notes = state.listing.bin;
  const listing = notes ? notes.map(n => NoteListItem(n)) : [];


  function onDeleteClicked(e) {
    e.preventDefault();

    Net.delete(`/api/bin`, {}).then(() => {
      dispatch({
        type: 'bin-emptied'
      });
    });
  }

  return html`
    <div>
      <div class="section-controls">
        ${ listing.length == 0 && html`<h2>Bin is Empty</h2>`}
        ${ listing.length > 0 && html`<h2 class="button" onClick=${ onDeleteClicked }>Really Delete All Notes in Bin</h2>`}
      </div>
      <div class="hr"/>
      <div class="card-holder">
        ${ listing }
      </div>
    </div>`;
}

function NoteListItem(note) {
  const [state, dispatch] = useStateValue();

  function onDeleteClicked(e) {
    e.preventDefault();
    Net.delete(`/api/bin/${ note.id }`, {}).then(n => {
      dispatch({
        type: 'note-deleted',
        note
      });
    });
  }

  function onUndeleteClicked(e) {
    e.preventDefault();
    Net.post(`/api/bin/${ note.id }/unbin`, note).then(n => {
      dispatch({
        type: 'note-unbinned',
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
                    <button class="button" onClick=${ onUndeleteClicked }>Undelete</button>
                    <button class="button button-delete" onClick=${ onDeleteClicked }>Really Delete</button>
                  </div>
                </div>
              </div>`;
}

export { Bin };
