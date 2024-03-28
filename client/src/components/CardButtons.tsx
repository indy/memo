import { route } from "preact-router";

import type { Note, Pigment } from "../types";

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
            <SvgBin fillColour={`--fg-clock-${pigment.numString}`} />
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
                <SvgPinned fillColour={`--fg-clock-${pigment.numString}`} />
            ) : (
                <SvgUnpinned fillColour={`--fg-clock-${pigment.numString}`} />
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

    let editButtonText = editing ? "cancel editing" : "edit";

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
