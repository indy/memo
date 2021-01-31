import { html, useState } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { notePigment, ensureListingLoaded } from '/js/NoteUtils.js';
import { svgBin } from '/js/svgIcons.js';
import { useStateValue } from '/js/StateProvider.js';

import BaseNote from '/js/components/BaseNote.js';
import Card from '/js/components/Card.js';

function Notes() {
  const [state, dispatch] = useStateValue();

  ensureListingLoaded('notes');

  const notes = state.listing.notes;
  const listing = notes ? notes.map(n => NoteListItem(n, state.categories)) : [];

  const hasCategories = state.categories.length > 0;
  const categoryOptions = state.categories.map(c => html`<option value="${c.title}">${c.title}</option>`);

  return html`
    <div>
      <div class="section-controls-headroom"></div>
      <div class="section-controls darken-border">
        <${CreateNoteForm}/>
      </div>
      <div class="hr"/>
      <div class="card-holder">
        ${ listing }
      </div>
    </div>`;
}

function NoteListItem(note, categories) {
  const [state, dispatch] = useStateValue();
  const [fullHeight, setFullHeight] = useState(false);

  const resource = 'notes';
  const pigment = notePigment(note.id);

  function onDeleteClicked(e) {
    e.preventDefault();
    Net.post(`/api/notes/${ note.id }/bin`, {}).then(n => {
      dispatch({
        type: 'note-binned',
        note
      });
    });
  }

  function onTriageCategorySelected(noteId, category) {
    // console.log(noteId);
    Net.post(`/api/notes/${ noteId }/triage`, category).then(triagedNote => {
      dispatch({
        type: 'note-triaged',
        note: triagedNote
      });
    });
  }

  return html`<${Card} note=${note} resource=${resource} pigment=${pigment} fullHeight=${fullHeight}>
                  <div class="card-action" style="border-bottom: 1px solid var(--bg-clock-${pigment.numString}-hi)">
                    <${TriageDropDown} noteId=${note.id}
                                       categories=${categories}
                                       pigment=${pigment}
                                       cardFullHeightFn=${setFullHeight}
                                       onSelectCallback=${onTriageCategorySelected}/>
                    <button class="${pigment.classHi} button button-delete" onClick=${ onDeleteClicked }>${ svgBin(`--fg-clock-${pigment.numString}`) }</button>
                  </div>
              </${Card}>`;
}

function TriageDropDown({ noteId, categories, pigment, cardFullHeightFn, onSelectCallback }) {
  const [showList, setShowList] = useState(false);

  function onToggleShowList(e) {
    e.preventDefault();
    cardFullHeightFn(!showList);
    setShowList(!showList);
  }

  function onTriageDropDownSelect(e) {
    e.preventDefault();

    const value = e.target.textContent;
    const cat = categories.find(c => c.title === value);

    setShowList(!showList);

    if (cat) {
      onSelectCallback(noteId, cat);
    }
  }

  function buildTriageButton() {
    return html`<button class="${pigment.classHi} button button-height-bodge"
                        onClick=${ onToggleShowList }>
                  <span class="button-title-ellipses">Triage</span>
                </button>`;
  }

  function buildTriageList() {
    let categoryOptions = categories.map(c => html`<li class="triage-dropdown-item  ${pigment.classHi}"
                                                       onClick=${ onTriageDropDownSelect }>
                                                     ${c.title}
                                                   </li>`);
    return html`<div>
                  <button class="${pigment.classHi} button button-height-bodge"
                          onClick=${ onToggleShowList }>
                    Cancel
                  </button>
                  <ul class="triage-dropdown-list">
                    ${categoryOptions}
                  </ul>
                </div>`;
  }

  return html`<div class="triage-dropdown">
                ${ !showList && buildTriageButton()}
                ${ showList && buildTriageList()}
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

function CreateNoteForm() {
  const [userText, setUserText] = useState('');
  const [hasFocus, setHasFocus] = useState(false);

  const [state, dispatch] = useStateValue();

  const typeHereMessage = "type note here...";

  function onSubmit(event){
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

  return html`<form class="add-note-form" onSubmit=${ onSubmit }>
                <textarea id="content"
                          type="text"
                          name="content"
                          class=${ textareaClass }
                          value=${ textareaValue }
                          onFocus=${ () => setHasFocus(true) }
                          onBlur=${ () => setHasFocus(false) }
                          onInput=${ handleChangeEvent }/>
                <br/>
                ${hasUserContent && html`<input class="button save-button"
                       type="submit"
                       value="Save"/>`}

              </form>`;
}

function Note({ id }) {
  return html`<${BaseNote} id=${id} noteKind='notes'/>`;
}

export { Notes, Note };
