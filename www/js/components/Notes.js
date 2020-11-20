import { html, route, Link, useState, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';

import { ensureListingLoaded } from '/js/NoteUtils.js';
import { capitalise } from '/js/JsUtils.js';

import QuickFindOrCreate from '/js/components/QuickFindOrCreate.js';

function Notes() {
  const [state, dispatch] = useStateValue();
  const resource = 'notes';

  ensureListingLoaded(resource);

  const notes = state.deckkindsListing.notes;
  console.log(notes);

  const listing = buildListing(notes, resource);

  return html`
    <div>
      <h1>${capitalise(resource)}</h1>
      <${QuickFindOrCreate} autocompletes=${[]} resource=${resource} />
      <ul>
        ${ listing }
      </ul>
    </div>`;
}

function buildListing(list, resource) {
  if (!list) {
    return [];
  }

  return list.map(
    (note, i) => {
      const href = `/${resource}/${note.id}`;
      return html`<li>
                    <${Link} class="pigment-fg-${resource}" href=${ href }>${ note.title }</${Link}>
                    <p>${ note.content }</p>
                  </li>`;
    }
  );
}

function Note(props) {
  const [state, dispatch] = useStateValue();

  const noteId = parseInt(props.id, 10);
  const note = state.cache.note[noteId] || { id: noteId };

  const cacheNote = setupCacheNoteFn(state, dispatch, note, 'notes');

  console.log(note);

  // const deckManager = DeckManager({
  //   deck: idea,
  //   title: idea.title,
  //   resource: "ideas",
  //   updateForm: html`<${UpdateIdeaForm} idea=${idea} />`
  // });

  // const created_at_textual = idea.created_at ? formattedDate(idea.created_at) : '';


  return html`
    <article>
      <h1>${ note.title }</h1>
      <p>${ note.content }</p>
    </article>`;
}


function setupCacheNoteFn(state, dispatch, note, resource) {
  function cacheNote(newnote) {
    dispatch({
      type: 'cacheNote',
      id: newnote.id,
      newItem: newnote
    });
  }

  // fetches resource from server if not already in cache
  ensureCorrectNote(state, resource, note.id, cacheNote);

  return cacheNote;
}

function ensureCorrectNote(state, resource, id, cacheNote) {
  const [currentId, setCurrentId] = useState(false);

  if (id !== currentId) {
    // get here on first load and when we're already on a /$NOTE_HOLDER/:id page
    // and follow a Link to another /$NOTE_HOLDER/:id
    // (where $NOTE_HOLDER is the same type)
    //
    setCurrentId(id);

    if(!state.cache.note[id]) {
      // fetch resource from the server
      const url = `/api/${resource}/${id}`;
      Net.get(url).then(note => {
        if (note) {
          cacheNote(note);
        } else {
          console.error(`error: fetchNote for ${url}`);
        }
      });
    }
  }
}


export { Notes, Note };
