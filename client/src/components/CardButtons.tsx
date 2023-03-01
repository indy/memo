import { h } from "preact";
import { route } from "preact-router";

import { Note, Pigment } from "../types";

import Net from "../Net";
import { AppStateChange } from "../AppState";
import { SvgBin, SvgPinned, SvgUnpinned } from "../svgIcons";

function ButtonDelete({ note, pigment }: { note: Note; pigment: Pigment }) {
    function onDeleteClicked(e: MouseEvent) {
        e.preventDefault();

        Net.post(`/api/notes/${note.id}/bin`, {}).then(() => {
            AppStateChange.noteBinned(note);
            if (note.categoryId) {
                route(`/category/${note.categoryId}`);
            } else {
                route("/");
            }
        });
    }

    return (
        <button
            class={`${pigment.classAlt} button card-action-cell`}
            onClick={onDeleteClicked}
        >
            <SvgBin fillColour={`--clock-${pigment.numString}-fg`} />
        </button>
    );
}

function ButtonPinned({ note, pigment }: { note: Note; pigment: Pigment }) {
    function onPinnedClicked(e: MouseEvent) {
        e.preventDefault();

        let updatedNote: Note = {
            ...note,
            pinned: !note.pinned,
        };
        Net.put<Note, Note>(`/api/notes/${note.id}`, updatedNote).then(
            (newNote: Note) => {
                AppStateChange.notePinStateUpdated(updatedNote);
            }
        );
    }

    return (
        <button
            class={`${pigment.classAlt} button card-action-cell`}
            onClick={onPinnedClicked}
        >
            {note.pinned ? (
                <SvgPinned fillColour={`--clock-${pigment.numString}-fg`} />
            ) : (
                <SvgUnpinned fillColour={`--clock-${pigment.numString}-fg`} />
            )}
        </button>
    );
}

function ButtonEdit({
    pigment,
    editing,
    callback,
}: {
    pigment: Pigment;
    editing: boolean;
    callback: (b: boolean) => void;
}) {
    function onEditClicked(e: MouseEvent) {
        e.preventDefault();
        callback(!editing);
    }

    let editButtonText = editing ? "Cancel Editing" : "Edit";

    return (
        <button
            class={`${pigment.classAlt} button card-action-cell`}
            onClick={onEditClicked}
        >
            {editButtonText}
        </button>
    );
}

export { ButtonDelete, ButtonPinned, ButtonEdit };
