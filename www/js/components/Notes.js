import { html, route, Link, useState, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';

import { ensureListingLoaded } from '/js/NoteUtils.js';
import { capitalise } from '/js/JsUtils.js';

import { svgBin } from '/js/svgIcons.js';

function setTriageCategory(dispatch, triageCategory) {
  dispatch({
    type: 'triage-category-set',
    triageCategory
  });
}

function Notes() {
  const [state, dispatch] = useStateValue();

  ensureListingLoaded('notes');

  const notes = state.listing.notes;
  const listing = notes ? notes.map(n => NoteListItem(n, state.triageCategory)) : [];

  function onCategorySelectChange(e) {
    const value = e.target.value;
    const category = state.categories.find(c => c.title === value);
    console.assert(category, `${ category } should be part of the state's categories`);
    setTriageCategory(dispatch, category);
  }

  const hasCategories = state.categories.length > 0;
  const categoryOptions = state.categories.map(c => html`<option value="${c.title}">${c.title}</option>`);

  if (hasCategories && !state.triageCategory) {
    // set the default triage category
    setTriageCategory(dispatch, state.categories[0]);
  }

  return html`
    <div>
      <div class="section-controls darken-border">
        <${CreateNoteForm}/>
        ${ hasCategories && html`<div class="pad-top-1em">
          <label for="categories">Triage Categories:</label>
          <select onChange=${ onCategorySelectChange } name="categories" id="categories">
            ${ categoryOptions }
          </select>
        </div>`}
      </div>
      <div class="hr"/>
      <div class="card-holder">
        ${ listing }
      </div>
    </div>`;
}

function NoteListItem(note, triageCategory) {
  const [state, dispatch] = useStateValue();

  function onTriagedClicked(e) {
    e.preventDefault();

    if (triageCategory) {
      console.log(triageCategory);
      Net.post(`/api/notes/${ note.id }/triage`, triageCategory).then(triagedNote => {
        dispatch({
          type: 'note-triaged',
          note: triagedNote
        });
      });
    } else {
      console.error("trying to triage a note without first selecting a category");
    }
  }

  function onDeleteClicked(e) {
    e.preventDefault();
    Net.post(`/api/notes/${ note.id }/bin`, {}).then(n => {
      dispatch({
        type: 'note-binned',
        note
      });
    });
  }

  const pigmentNum = (note.id % 12) + 1;
  const pigmentClass = pigmentNum < 10 ? `pigment-clock-0${pigmentNum}` : `pigment-clock-${pigmentNum}`;

  const resource = 'notes';
  const href = `/${resource}/${note.id}`;

  const canTriage = !!triageCategory;

  return html`<div class="card ${pigmentClass} darken-border">
                <div class="card-body">
                  <h3><${Link} class="${pigmentClass}" href=${ href }>${ note.title }</${Link}></h3>
                  <p>${ note.content }</p>
                  <div class="card-action">
                    ${ canTriage && html`<button class="button button-height-bodge" onClick=${ onTriagedClicked }>Triage to ${ triageCategory.title }</button>`}
                    <button class="button button-delete" onClick=${ onDeleteClicked }>${ svgBin() }</button>
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

function CreateNoteForm() {
  const [userText, setUserText] = useState('');
  const [state, dispatch] = useStateValue();

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

  const submitMessage = "Save";
  const disabled = userText.trim().length === 0;

  return html`<form class="add-note-form" onSubmit=${ onSubmit }>
                <input class="button save-button"
                       type="submit"
                       value=${ submitMessage }
                       disabled=${ disabled }/>
                <br/>
                <textarea id="content"
                          type="text"
                          name="content"
                          value=${ userText }
                          onInput=${ handleChangeEvent }/>
              </form>`;
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
