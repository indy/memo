import { h } from "preact";
import { route } from "preact-router";

import Net from "../Net";
import { SvgBin, SvgPinned, SvgUnpinned } from "../svgIcons";
import { AppStateChange } from "../AppState";
import { INote, IPigment } from "../types";

function ButtonDelete({
    note,
    pigment,
}: {
    note: INote;
    pigment: IPigment;
}) {
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

function ButtonPinned({ note, pigment }: { note: INote; pigment: IPigment }) {
    function onPinnedClicked(e: MouseEvent) {
        e.preventDefault();

        let updatedNote: INote = {
            ...note,
            pinned: !note.pinned,
        };
        Net.put<INote, INote>(`/api/notes/${note.id}`, updatedNote).then(
            (newNote: INote) => {
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
    pigment: IPigment;
    editing: boolean;
    callback: Function;
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
