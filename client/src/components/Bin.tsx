import { h } from "preact";
import { useState } from "preact/hooks";

import Net from "../Net";
import { notePigment, getNoteById } from "../NoteUtils";
import { AppStateChange, getAppState } from "../AppState";

import Card from "./Card";

import { INote } from "../types";

function Bin({ path }: { path?: string }) {
    const appState = getAppState();

    const notes: Array<INote> = appState.listing.value.bin;
    const listing = notes ? notes.map((n) => NoteListItem(n)) : [];

    function onDeleteClicked(e: MouseEvent) {
        e.preventDefault();

        Net.delete(`/api/bin`, {}).then(() => {
            AppStateChange.binEmptied();
        });
    }

    return (
        <div>
            <div class="button-container darken-border">
                {listing.length == 0 && <div>Bin is Empty</div>}
                {listing.length > 0 && (
                    <div class="button button-delete" onClick={onDeleteClicked}>
                        Permanently Delete
                    </div>
                )}
            </div>
            <div class="hr" />
            <div class="card-holder">{listing}</div>
        </div>
    );
}

function NoteListItem(note: INote) {
    const resource = "bin";
    const pigment = notePigment(note.id);

    function onUndeleteClicked(e: MouseEvent) {
        e.preventDefault();
        Net.post(`/api/bin/${note.id}/unbin`, note).then(() => {
            AppStateChange.noteUnbinned(note);
        });
    }

    function onDeleteClicked(e: MouseEvent) {
        e.preventDefault();
        Net.delete(`/api/bin/${note.id}`, {}).then(() => {
            AppStateChange.noteDeleted(note);
        });
    }

    return (
        <Card note={note} resource={resource} pigment={pigment}>
            <button
                class={`${pigment.classAlt} button card-action-cell`}
                onClick={onUndeleteClicked}
            >
                Undelete
            </button>
            <button
                class={`${pigment.classAlt} button card-action-cell`}
                onClick={onDeleteClicked}
            >
                Really Delete
            </button>
        </Card>
    );
}

function BinnedNote({ id, path }: { id?: string; path?: string }) {
    const noteKind = "bin";

    const appState = getAppState();
    const editing = false;

    if (!appState.listing.value.bin) {
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

    return (
        <Card
            editing={editing}
            note={note}
            resource={noteKind}
            pigment={pigment}
            fullHeight={true}
            cardClass="wider-card"
        ></Card>
    );
}

export { Bin, BinnedNote };
