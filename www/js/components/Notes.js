import { html, route, Link, useState, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';

import { ensureListingLoaded } from '/js/NoteUtils.js';
import { capitalise } from '/js/JsUtils.js';

function Notes() {
  const [state, dispatch] = useStateValue();
  const resource = 'notes';

  ensureListingLoaded(resource);

  const notes = state.listing.notes;
  console.log(notes);

  const listing = buildListing(notes, resource);

  return html`
    <div>
      <h1>${capitalise(resource)}</h1>
      <${NoteCreateForm} dispatch=${ dispatch }/>
      <ul>
        ${ listing }
      </ul>
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

function NoteCreateForm({ dispatch }) {
  const [userText, setUserText] = useState('');

  function onSubmit(event){
    event.preventDefault();

    const protoNote = noteFromText(userText);
    if (protoNote) {
      Net.post(`/api/notes`, protoNote).then(note => {
        dispatch({
          type: 'appendNoteToListing',
          note
        });
      });
    }
  }

  function handleChangeEvent(event) {
    const newUserText = event.target.value;
    setUserText(newUserText);
  };

  const submitMessage = "save it";

  return html`
    <form class="quickfind-form" onSubmit=${ onSubmit }>
      <textarea id="content"
                type="text"
                name="content"
                value=${ userText }
                onInput=${ handleChangeEvent }/>
      <input type="submit" value=${ submitMessage }/>
    </form>
`;
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

function Note({ id }) {
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

export { Notes, Note };
