import { h } from "preact";
import { route } from "preact-router";

import Net from "../Net";
import { SvgBin, SvgPinned, SvgUnpinned } from "../svgIcons";
import { AppStateChange } from "../AppState";
import { INote, IPigment } from "../types";

function ButtonDelete({
    note,
    noteKind,
    pigment,
}: {
    note: INote;
    noteKind: string;
    pigment: IPigment;
}) {
    function onDeleteClicked(e: MouseEvent) {
        e.preventDefault();

        Net.post(`/api/${noteKind}/${note.id}/bin`, {}).then(() => {
            AppStateChange.noteBinned(note);
            if (noteKind === "triaged") {
                route("/triaged");
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

        let data = {
            ...note,
            pinned: !note.pinned,
        };
        Net.put(`/api/notes/${note.id}`, data).then((n) => {
            AppStateChange.notePinStateUpdated(n);
        });
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
    callback: any;
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

function ButtonUntriage({ note, pigment }: { note: INote; pigment: IPigment }) {
    function onUntriageClicked(e: MouseEvent) {
        e.preventDefault();
        Net.post(`/api/triaged/${note.id}/untriage`, {}).then(() => {
            AppStateChange.noteUntriaged(note);
        });
    }

    return (
        <button
            class={`${pigment.classAlt} button card-action-cell`}
            onClick={onUntriageClicked}
        >
            Untriage
        </button>
    );
}

export { ButtonDelete, ButtonPinned, ButtonEdit, ButtonUntriage };
