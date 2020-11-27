import { html, route, Link, useState, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';

import { ensureListingLoaded } from '/js/NoteUtils.js';
import { capitalise } from '/js/JsUtils.js';
import CategorySelect from '/js/components/CategorySelect.js';

import { svgBin } from '/js/svgIcons.js';

function Notes() {
  const [state, dispatch] = useStateValue();

  ensureListingLoaded('notes');

  const notes = state.listing.notes;
  const listing = notes ? notes.map(n => NoteListItem(n, state.triageCategory)) : [];


  function addNewCategoryFn(title) {
    // setCategories(categories.concat(title));

    Net.post(`/api/categories`, { title }).then(newCategory => {
      console.log(newCategory);
      Net.get('/api/categories').then(latestCategories => {
        console.log(latestCategories);
        dispatch({
          type: 'set-categories',
          categories: latestCategories
        });
        setTriageCategory(newCategory);
      });
    });
  }

  function setTriageCategory(triageCategory) {
    dispatch({
      type: 'set-triage-category',
      triageCategory
    });
  }

  return html`
    <div>
      <div class="centre-container">
        <${NoteCreateForm} dispatch=${ dispatch }/>
        <${CategorySelect} category=${state.triageCategory}
                           setCategory=${setTriageCategory}
                           available=${ state.categories }
                           addNewCategoryFn=${addNewCategoryFn}/>
      </div>
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
          type: 'triage-note',
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
        type: 'bin-note',
        note
      });
    });
  }

  const pigmentNum = (note.id % 12) + 1;
  const pigmentClass = pigmentNum < 10 ? `pigment-clock-0${pigmentNum}` : `pigment-clock-${pigmentNum}`;

  const resource = 'notes';
  const href = `/${resource}/${note.id}`;

  const canTriage = !!triageCategory;

  return html`<div class="card ${pigmentClass}">
                <div class="card-body">
                  <h3><${Link} class="${pigmentClass}" href=${ href }>${ note.title }</${Link}></h3>
                  <p>${ note.content }</p>
                  <div class="card-action">
                    ${ canTriage && html`<button class="button" onClick=${ onTriagedClicked }>Triage to ${ triageCategory.title }</button>`}
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

  return html`<form class="add-note-form" onSubmit=${ onSubmit }>
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
