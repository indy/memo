import { h } from "preact";
import { useEffect } from "preact/hooks";

import Net from "../Net";
import { ensureLoaded, notePigment } from "../Utils";
import { AppStateChange, getAppState } from "../AppState";

import Card from "./Card";
import { UnPinnedListing } from "./Listing";

import { Note, NoteKind } from "../types";

function Bin({ path }: { path?: string }) {
    const appState = getAppState();

    useEffect(() => {
        ensureLoaded(appState, NoteKind.Bin);
    }, []);

    AppStateChange.triageDrawerDefaultLabel();

    const notes: Array<Note> = appState.listing.value.bin;
    const listing = notes ? notes.map((n) => BinnedCard(n)) : [];

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
            <UnPinnedListing>{listing}</UnPinnedListing>
        </div>
    );
}

function BinnedCard(note: Note) {
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
        <Card note={note} binned={true} pigment={pigment}>
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

export { Bin };
