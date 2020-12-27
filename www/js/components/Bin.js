import { html, route, Link, useState } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { notePigment, ensureListingLoaded } from '/js/NoteUtils.js';
import { useStateValue } from '/js/StateProvider.js';

import BaseNote from '/js/components/BaseNote.js';
import Card from '/js/components/Card.js';

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
      <div class="section-controls-headroom"/>
      <div class="darken-border">
        ${ listing.length == 0 && html`<h2>Bin is Empty</h2>`}
        ${ listing.length > 0 && html`<h2 class="button" onClick=${ onDeleteClicked }>Permanently Delete</h2>`}
      </div>
      <div class="hr"/>
      <div class="card-holder">
        ${ listing }
      </div>
    </div>`;
}

function NoteListItem(note) {
  const [state, dispatch] = useStateValue();

  const resource = 'bin';
  const pigment = notePigment(note);

  function onUndeleteClicked(e) {
    e.preventDefault();
    Net.post(`/api/bin/${ note.id }/unbin`, note).then(n => {
      dispatch({
        type: 'note-unbinned',
        note
      });
    });
  }

  function onDeleteClicked(e) {
    e.preventDefault();
    Net.delete(`/api/bin/${ note.id }`, {}).then(n => {
      dispatch({
        type: 'note-deleted',
        note
      });
    });
  }

  return html`<${Card} note=${note} resource=${resource} pigment=${pigment}>
                  <div class="card-action" style="border-bottom: 1px solid var(--bg-clock-${pigment.numString}-hi)">
                    <button class="${pigment.classHi} button" onClick=${ onUndeleteClicked }>Undelete</button>
                    <button class="${pigment.classHi} button button-delete" onClick=${ onDeleteClicked }>Really Delete</button>
                  </div>
              </${Card}>`;
}

function BinnedNote({ id }) {
  return html`<${BaseNote} id=${id} noteKind='bin'/>`;
}

export { Bin, BinnedNote };
