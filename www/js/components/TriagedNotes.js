import { html, useState } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { finishedEditingCallback, getNoteById, notePigment, partitionPinnedNotes } from '/js/NoteUtils.js';
import { svgBin, svgExpand, svgMinimise, svgPinned, svgUnpinned } from '/js/svgIcons.js';
import { useStateValue } from '/js/StateProvider.js';

import Card from '/js/components/Card.js';
import { ButtonUntriage, ButtonDelete, ButtonEdit, ButtonPinned } from '/js/components/CardButtons.js';
import { TriageDropDown } from '/js/components/TriageDropDown.js';

function TriagedNotes() {
  const [state, dispatch] = useStateValue();

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
                      <div class="card-holder-pinned-inner">
                        ${ pinnedListing }
                      </div>
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

  return html`<${Card} note=${note} resource=${resource} pigment=${pigment}>
                  <${ButtonUntriage} note=${ note } pigment=${pigment} dispatch=${dispatch} />
                  <${ButtonPinned} note=${ note } pigment=${ pigment } dispatch=${dispatch} />
                  <${ButtonDelete} note=${ note } pigment=${ pigment } dispatch=${dispatch} noteKind=${ resource } />
              </${Card}>`;
}

function TriagedNote({ id }) {
  const noteKind = 'triaged';

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
                                     dispatch=${dispatch}
                                     cardFullHeightFn=${setFullHeight}/>
                  <${ButtonPinned} note=${ note } pigment=${ pigment } dispatch=${dispatch} />
                  <${ButtonDelete} note=${ note } pigment=${ pigment } dispatch=${dispatch} noteKind=${ noteKind } />
              </${Card}>`;
}

export { TriagedNotes, TriagedNote };
