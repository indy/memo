import { h } from "preact";
import { useState } from "preact/hooks";

import Net from "../Net";
import {
    finishedEditingCallback,
    getNoteById,
    notePigment,
    partitionPinnedNotes,
} from "../NoteUtils";
import {
    SvgBin
} from "../svgIcons";
import { AppStateChange, getAppState } from "../AppState";

import Card from "./Card";
import {
    ButtonUntriage,
    ButtonDelete,
    ButtonEdit,
    ButtonPinned,
} from "./CardButtons";
import { TriageDropDown } from "./TriageDropDown";
import { CreateNoteForm } from "./CreateNoteForm.jsx";

import { INote, ICategory } from "../types";

function TriagedNotes({ path, id }: { path?: string, id?: string }) {
    const appState = getAppState();


    // can't set id in the TriagedNotes arguments to be non-optional because
    // then the type-checker wrongly complains about the use of TriagedNotes
    // in App.tsx's Router setup. So instead we have to have this useless
    // check for id
    let cid: number = parseInt(id ? id : "0", 10);
    let categoryNotes: Array<INote> = appState.listing.value.triaged.filter((n: INote) => n.category_id === cid);

    const [pin, unpin] = partitionPinnedNotes(categoryNotes);
    const pinnedListing = pin.map((n) => NoteListItem(n));
    const unpinnedListing = unpin.map((n) => NoteListItem(n));

    // const numNotes = (
    //     <span class="category-num-notes">{categoryNotes.length}</span>
    // );

    return (<div>
            <CreateNoteForm />
            { pinnedListing.length > 0 && (
                <div class="card-holder-pinned">
                    <div class="card-holder-pinned-inner">
                        {pinnedListing}
                    </div>
                </div>
            )}
            <div class="card-holder">{unpinnedListing}</div>
            </div>);
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
        Net.post<IProtoCategory, Array<ICategory>>(`/api/categories`, protoCategory).then(
            (latestCategories) => {
                AppStateChange.categoriesSet(latestCategories);
                setLocalState({ ...localState, text: "" });
            }
        );
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

function NoteListItem(note: INote) {
    const resource = "triaged";
    const pigment = notePigment(note.id);

    return (
        <Card note={note} resource={resource} pigment={pigment}>
            <ButtonUntriage note={note} pigment={pigment} />
            <ButtonPinned note={note} pigment={pigment} />
            <ButtonDelete note={note} pigment={pigment} noteKind={resource} />
        </Card>
    );
}

function TriagedNote({ id, path }: { id?: string; path?: string }) {
    const noteKind = "triaged";

    const appState = getAppState();
    const [editing, setEditing] = useState(false);
    const [fullHeight, setFullHeight] = useState(true);

    if (!appState.listing.value.triaged) {
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
            onFinishedEditing={finishedEditingCallback(note, setEditing)}
            editing={editing}
            note={note}
            resource={noteKind}
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
            <ButtonDelete note={note} pigment={pigment} noteKind={noteKind} />
        </Card>
    );
}

export { TriagedNotes, TriagedNote };
