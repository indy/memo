import { html, route, useState } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { parseNoteContent, parseNoteTitle, ensureListingLoaded } from '/js/NoteUtils.js';
import { useStateValue } from '/js/StateProvider.js';
import { svgBin } from '/js/svgIcons.js';

export default function BaseNote({ id, noteKind }) {
  const [state, dispatch] = useStateValue();

  const [localState, setLocalState] = useState({
    editing: false,
    userText: undefined
  });

  ensureListingLoaded(noteKind);

  if (!state.listing[noteKind]) {
    return html`<article/>`;
  }

  function onEditClicked(e) {
    e.preventDefault();

    setLocalState({
      ...localState,
      editing: !localState.editing
    })
  }

  function handleChangeEvent(event) {
    const newUserText = event.target.value;
    setLocalState({
      ...localState,
      userText: newUserText
    })
  };


  function getNoteById(id) {
    return state.listing[noteKind].find(n => n.id === id);
  }

  const noteId = parseInt(id, 10);
  const note = getNoteById(noteId);

  if (note.content && localState.userText === undefined) {
    setLocalState({
      ...localState,
      userText: note.content
    });
  }

  function onSaveClicked(e) {
    e.preventDefault();

    let data = {
      ...note,
      content: localState.userText
    };
    Net.put(`/api/notes/${note.id}`, data).then(newNote => {
      dispatch({
        type: 'note-content-updated',
        note: newNote
      });
      setLocalState({
        ...localState,
        editing: false
      });
    });
  }

  function onDeleteClicked(e) {
    e.preventDefault();
    Net.post(`/api/notes/${ note.id }/bin`, {}).then(n => {
      dispatch({
        type: 'note-binned',
        note
      });
      route('/');
    });
  }


  let editButtonText = localState.editing ? "Cancel Editing" : "Edit";

  return html`
    <article>
      ${ parseNoteTitle(note) }
      ${!localState.editing && html`${ parseNoteContent(note) } `}
      ${ localState.editing && html`
        <div class="edit">
          <textarea type="text" value=${ localState.userText } onInput=${ handleChangeEvent }/>
          <br/>
          <button class="button" onClick=${ onSaveClicked }>Save</button>
        </div>
      `}
      <button class="button" onClick=${ onDeleteClicked }>${ svgBin(`--fg1`) }</button>
      <button class="button" onClick=${ onEditClicked }>${ editButtonText }</button>
    </article>`;
}
