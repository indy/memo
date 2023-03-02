import { State, Pigment, Note, NoteLocation, LoadState } from "./types";

import Net from "./Net";
import { AppStateChange } from "./AppState";

export function ensureLoaded(
    appState: State,
    kind: NoteLocation,
    categoryId?: number
) {
    if (isUnloaded(appState, kind, categoryId)) {
        loadNotes(kind, categoryId);
    }
}
function isUnloaded(
    appState: State,
    kind: NoteLocation,
    categoryId?: number
): boolean {
    let loaded = appState.loaded.value;

    switch (kind) {
        case NoteLocation.Inbox:
            return loaded.inbox === LoadState.NotLoaded;
        case NoteLocation.Group:
            if (categoryId) {
                return (
                    !loaded.group ||
                    !loaded.group[categoryId] ||
                    loaded.group[categoryId] === LoadState.NotLoaded
                );
            } else {
                return false;
            }
        case NoteLocation.Bin:
            return loaded.bin === LoadState.NotLoaded;
    }
}

function loadNotes(kind: NoteLocation, categoryId?: number) {
    let urls: Record<NoteLocation, string> = {
        [NoteLocation.Inbox]: `/api/notes`,
        [NoteLocation.Group]: `/api/categories/${categoryId!}/notes`,
        [NoteLocation.Bin]: `/api/bin`,
    };

    AppStateChange.setToLoading(kind, categoryId);
    Net.get<Array<Note>>(urls[kind]).then((notes) => {
        AppStateChange.loadedNotes(notes, kind, categoryId);
    });
}

export function notePigment(noteId: number): Pigment {
    const pigmentNum = (noteId % 12) + 1;
    const pigmentNumString =
        pigmentNum < 10 ? `0${pigmentNum}` : `${pigmentNum}`;
    const pigmentClass = `pigment-clock-${pigmentNumString}`;
    const pigmentClassAlt = `${pigmentClass}-alt`;

    return {
        num: pigmentNum,
        numString: pigmentNumString,
        class: pigmentClass,
        classAlt: pigmentClassAlt,
    };
}
