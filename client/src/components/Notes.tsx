import { h } from "preact";
import { useState } from "preact/hooks";

import {
    finishedEditingCallback,
    getNoteById,
    notePigment,
    partitionPinnedNotes,
} from "../NoteUtils";
import { getAppState, AppStateChange } from "../AppState";

import Postit from "./Postit";
import Card from "./Card";
import { ButtonDelete, ButtonEdit, ButtonPinned } from "./CardButtons";
import { TriageDropDown } from "./TriageDropDown";
import { CreateNoteForm } from "./CreateNoteForm";
import { PinnedListing, UnPinnedListing }  from "./Listing";

function Notes({ path }: { path?: string }) {
    const appState = getAppState();
    AppStateChange.triageDrawerDefaultLabel();

    const notes = appState.listing.value.notes;


    let categories = appState.categories.value;
    const [pin, unpin] = partitionPinnedNotes(notes);

    return (
        <div>
            <CreateNoteForm />

            <PinnedListing>
                { pin.map((n) => (<Postit note={n} categories={categories}/>)) }
            </PinnedListing>
            <UnPinnedListing>
                { unpin.map((n) => (<Postit note={n} categories={categories}/>)) }
            </UnPinnedListing>

        </div>
    );
}

function Note({ id, path }: { id?: string; path?: string }) {
    const appState = getAppState();

    const [editing, setEditing] = useState(false);
    const [fullHeight, setFullHeight] = useState(true);

    // just to please the typescript checker
    if (!id) {
        return <div></div>;
    }

    const noteId = parseInt(id, 10);
    const note = getNoteById(appState, noteId)!;
    const pigment = notePigment(noteId);

    if (note.categoryId) {
        if (!appState.listing.value.category[note.categoryId]) {
            // isg todo: fix this
            return <div></div>;
        }
    } else {
        if (!appState.listing.value.notes) {
            // isg todo: fix this
            return <div></div>;
        }
    }

    return (
        <Card
            onFinishedEditing={finishedEditingCallback(note, setEditing)}
            editing={editing}
            note={note}
            pigment={pigment}
            fullHeight={fullHeight}
            cardClass="wider-card"
        >
            <ButtonEdit
                pigment={pigment}
                editing={editing}
                callback={setEditing}
            />
            <TriageDropDown
                noteId={note.id}
                categories={appState.categories.value}
                pigment={pigment}
                cardFullHeightFn={setFullHeight}
            />
            <ButtonPinned note={note} pigment={pigment} />
            <ButtonDelete note={note} pigment={pigment} />
        </Card>
    );
}

export { Notes, Note };
