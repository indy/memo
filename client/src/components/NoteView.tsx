import { h } from "preact";
import { useState } from "preact/hooks";

import { State, Note } from "../types";

import Net from "../Net";
import { notePigment } from "../Utils";
import { getAppState, AppStateChange } from "../AppState";

import TriageDropDown from "./TriageDropDown";
import { ButtonDelete, ButtonEdit, ButtonPinned } from "./CardButtons";
import { CardBase } from "./Card";

export default function NoteView({ id, path }: { id?: string; path?: string }) {
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
        <CardBase
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
        </CardBase>
    );
}

function finishedEditingCallback(note: Note, setEditing: (b: boolean) => void) {
    return function (updatedTitle: string, updatedContent: string) {
        let data = {
            ...note,
            content: updatedContent,
            title: updatedTitle,
        };
        Net.put<Note, Note>(`/api/notes/${note.id}`, data).then((newNote) => {
            AppStateChange.noteContentUpdated(newNote);
            setEditing(false);
        });
    };
}

function getNoteById(state: State, id: number): Note | undefined {
    function search(ns: Array<Note>): Note | undefined {
        return ns.find((n: Note) => n.id === id);
    }

    let res: Note | undefined = search(state.listing.value.notes);
    if (res) {
        return res;
    }

    res = search(state.listing.value.bin);
    if (res) {
        return res;
    }

    for (const key in state.categories.value) {
        let cat = state.categories.value[key];

        let l: Array<Note> | undefined = state.listing.value.category[cat.id];
        if (l != undefined) {
            res = search(l);
            if (res) {
                return res;
            }
        }
    }
    return undefined;
}
