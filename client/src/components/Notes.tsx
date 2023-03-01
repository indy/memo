import { h } from "preact";
import { useState, useEffect } from "preact/hooks";

import Net from "../Net";
import { notePigment } from "../Utils";
import { getAppState, AppStateChange } from "../AppState";

import DeletableCategory from "./DeletableCategory";
import Postit from "./Postit";
import Card from "./Card";
import { ButtonDelete, ButtonEdit, ButtonPinned } from "./CardButtons";
import { TriageDropDown } from "./TriageDropDown";
import { CreateNoteForm } from "./CreateNoteForm";
import { PinnedListing, UnPinnedListing } from "./Listing";

import { State, Note, NoteKind, LoadState, Category } from "../types";

function Notes({ path, categoryId }: { path?: string; categoryId?: string }) {
    const appState = getAppState();

    useEffect(() => {
        if (categoryId) {
            let cid = parseInt(categoryId, 10);
            if (
                !appState.loaded.value.category[cid] ||
                appState.loaded.value.category[cid] === LoadState.NotLoaded
            ) {
                let loadingState = { ...appState.loaded.value };
                loadingState.category[cid] = LoadState.Loading;
                AppStateChange.setLoadingState(loadingState);

                Net.get<Array<Note>>(`/api/categories/${cid}/notes`).then(
                    (notes) => {
                        AppStateChange.loadedNotes(
                            notes,
                            NoteKind.Category,
                            cid
                        );
                    }
                );
            }
        } else {
            if (appState.loaded.value.notes === LoadState.NotLoaded) {
                let loadingState = {
                    ...appState.loaded.value,
                    notes: LoadState.Loading,
                };
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

function getTriageLabel(categories: Category[], id: number): string {
    let cat: Category = categories.find((c) => c.id === id)!;
    return cat.title;
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

function partitionPinnedNotes(list?: Array<Note>): Array<Array<Note>> {
    let pinned: Array<Note> = [];
    let unpinned: Array<Note> = [];

    if (!list) {
        return [[], []];
    }

    list.forEach((n) => {
        if (n.pinned) {
            pinned.push(n);
        } else {
            unpinned.push(n);
        }
    });

    pinned.sort((a, b) => b.id - a.id);
    unpinned.sort((a, b) => b.id - a.id);

    return [pinned, unpinned];
}

export { Notes, NoteView };
