import { html, route, Link, useState, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';

import { ensureListingLoaded } from '/js/NoteUtils.js';
import { capitalise } from '/js/JsUtils.js';

function Notes() {
  const [state, dispatch] = useStateValue();

  ensureListingLoaded('notes');

  const notes = state.listing.notes;
  const listing = notes ? notes.map(n => NoteListItem(n)) : [];

  return html`
    <div>
      <${NoteCreateForm} dispatch=${ dispatch }/>
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
          type: 'append-note-to-listing',
          note
        });
      });

      setUserText('');
    }
  }

  function handleChangeEvent(event) {
    const newUserText = event.target.value;
    setUserText(newUserText);
  };

  const submitMessage = "Save";
  const disabled = userText.trim().length === 0;

  return html`<div class="form-container">
                <form class="add-note-form" onSubmit=${ onSubmit }>
                  <textarea id="content"
                            type="text"
                            name="content"
                            value=${ userText }
                            onInput=${ handleChangeEvent }/>
                  <br/>
                  <input class="button save-button"
                         type="submit"
                         value=${ submitMessage }
                         disabled=${ disabled }/>
                </form>
              </div>`;
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
