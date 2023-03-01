import { h } from "preact";
import { useState, useEffect } from "preact/hooks";

import Net from "../Net";
import { getTriageLabel } from "../AppUtils";
import {
    finishedEditingCallback,
    getNoteById,
    notePigment,
    partitionPinnedNotes,
} from "../NoteUtils";
import { getAppState, AppStateChange } from "../AppState";

import DeletableCategory from "./DeletableCategory";
import Postit from "./Postit";
import Card from "./Card";
import { ButtonDelete, ButtonEdit, ButtonPinned } from "./CardButtons";
import { TriageDropDown } from "./TriageDropDown";
import { CreateNoteForm } from "./CreateNoteForm";
import { PinnedListing, UnPinnedListing } from "./Listing";

import { Note, NoteKind, LoadState } from "../types";

function Notes({ path, categoryId }: { path?: string; categoryId?: string }) {
    const appState = getAppState();

    useEffect(() => {
        if (categoryId) {
            let cid = parseInt(categoryId, 10);
            if (!appState.loaded.value.category[cid]
                || appState.loaded.value.category[cid] === LoadState.NotLoaded) {
                let loadingState = { ...appState.loaded.value };
                loadingState.category[cid] = LoadState.Loading;
                AppStateChange.setLoadingState(loadingState);

                Net.get<Array<Note>>(`/api/categories/${cid}/notes`).then((notes) => {
                    AppStateChange.loadedNotes(notes, NoteKind.Category, cid);
                });
            }
        } else {
            if (appState.loaded.value.notes === LoadState.NotLoaded) {
                let loadingState = {
                    ...appState.loaded.value,
                    notes: LoadState.Loading,
                }
                AppStateChange.setLoadingState(loadingState);

                Net.get<Array<Note>>(`/api/notes`).then((notes) => {
                    AppStateChange.loadedNotes(notes, NoteKind.Inbox);
                });
            }
        }
    }, [categoryId]);

    let notes: Array<Note> = [];
    let cid: undefined | number = undefined;
    let label: string = "";

    if (categoryId) {
        // can't set id in the TriagedNotes arguments to be non-optional because
        // then the type-checker wrongly complains about the use of TriagedNotes
        // in App.tsx's Router setup

        cid = parseInt(categoryId ? categoryId : "0", 10);

        label = getTriageLabel(appState.categories.value, cid);
        AppStateChange.triageMenuItemLabel(label);

        notes = appState.listing.value.category[cid];

    } else {
        notes = appState.listing.value.notes;
        AppStateChange.triageDrawerDefaultLabel();
    }

    let categories = appState.categories.value;
    const [pin, unpin] = partitionPinnedNotes(notes);

    return (
        <div>
            <CreateNoteForm categoryId={cid} />
            <PinnedListing>
                {pin.map((n) => (
                    <Postit note={n} categories={categories} categoryId={cid} />
                ))}
            </PinnedListing>
            <UnPinnedListing>
                {unpin.map((n) => (
                    <Postit note={n} categories={categories} categoryId={cid} />
                ))}
            </UnPinnedListing>
            {categoryId && (
                <DeletableCategory categoryId={cid!} label={label} />
            )}
        </div>
    );
}

function NoteView({ id, path }: { id?: string; path?: string }) {
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

export { Notes, NoteView };
