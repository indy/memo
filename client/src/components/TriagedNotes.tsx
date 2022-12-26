import { h } from "preact";
import { useState } from "preact/hooks";

import Net from "../Net";
import {
    notePigment,
    partitionPinnedNotes,
} from "../NoteUtils";
import { SvgBin } from "../svgIcons";
import { AppStateChange, getAppState } from "../AppState";

import Card from "./Card";
import {
    ButtonUntriage,
    ButtonDelete,
    ButtonPinned,
} from "./CardButtons";
import { CreateNoteForm } from "./CreateNoteForm";
import { PinnedListing, UnPinnedListing }  from "./Listing";

import { INote, ICategory } from "../types";

function TriagedNotes({ path, id }: { path?: string; id?: string }) {
    const appState = getAppState();

    // can't set id in the TriagedNotes arguments to be non-optional because
    // then the type-checker wrongly complains about the use of TriagedNotes
    // in App.tsx's Router setup

    let cid: number = parseInt(id ? id : "0", 10);

    let categoryNotes: Array<INote> = appState.listing.value.category[cid];

    if (categoryNotes.length === 0) {
        Net.get<Array<INote>>(`/api/categories/${cid}/notes`).then(
            async (notes: Array<INote>) => {
                AppStateChange.loadedCategoryNotes(cid, notes);
                categoryNotes = notes;
            }
        );
    }

    const [pin, unpin] = partitionPinnedNotes(categoryNotes);
    const pinnedListing = pin.map((n) => TriagedCard(n));
    const unpinnedListing = unpin.map((n) => TriagedCard(n));

    return (
        <div>
            <CreateNoteForm categoryId={cid} />
            <PinnedListing>{pinnedListing}</PinnedListing>
            <UnPinnedListing>{unpinnedListing}</UnPinnedListing>
        </div>
    );
}

function DeletableCategory({ category }: { category: any }) {
    function onDeleteClicked(e: MouseEvent) {
        e.preventDefault();

        Net.delete(`/api/categories/${category.id}`, {}).then(() => {
            AppStateChange.categoryDeleted(category);
        });
    }

    return (
        <div>
            <button class="bg2 button" onClick={onDeleteClicked}>
                <SvgBin fillColour="--fg" />{" "}
            </button>
            <span class="pad-left-1rem">Delete {category.title}</span>
        </div>
    );
}

interface IProtoCategory {
    title: string;
}

function NewCategoryForm() {
    const appState = getAppState();

    const [localState, setLocalState] = useState({
        text: "",
        disabled: true,
    });

    function onInput(e: any) {
        const value = e.target.value;
        const found = appState.categories.value.find(
            (c: ICategory) => c.title === value
        );

        const newState = {
            ...localState,
            disabled: !!found || value.length === 0,
            text: value,
        };

        setLocalState(newState);
    }

    function newCategorySubmit(e: any) {
        e.preventDefault();

        let protoCategory: IProtoCategory = { title: localState.text };
        Net.post<IProtoCategory, Array<ICategory>>(
            `/api/categories`,
            protoCategory
        ).then((latestCategories) => {
            AppStateChange.categoriesSet(latestCategories);
            setLocalState({ ...localState, text: "" });
        });
    }

    return (
        <form class="form-inline" onSubmit={newCategorySubmit}>
            <label class="form-inline-item" for="new-category">
                New category:
            </label>
            <input
                class="form-inline-item"
                type="text"
                id="new-category"
                name="new-category"
                value={localState.text}
                onInput={onInput}
            />
            <input
                class="triaged-note-create-button-bodge form-inline-item button save-button"
                type="submit"
                value="Create"
                disabled={localState.disabled}
            />
        </form>
    );
}

function TriagedCard(note: INote) {
    const pigment = notePigment(note.id);

    return (
        <Card note={note} pigment={pigment}>
            <ButtonUntriage note={note} pigment={pigment} />
            <ButtonPinned note={note} pigment={pigment} />
            <ButtonDelete note={note} pigment={pigment} />
        </Card>
    );
}

export { TriagedNotes };
