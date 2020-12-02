import { html, Link, useState } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { parseNoteContent, ensureListingLoaded } from '/js/NoteUtils.js';
import { svgBin, svgExpand, svgMinimise } from '/js/svgIcons.js';
import { useStateValue } from '/js/StateProvider.js';

import BaseNote from '/js/components/BaseNote.js';

function TriagedNotes() {
  const [state, dispatch] = useStateValue();

  ensureListingLoaded('triaged');

  const notes = state.listing.triaged;

  if (state.categories && state.listing && state.listing.triaged) {

    // place triaged notes in their categories
    const partitionByCategoryId = state.categories.reduce((acc, category) => {
      acc[category.id] = state.listing.triaged.filter(n => n.category_id === category.id);
      return acc;
    }, {});

    // keep the categories that contain notes
    const triagedByCategory = {};
    for (const categoryId in partitionByCategoryId) {
      if (partitionByCategoryId[categoryId].length !== 0) {
        triagedByCategory[categoryId] = partitionByCategoryId[categoryId];
      }
    }

    const triagedSectionsHtml = [];
    const deletableHtml = [];

    state.categories.forEach(category => {
      if (triagedByCategory[category.id]) {
        triagedSectionsHtml.push(html`<${TriagedCategory}
                                        categoryNotes=${ triagedByCategory[category.id] }
                                        categoryTitle=${ category.title }/>`);
      } else {
        deletableHtml.push(html`<${DeletableCategory} category=${category}/>`);
      }
    });

    return html`<div>
                  <div class="section-controls">
                    <${NewCategoryForm }/>
                  </div>
                  <div class="hr"/>
                  <div>${ triagedSectionsHtml }</div>
                  <div class="hr"/>
                  <div class="pad-left-1rem pad-top-1rem">${ deletableHtml }</div>
                </div>`;
  }

  return html`<div></div>`;
}

function TriagedCategory({ categoryNotes, categoryTitle }) {
  let [show, setShow] = useState(true);

  function toggleShow() {
    setShow(!show);
  }

  const notesHtml = categoryNotes.map(n => NoteListItem(n));

  if (show) {
    return html`<div>
                  <h1 class="pad-left-1rem" onClick=${ toggleShow }>${ svgMinimise() }${ categoryTitle }</h1>
                  <div class="card-holder">
                    ${ notesHtml }
                  </div>
                </div>`;

  } else {
    return html`<div>
                  <h1 class="pad-left-1rem" onClick=${ toggleShow }>${ svgExpand() }${ categoryTitle }</h1>
                </div>`;
  }
}

function DeletableCategory({ category }) {
  const [state, dispatch] = useStateValue();

  function onDeleteClicked(e) {
    e.preventDefault();

    Net.delete(`/api/categories/${ category.id }`, {}).then(c => {
      dispatch({
        type: 'category-deleted',
        deletedCategory: category
      });
    });
  }

  return html`<div>
                <button class="bg2 button" onClick=${ onDeleteClicked }>${ svgBin("--fg") }</button>
                <span class="pad-left-1rem">Delete ${category.title}</span>
              </div>`;
}

function NewCategoryForm() {
  const [state, dispatch] = useStateValue();

  const [localState, setLocalState] = useState({
    text: '',
    disabled: true
  });

  function onInput(e) {
    const value = e.target.value;
    const found = state.categories.find(c => c.title === value);

    const newState = {
      ...localState,
      disabled: !!found || value.length === 0,
      text: value
    };

    setLocalState(newState);
  }

  function newCategorySubmit(e) {
    e.preventDefault();

    Net.post(`/api/categories`, { title: localState.text }).then(latestCategories => {
      dispatch({
        type: 'set-categories',
        categories: latestCategories
      });
      setLocalState({...localState, text: ''});
    });
  }

  return html`
<form class="form-inline" onSubmit=${ newCategorySubmit }>
  <label class="form-inline-item" for="new-category">New category:</label>
  <input class="form-inline-item"
         type="text"
         id="new-category"
         name="new-category"
         value=${localState.text}
         onInput=${ onInput }/>
  <input class="triaged-note-create-button-bodge form-inline-item button save-button"
         type="submit"
         value="Create"
         disabled=${ localState.disabled }/>
</form>`;
}

function NoteListItem(note) {
  const [state, dispatch] = useStateValue();

  function onDeleteClicked(e) {
    e.preventDefault();
    Net.post(`/api/triaged/${ note.id }/bin`, {}).then(n => {
      dispatch({
        type: 'note-binned',
        note
      });
    });
  }

  const pigmentNum = (note.id % 12) + 1;
  const pigmentNumString = pigmentNum < 10 ? `0${pigmentNum}` : `${pigmentNum}`;
  const pigmentClass = `pigment-clock-${pigmentNumString}`;
  const pigmentClassHi = `${pigmentClass}-hi`;

  const resource = 'triaged';
  const href = `/${resource}/${note.id}`;

  return html`<div class="card ${pigmentClass}">
                <div class="card-body">
                  <div class="card-action">
                   <button class="${pigmentClassHi} button button-height-bodge">Untriage</button>
                    <button class="${pigmentClassHi} button button-delete" onClick=${ onDeleteClicked }>${ svgBin(`--fg-clock-${pigmentNumString}`) }</button>
                  </div>
                  <h3><${Link} class="${pigmentClass}" href=${ href }>${ note.title }</${Link}></h3>
                  ${ parseNoteContent(note) }
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

function TriagedNote({ id }) {
  return html`<${BaseNote} id=${id} noteKind='triaged'/>`;
}

export { TriagedNotes, TriagedNote };
