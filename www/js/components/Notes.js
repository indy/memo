import { html, route, Link, useState, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';

import { ensureListingLoaded } from '/js/NoteUtils.js';
import { capitalise } from '/js/JsUtils.js';

function Notes() {
  const [state, dispatch] = useStateValue();
  const resource = 'notes';

  ensureListingLoaded(resource);

  const notes = state.deckkindsListing.notes;
  console.log(notes);

  return html`
    <div>
      <h1>${capitalise(resource)}</h1>
    </div>`;}

function Note() {
}

export { Notes, Note };
