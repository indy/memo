import { html, useState } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { ensureListingLoaded, notePigment, partitionPinnedNotes } from '/js/NoteUtils.js';
import { svgBin, svgExpand, svgMinimise, svgPinned, svgUnpinned } from '/js/svgIcons.js';
import { useStateValue } from '/js/StateProvider.js';

import BaseNote from '/js/components/BaseNote.js';
import Card from '/js/components/Card.js';

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
                  <div class="section-controls-headroom"></div>
                  <div>${ triagedSectionsHtml }</div>
                  <div class="hr"/>
                  <div class="section-controls">
                    <${NewCategoryForm }/>
                  </div>
                  <div class="hr"/>
                  <div class="pad-left-1rem pad-top-1rem">${ deletableHtml }</div>
                </div>`;
  }

  return html`<div></div>`;
}

function TriagedCategory({ categoryNotes, categoryTitle }) {
  let [show, setShow] = useState(false);

  function toggleShow() {
    setShow(!show);
  }

  const [pin, unpin] = partitionPinnedNotes(categoryNotes);
  const pinnedListing = pin.map(n => NoteListItem(n));
  const unpinnedListing = unpin.map(n => NoteListItem(n));

  const numNotes = html`<span class='category-num-notes'>${ categoryNotes.length }</span>`;

  if (show) {
    return html`<div>
                  <h1 class="pad-left-1rem" onClick=${ toggleShow }>${ svgMinimise() }${ categoryTitle } ${numNotes}</h1>
                  ${ pinnedListing.length > 0 && html`
                    <div class="card-holder-pinned">
                      ${ pinnedListing }
                    </div>
                 `}
                  <div class="card-holder">
                    ${ unpinnedListing }
                  </div>
                </div>`;
  } else {
    return html`<div>
                  <h1 class="pad-left-1rem" onClick=${ toggleShow }>${ svgExpand() }${ categoryTitle } ${ numNotes }</h1>
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
        type: 'categories-set',
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

  const resource = 'triaged';
  const pigment = notePigment(note.id);

  function onPinnedClicked(e) {
    e.preventDefault();

    let data = {
      ...note,
      pinned: !note.pinned
    };
    Net.put(`/api/notes/${note.id}`, data).then(n => {
      dispatch({
        type: 'note-pinstate-updated',
        note: n
      });
    });
  }

  function onUntriageClicked(e) {
    e.preventDefault();
    Net.post(`/api/triaged/${ note.id }/untriage`, {}).then(n => {
      dispatch({
        type: 'note-untriaged',
        note
      });
    });
  }

  function onDeleteClicked(e) {
    e.preventDefault();
    Net.post(`/api/triaged/${ note.id }/bin`, {}).then(n => {
      dispatch({
        type: 'note-binned',
        note
      });
    });
  }

  return html`<${Card} note=${note} resource=${resource} pigment=${pigment}>
                  <button class="${pigment.classHi} button card-action-cell"
                          onClick=${ onUntriageClicked }>
                    Untriage
                  </button>
                  <button class="${pigment.classHi} button card-action-cell" onClick=${ onPinnedClicked }>
                    ${ note.pinned ? svgPinned(`--fg-clock-${pigment.numString}`) : svgUnpinned(`--fg-clock-${pigment.numString}`) }
                  </button>
                  <button class="${pigment.classHi} button card-action-cell"
                          onClick=${ onDeleteClicked }>
                    ${ svgBin(`--fg-clock-${pigment.numString}`) }
                  </button>
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
    content
  }
}

function TriagedNote({ id }) {
  return html`<${BaseNote} id=${id} noteKind='triaged'/>`;
}

export { TriagedNotes, TriagedNote };
