import { html, route, useState } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { parseNoteContent, parseNoteTitle, ensureListingLoaded } from '/js/NoteUtils.js';
import { useStateValue } from '/js/StateProvider.js';
import { svgBin } from '/js/svgIcons.js';

export default function BaseNote({ id, noteKind }) {
  const [state, dispatch] = useStateValue();

  const [localState, setLocalState] = useState({
    editing: false,
    userContent: undefined,
    userTitle: undefined
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

  function handleChangeTitle(event) {
    const newUserText = event.target.value;
    setLocalState({
      ...localState,
      userTitle: newUserText
    })
  };

  function handleChangeContent(event) {
    const newUserText = event.target.value;
    setLocalState({
      ...localState,
      userContent: newUserText
    })
  };


  function getNoteById(id) {
    return state.listing[noteKind].find(n => n.id === id);
  }

  const noteId = parseInt(id, 10);
  const note = getNoteById(noteId);

  let shouldSetContent = false;
  let shouldSetTitle = false;

  if (note.content && localState.userContent === undefined) {
    shouldSetContent = true;
  }
  if (note.title && localState.userTitle === undefined) {
    shouldSetTitle = true;
  }

  if (shouldSetContent || shouldSetTitle) {
    setLocalState({
      ...localState,
      userTitle: shouldSetTitle ? note.title : localState.userTitle,
      userContent: shouldSetContent ? note.content : localState.userContent
    });
  }

  function onSaveClicked(e) {
    e.preventDefault();

    let data = {
      ...note,
      content: localState.userContent,
      title: localState.userTitle
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
      ${ !localState.editing && parseNoteTitle(note) }
      ${ !localState.editing && parseNoteContent(note) }
      ${ localState.editing && html`
        <div class="edit">
          <input type="text" value=${localState.userTitle} onInput=${ handleChangeTitle }/>
          <br/><br/>
          <textarea type="text" value=${ localState.userContent } onInput=${ handleChangeContent }/>
          <br/>
        </div>
    `}
<div class="button-container">
      ${ localState.editing && html`<button class="button save-button" onClick=${ onSaveClicked }>Save</button>`}
      <button class="button" onClick=${ onEditClicked }>${ editButtonText }</button>
      <button class="button bin-button" onClick=${ onDeleteClicked }>${ svgBin(`--fg1`) }</button>
</div>
    </article>`;

}
