import { h } from "preact";
import { useState } from "preact/hooks";

import {
    finishedEditingCallback,
    getNoteById,
    notePigment,
    partitionPinnedNotes,
} from "../NoteUtils";
import { getAppState } from "../AppState";

import Card from "./Card";
import { ButtonDelete, ButtonEdit, ButtonPinned } from "./CardButtons";
import { TriageDropDown } from "./TriageDropDown.jsx";
import { CreateNoteForm } from "./CreateNoteForm.jsx";

import { INote, ICategory } from "../types";

function Notes({ path }: { path?: string }) {
    const appState = getAppState();
    const notes = appState.listing.value.notes;

    // partitionPinnedNotes also sorts by id
    const [pin, unpin] = notes ? partitionPinnedNotes(notes) : [[], []];

    const pinnedListing = pin.map((n) =>
        NoteListItem(n, appState.categories.value)
    );
    const unpinnedListing = unpin.map((n) =>
        NoteListItem(n, appState.categories.value)
    );

    return (
        <div>
            <CreateNoteForm />
            {pinnedListing.length > 0 && (
                <div class="card-holder-pinned">
                    <div class="card-holder-pinned-inner">{pinnedListing}</div>
                </div>
            )}
            <div class="card-holder">{unpinnedListing}</div>
        </div>
    );
}

function NoteListItem(note: INote, categories: Array<ICategory>) {
    const [fullHeight, setFullHeight] = useState(false);

    const pigment = notePigment(note.id);

    return (
        <Card
            note={note}
            pigment={pigment}
            fullHeight={fullHeight}
        >
            <TriageDropDown
                noteId={note.id}
                categories={categories}
                pigment={pigment}
                cardFullHeightFn={setFullHeight}
            />
            <ButtonPinned note={note} pigment={pigment} />
            <ButtonDelete note={note} pigment={pigment} />
        </Card>
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
