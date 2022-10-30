import { h, Fragment, useState, useEffect } from '../../lib/preact/mod.js';

import Net from '../Net.js';
import { finishedEditingCallback, getNoteById, notePigment, partitionPinnedNotes } from '../NoteUtils.js';
import { getAppState } from '../AppState.jsx';

import Card from './Card.jsx';
import { ButtonDelete, ButtonEdit, ButtonPinned } from './CardButtons.jsx';
import { TriageDropDown } from './TriageDropDown.jsx';

function Notes() {
    const [state, dispatch] = getAppState();

    const notes = state.listing.notes;

    const [pin, unpin] = notes ? partitionPinnedNotes(notes) : [[], []];
    const pinnedListing = pin.map(n => NoteListItem(n, state.categories));
    const unpinnedListing = unpin.map(n => NoteListItem(n, state.categories));

    const hasCategories = state.categories.length > 0;
    const categoryOptions = state.categories.map(c => <option value="{c.title}">{c.title}</option>);

    return <div>
               <CreateNoteForm/>
               { pinnedListing.length > 0 &&
                 <div class="card-holder-pinned">
                     <div class="card-holder-pinned-inner">
                         { pinnedListing }
                     </div>
                 </div>
               }
               <div class="card-holder">
                   { unpinnedListing }
               </div>
           </div>
}

function NoteListItem(note, categories) {
    const [state, dispatch] = getAppState();
    const [fullHeight, setFullHeight] = useState(false);

    const resource = 'notes';
    const pigment = notePigment(note.id);

    return <Card note={note}
                 resource={resource}
                 pigment={pigment}
                 fullHeight={fullHeight}>
               <TriageDropDown noteId={note.id}
                               categories={categories}
                               pigment={pigment}
                               dispatch={dispatch}
                               cardFullHeightFn={setFullHeight}/>
               <ButtonPinned note={ note } pigment={ pigment } dispatch={dispatch} />
               <ButtonDelete note={ note } pigment={ pigment } dispatch={dispatch} noteKind={ resource } />
           </Card>
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

const USER_TEXT = 'user-text';

function CreateNoteForm() {
    const [userText, setUserText] = useState(window.localStorage.getItem(USER_TEXT) || '');
    const [hasFocus, setHasFocus] = useState(false);

    const [state, dispatch] = getAppState();

    const typeHereMessage = "type note here...";

    useEffect(() => {
        window.localStorage.setItem(USER_TEXT, userText);
    }, [userText]);

    function handleChangeEvent(event) {
        const newUserText = event.target.value;
        setUserText(newUserText);
    };

    const hasUserContent = userText.trim().length > 0;
    const usingTextArea = hasFocus || hasUserContent;

    const textareaValue = usingTextArea ? userText : typeHereMessage;

    function onMouseDown(e) {
        /*
          NOTE: why not use a form and have logic in a submit function?
          With the save button below the textarea then the following will occur:
          The user clicks submit, the textarea will lose focus and shrink back
          in size, this will shift the save button up, away from the pointer
          and the onMouseUp won't be sent to the save button, resulting in no
          click event

          The workaround is either to have the save button above the textarea
          and use the normal submit form logic, or, as we're doing here just
          intercept the onMouseDown event and treat that as the trigger for
          saving the note.
        */
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

    return <div class="form-holder card-holder-pinned">
               <div class="card-holder-pinned-inner">
                   <textarea id="content"
                             type="text"
                             name="content"
                             class="bigger-when-focused"
                             value={ textareaValue }
                             onFocus={ () => setHasFocus(true) }
                             onBlur={ () => setHasFocus(false) }
                             onInput={ handleChangeEvent }/>
                   {usingTextArea && <div class="button-container">
                                         <input class="create-note-button button save-button"
                                                type="submit"
                                                onmousedown={ onMouseDown }
                                                disabled={!hasUserContent}
                                                value="Save"/>
                                     </div>}
               </div>
           </div>
}

function Note({ id }) {
    const noteKind = 'notes';

    const [state, dispatch] = getAppState();
    const [editing, setEditing] = useState(false);
    const [fullHeight, setFullHeight] = useState(true);

    if (!state.listing[noteKind]) {
        // isg todo: fix this
        return <div></div>;
    }

    const noteId = parseInt(id, 10);
    const note = getNoteById(state, noteKind, noteId);
    const pigment = notePigment(id);

    return <Card onFinishedEditing={ finishedEditingCallback(dispatch, note, setEditing) }
                 editing={editing}
                 note={note}
                 resource={noteKind}
                 pigment={pigment}
                 fullHeight={fullHeight}
                 cardClass="wider-card">
               <ButtonEdit pigment={ pigment } editing={ editing } callback={ setEditing }/>
               <TriageDropDown noteId={note.id}
                               categories={state.categories}
                               pigment={pigment}
                               cardFullHeightFn={setFullHeight}/>
               <ButtonPinned note={ note } pigment={ pigment } dispatch={dispatch} />
               <ButtonDelete note={ note } pigment={ pigment } dispatch={dispatch} noteKind={ noteKind } />
           </Card>
}

export { Notes, Note };
