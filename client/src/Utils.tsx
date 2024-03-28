import { ColourScheme, LoadState, NoteLocation } from "./enums";

import type { State, Pigment, Note, UiConfig } from "./types";

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
            return loaded.inbox !== LoadState.Loaded;
        case NoteLocation.Group:
            if (categoryId) {
                return (
                    !loaded.group ||
                    !loaded.group[categoryId] ||
                    loaded.group[categoryId] !== LoadState.Loaded
                );
            } else {
                return false;
            }
        case NoteLocation.Bin:
            return loaded.bin !== LoadState.Loaded;
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
    const pigmentClassAlt = `pigment-alt-clock-${pigmentNumString}`;
    const pigmentClassFg = `pigment-fg-clock-${pigmentNumString}`;

    return {
        num: pigmentNum,
        numString: pigmentNumString,
        class: pigmentClass,
        classAlt: pigmentClassAlt,
        classFg: pigmentClassFg,
    };
}

export function updateAndSaveUiConfig(uiConfig: UiConfig) {
    type EditUiConfig = {
        json: string;
    };

    // save the uiconfig as an opaque json string
    //
    const json = JSON.stringify(uiConfig);
    Net.put<EditUiConfig, any>("api/users/ui_config", { json });

    AppStateChange.setUiConfig( uiConfig );
}

export function basicUiConfig(): UiConfig {
    return {
        colourScheme: ColourScheme.Light,
    };
}

export function getCssString(name: string): string {
    let body = document.body;
    let v = getComputedStyle(body).getPropertyValue(name).trim();

    return v;
}
