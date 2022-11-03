import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import Net from '../Net';
import { finishedEditingCallback, getNoteById, notePigment, partitionPinnedNotes } from '../NoteUtils';
import { AppStateChange, getAppState } from '../AppState';

import Card from './Card';
import { ButtonDelete, ButtonEdit, ButtonPinned } from './CardButtons';
import { TriageDropDown } from './TriageDropDown.jsx';

import { INote, ICategory } from "../types";

function Notes({ path }: { path?: string }) {
    const appState = getAppState();
    const notes = appState.listing.value.notes;
    const [pin, unpin] = notes ? partitionPinnedNotes(notes) : [[], []];

    const pinnedListing = pin.map(n => NoteListItem(n, appState.categories.value));
    const unpinnedListing = unpin.map(n => NoteListItem(n, appState.categories.value));

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

function NoteListItem(note: INote, categories: Array<ICategory>) {
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
                               cardFullHeightFn={setFullHeight}/>
               <ButtonPinned note={ note } pigment={ pigment }  />
               <ButtonDelete note={ note } pigment={ pigment } noteKind={ resource } />
           </Card>
}

function noteFromText(text: string) {
    const lines = text.split("\n");

    const title = lines.shift();
    if (title) {
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
}

const USER_TEXT = 'user-text';

function CreateNoteForm() {
    const [userText, setUserText] = useState(window.localStorage.getItem(USER_TEXT) || '');
    const [hasFocus, setHasFocus] = useState(false);

    const typeHereMessage = "type note here...";

    useEffect(() => {
        window.localStorage.setItem(USER_TEXT, userText);
    }, [userText]);

    function handleChangeEvent(event: any) {
        const newUserText = event.target.value;
        setUserText(newUserText);
    };

    const hasUserContent = userText.trim().length > 0;
    const usingTextArea = hasFocus || hasUserContent;

    const textareaValue = usingTextArea ? userText : typeHereMessage;

    function onMouseDown() {
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
                AppStateChange.listingNoteAppended(note);
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
                                                onMouseDown={ onMouseDown }
                                                disabled={!hasUserContent}
                                                value="Save"/>
                                     </div>}
               </div>
           </div>
}

function Note({ id, path }: { id?: string, path?: string }) {
    const noteKind = 'notes';

    const appState = getAppState();

    const [editing, setEditing] = useState(false);
    const [fullHeight, setFullHeight] = useState(true);

    if (!appState.listing.value[noteKind]) {
        // isg todo: fix this
        return <div></div>;
    }

    // just to please the typescript checker
    if (!id) {
        return <div></div>;
    }

    const noteId = parseInt(id, 10);
    const note = getNoteById(appState, noteKind, noteId);
    const pigment = notePigment(noteId);

    return <Card onFinishedEditing={ finishedEditingCallback(note, setEditing) }
                 editing={editing}
                 note={note}
                 resource={noteKind}
                 pigment={pigment}
                 fullHeight={fullHeight}
                 cardClass="wider-card">
               <ButtonEdit pigment={ pigment } editing={ editing } callback={ setEditing }/>
               <TriageDropDown noteId={note.id}
                               categories={appState.categories.value}
                               pigment={pigment}
                               cardFullHeightFn={setFullHeight}/>
               <ButtonPinned note={ note } pigment={ pigment } />
               <ButtonDelete note={ note } pigment={ pigment } noteKind={ noteKind } />
           </Card>
}

export { Notes, Note };
