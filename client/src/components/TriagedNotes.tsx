import { h } from "preact";
import { useState } from "preact/hooks";
import { route } from "preact-router";

import Net from "../Net";
import {
    notePigment,
    partitionPinnedNotes,
} from "../NoteUtils";
import { AppStateChange, getAppState } from "../AppState";
import { getTriageLabel } from "../AppUtils";

import Card from "./Card";
import {
    ButtonDelete,
    ButtonPinned,
} from "./CardButtons";
import { CreateNoteForm } from "./CreateNoteForm";
import { PinnedListing, UnPinnedListing }  from "./Listing";
import { TriageDropDown } from "./TriageDropDown";

import { INote, ICategory } from "../types";

function TriagedNotes({ path, id }: { path?: string; id?: string }) {
    const appState = getAppState();

    // can't set id in the TriagedNotes arguments to be non-optional because
    // then the type-checker wrongly complains about the use of TriagedNotes
    // in App.tsx's Router setup

    let cid: number = parseInt(id ? id : "0", 10);

    let label = getTriageLabel(appState.categories.value, cid);
    AppStateChange.triageMenuItemLabel(label);

    let categoryNotes: Array<INote> = appState.listing.value.category[cid];

    if (categoryNotes.length === 0) {
        Net.get<Array<INote>>(`/api/categories/${cid}/notes`).then(
            async (notes: Array<INote>) => {
                AppStateChange.loadedCategoryNotes(cid, notes);
                categoryNotes = notes;
            }
        );
    }

    let categories = appState.categories.value;

    const [pin, unpin] = partitionPinnedNotes(categoryNotes);
    const pinnedListing = pin.map((n) => TriagedCard(n, categories, cid));
    const unpinnedListing = unpin.map((n) => TriagedCard(n, categories, cid));

    return (
        <div>
            <CreateNoteForm categoryId={cid} />
            <PinnedListing>{pinnedListing}</PinnedListing>
            <UnPinnedListing>{unpinnedListing}</UnPinnedListing>
            <DeletableCategory categoryId={cid} label={label}/>
        </div>
    );
}

function DeletableCategory({ categoryId, label }: { categoryId: number, label: string }) {
    const [showToggle, setShowToggle] = useState(false);

    function buttonClicked(e: MouseEvent) {
        e.preventDefault();
        setShowToggle(true);
    }

    function noClicked(e: MouseEvent) {
        e.preventDefault();
        setShowToggle(false);
    }

    function yesClicked(e: MouseEvent) {
        e.preventDefault();
        setShowToggle(false);

        Net.delete(`/api/categories/${categoryId}`, {}).then(() => {
            AppStateChange.categoryDeleted(categoryId);
            route("/");
        });
    }

    return (<div>
                {!showToggle && <button onClick={ buttonClicked }>Delete {label}</button>}
                {showToggle && <button onClick={ noClicked }>No, Cancel Delete</button>}
                {showToggle && <button onClick={ yesClicked }>Yes, Really Delete</button>}
            </div>)
}

function TriagedCard(note: INote, categories: Array<ICategory>, categoryId: number) {
    const [fullHeight, setFullHeight] = useState(false);
    const pigment = notePigment(note.id);

    return (
        <Card note={note}
              pigment={pigment}
              fullHeight={fullHeight}>
            <TriageDropDown
                noteId={note.id}
                categories={categories}
                pigment={pigment}
                cardFullHeightFn={setFullHeight}
                currentCategoryId={ categoryId }
            />

            <ButtonPinned note={note} pigment={pigment} />
            <ButtonDelete note={note} pigment={pigment} />
        </Card>
    );
}

export { TriagedNotes };
