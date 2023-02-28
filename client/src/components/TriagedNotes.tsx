import { h } from "preact";
import { useState } from "preact/hooks";
import { route } from "preact-router";

import Net from "../Net";
import { partitionPinnedNotes } from "../NoteUtils";
import { AppStateChange, getAppState } from "../AppState";
import { getTriageLabel } from "../AppUtils";

import Postit from "./Postit";
import { CreateNoteForm } from "./CreateNoteForm";
import { PinnedListing, UnPinnedListing }  from "./Listing";

import { INote } from "../types";

function TriagedNotes({ path, categoryId }: { path?: string; categoryId?: string }) {
    const appState = getAppState();

    // can't set id in the TriagedNotes arguments to be non-optional because
    // then the type-checker wrongly complains about the use of TriagedNotes
    // in App.tsx's Router setup

    let cid: number = parseInt(categoryId ? categoryId : "0", 10);

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

    return (
        <div>
            <CreateNoteForm categoryId={cid} />
            <PinnedListing>
                { pin.map((n) => (<Postit note={n} categories={categories} categoryId={cid}/>)) }
            </PinnedListing>
            <UnPinnedListing>
                { unpin.map((n) => (<Postit note={n} categories={categories} categoryId={cid}/>)) }
            </UnPinnedListing>
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

export { TriagedNotes };
