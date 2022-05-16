import { html, useState } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { finishedEditingCallback, getNoteById, notePigment, partitionPinnedNotes } from '/js/NoteUtils.js';
import { useStateValue } from '/js/StateProvider.js';

import Card from '/js/components/Card.js';
import { ButtonDelete, ButtonEdit, ButtonPinned } from '/js/components/CardButtons.js';
import { TriageDropDown } from '/js/components/TriageDropDown.js';

function Notes() {
  const [state, dispatch] = useStateValue();

  const notes = state.listing.notes;

  const [pin, unpin] = notes ? partitionPinnedNotes(notes) : [[], []];
  const pinnedListing = pin.map((n, i) => {
    return NoteListItem(n, state.categories, i === 0, true);
  });
  const unpinnedListing = unpin.map(n => NoteListItem(n, state.categories));

  const hasCategories = state.categories.length > 0;
  const categoryOptions = state.categories.map(c => html`<option value="${c.title}">${c.title}</option>`);

  return html`
    <div>
      <div class="section-controls-headroom"></div>
      <${CreateNoteForm}/>
      ${ pinnedListing.length > 0 && html`
        <div class="card-holder-pinned">
          <div class="card-holder-pinned-inner">
            ${ pinnedListing }
          </div>
        </div>
     `}
      <div class="card-holder">
        ${ unpinnedListing }
      </div>
    </div>`;
}

function NoteListItem(note, categories, nomargin, halfmargin) {
  const [state, dispatch] = useStateValue();
  const [fullHeight, setFullHeight] = useState(false);

  const resource = 'notes';
  const pigment = notePigment(note.id);

  return html`<${Card} note=${note}
                       nomargin=${nomargin}
                       halfmargin=${halfmargin}
                       resource=${resource}
                       pigment=${pigment}
                       fullHeight=${fullHeight}>
                  <${TriageDropDown} noteId=${note.id}
                                     categories=${categories}
                                     pigment=${pigment}
                                     dispatch=${dispatch}
                                     cardFullHeightFn=${setFullHeight}/>
                  <${ButtonPinned} note=${ note } pigment=${ pigment } dispatch=${dispatch} />
                  <${ButtonDelete} note=${ note } pigment=${ pigment } dispatch=${dispatch} noteKind=${ resource } />
              </${Card}>`;
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
    content,
    pinned: false
  }
}

function CreateNoteForm() {
  const [userText, setUserText] = useState('');
  const [hasFocus, setHasFocus] = useState(false);

  const [state, dispatch] = useStateValue();

  const typeHereMessage = "type note here...";

  function onSubmit(event) {
    event.preventDefault();

    const protoNote = noteFromText(userText);
    if (protoNote) {
      Net.post(`/api/notes`, protoNote).then(note => {
        dispatch({
          type: 'listing-note-appended',
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

  const hasUserContent = userText.trim().length > 0;
  const usingTextArea = hasFocus || hasUserContent;

  const textareaClass = usingTextArea ? "" : "no-user-text";
  const textareaValue = usingTextArea ? userText : typeHereMessage;

  return html`<div class="card-holder-pinned margin-below-top-menu">
                <div class="card-holder-pinned-inner">
                  <form class="add-note-form" onSubmit=${ onSubmit }>
                    <textarea id="content"
                              type="text"
                              name="content"
                              class=${ textareaClass }
                              value=${ textareaValue }
                              onFocus=${ () => setHasFocus(true) }
                              onBlur=${ () => setHasFocus(false) }
                              onInput=${ handleChangeEvent }/>
                    ${usingTextArea && html`<div class="create-button-container">
                                              <input class="create-note-button button save-button"
                                                     type="submit"
                                                     disabled=${!hasUserContent}
                                                     value="Save"/>
                                            </div>`}
                  </form>
                </div>
              </div>`;
}

function Note({ id }) {
  const noteKind = 'notes';

  const [state, dispatch] = useStateValue();
  const [editing, setEditing] = useState(false);
  const [fullHeight, setFullHeight] = useState(true);

  if (!state.listing[noteKind]) {
    // isg todo: fix this
    return html`<div></div>`;
  }

  const noteId = parseInt(id, 10);
  const note = getNoteById(state, noteKind, noteId);
  const pigment = notePigment(id);

  return html`<${Card} onFinishedEditing=${ finishedEditingCallback(dispatch, note, setEditing) }
                       editing=${editing}
                       note=${note}
                       resource=${noteKind}
                       pigment=${pigment}
                       fullHeight=${fullHeight}
                       cardClass="wider-card">
                  <${ButtonEdit} pigment=${ pigment } editing=${ editing } callback=${ setEditing }/>
                  <${TriageDropDown} noteId=${note.id}
                                     categories=${state.categories}
                                     pigment=${pigment}
                                     cardFullHeightFn=${setFullHeight}/>
                  <${ButtonPinned} note=${ note } pigment=${ pigment } dispatch=${dispatch} />
                  <${ButtonDelete} note=${ note } pigment=${ pigment } dispatch=${dispatch} noteKind=${ noteKind } />
              </${Card}>`;
}

export { Notes, Note };
