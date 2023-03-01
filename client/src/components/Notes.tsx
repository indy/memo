import { h } from "preact";
import { useEffect } from "preact/hooks";

import { Note, NoteKind, Category } from "../types";

import Net from "../Net";
import { ensureLoaded } from "../Utils";
import { getAppState, AppStateChange } from "../AppState";

import { BinnedCard, Card } from "./Card";
import DeletableCategory from "./DeletableCategory";
import { CreateNoteForm } from "./CreateNoteForm";
import { PinnedListing, UnPinnedListing } from "./Listing";

function InboxNotes({ path }: { path?: string }) {
    const appState = getAppState();

    useEffect(() => {
        ensureLoaded(appState, NoteKind.Inbox);
    }, []);

    let notes: Array<Note> = [];

    notes = appState.listing.value.notes;
    AppStateChange.triageDrawerDefaultLabel();

    let categories = appState.categories.value;
    const [pin, unpin] = partitionPinnedNotes(notes);

    return (
        <div>
            <CreateNoteForm />
            <PinnedListing>
                {pin.map((n) => (
                    <Card note={n} categories={categories} />
                ))}
            </PinnedListing>
            <UnPinnedListing>
                {unpin.map((n) => (
                    <Card note={n} categories={categories} />
                ))}
            </UnPinnedListing>
        </div>
    );
}

function CategoryNotes({
    path,
    categoryId,
}: {
    path?: string;
    categoryId?: string;
}) {
    const appState = getAppState();

    useEffect(() => {
        if (categoryId) {
            ensureLoaded(appState, NoteKind.Category, cid);
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
    }

    let categories = appState.categories.value;
    const [pin, unpin] = partitionPinnedNotes(notes);

    return (
        <div>
            <CreateNoteForm categoryId={cid} />
            <PinnedListing>
                {pin.map((n) => (
                    <Card note={n} categories={categories} categoryId={cid} />
                ))}
            </PinnedListing>
            <UnPinnedListing>
                {unpin.map((n) => (
                    <Card note={n} categories={categories} categoryId={cid} />
                ))}
            </UnPinnedListing>
            <DeletableCategory categoryId={cid!} label={label} />
        </div>
    );
}

function BinNotes({ path }: { path?: string }) {
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

function getTriageLabel(categories: Category[], id: number): string {
    let cat: Category = categories.find((c) => c.id === id)!;
    return cat.title;
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

export { InboxNotes, CategoryNotes, BinNotes };
