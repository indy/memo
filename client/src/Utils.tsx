import { State, Pigment, Note, NoteKind, LoadState } from "./types";

import Net from "./Net";
import { AppStateChange } from "./AppState";

export function ensureLoaded(
    appState: State,
    kind: NoteKind,
    categoryId?: number
) {
    if (isUnloaded(appState, kind, categoryId)) {
        loadNotes(kind, categoryId);
    }
}
function isUnloaded(
    appState: State,
    kind: NoteKind,
    categoryId?: number
): boolean {
    let loaded = appState.loaded.value;

    switch (kind) {
        case NoteKind.Inbox:
            return loaded.notes === LoadState.NotLoaded;
        case NoteKind.Category:
            if (categoryId) {
                return (
                    !loaded.category ||
                    !loaded.category[categoryId] ||
                    loaded.category[categoryId] === LoadState.NotLoaded
                );
            } else {
                return false;
            }
        case NoteKind.Bin:
            return loaded.bin === LoadState.NotLoaded;
    }
}

function loadNotes(kind: NoteKind, categoryId?: number) {
    let urls: Record<NoteKind, string> = {
        [NoteKind.Inbox]: `/api/notes`,
        [NoteKind.Category]: `/api/categories/${categoryId!}/notes`,
        [NoteKind.Bin]: `/api/bin`,
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
