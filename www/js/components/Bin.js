import { html, Link, useState } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { parseNoteContent, ensureListingLoaded } from '/js/NoteUtils.js';
import { useStateValue } from '/js/StateProvider.js';

import BaseNote from '/js/components/BaseNote.js';

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
  const pigmentClassHi = `${pigmentClass}-hi`;

  const resource = 'bin';
  const href = `/${resource}/${note.id}`;

  return html`<div class="card ${pigmentClass}">
                <div class="card-body">
                  <div class="card-action">
                    <button class="${pigmentClassHi} button" onClick=${ onUndeleteClicked }>Undelete</button>
                    <button class="${pigmentClassHi} button button-delete" onClick=${ onDeleteClicked }>Really Delete</button>
                  </div>
                  <h3><${Link} class="${pigmentClass}" href=${ href }>${ note.title }</${Link}></h3>
                  ${ parseNoteContent(note) }
                </div>
              </div>`;
}

function BinnedNote({ id }) {
  return html`<${BaseNote} id=${id} noteKind='bin'/>`;
}

export { Bin, BinnedNote };
