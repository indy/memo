import { h, createContext } from 'preact';
import { signal } from '@preact/signals';
import { useContext } from 'preact/hooks';

import { IUser, IState, IAction, INote, IListing, ICategory } from "./types";

import { plural } from "./JsUtils";

const emptyUser: IUser = {
    username: "",
    email: "",
    admin: { db_name: ""}
}

const state: IState = {
    user: signal(emptyUser),
    settings: signal({
        // note: extra setting variables are declared in
        // ColourCreator.js::augmentSettingsWithCssModifierParameters
        hueOffset: 0,
        hueDelta: 30
    }),
    activeTopBarMenuItem: signal(''),
    categories: signal([]),
    listing: signal({
        notes: [],
        triaged: [],
        bin: []
    })
};

export const initialState = state;

export const AppStateContext = createContext(state);

export const AppStateProvider = ({state, children}: {state: IState, children: any}) => {
    return <AppStateContext.Provider value={state}>
        { children }
    </AppStateContext.Provider>;
};

export const getAppState = () => useContext(AppStateContext);

const DEBUG_APP_STATE = true;

export const AppStateChange = {
    routeChanged: function(url: string) {
        if (DEBUG_APP_STATE) {
            console.log("routeChanged");
        }
        if (url === '/') {
            state.activeTopBarMenuItem.value = 'notes';
        } else if (url === '/triaged') {
            state.activeTopBarMenuItem.value = 'triaged';
        } else if (url === '/bin') {
            state.activeTopBarMenuItem.value = 'bin';
        }
    },
    userLogin: function(user: IUser, categories: Array<ICategory>, notes: Array<INote>, triaged: Array<INote>, bin: Array<INote>) {
        if (DEBUG_APP_STATE) {
            console.log("userLogin");
        }

        state.user.value = user;
        state.categories.value = categories;
        state.listing.value.notes = notes.map(calculateAge);
        state.listing.value.triaged = triaged.map(calculateAge);
        state.listing.value.bin = bin.map(calculateAge);
    },
    userLogout: function() {
        state.user.value.username == "";
    },
    listingNoteAppended: function(note: INote) {
        if (!state.listing.value.notes) {
            state.listing.value.notes = [];
        }

        state.listing.value.notes.unshift(note);
    },
    notePinStateUpdated: function(n: INote) {

        let note = findNote(state.listing.value.notes, n.id);

        if (note) {
            note.pinned = note.pinned;
        } else {
            note = findNote(state.listing.value.triaged, n.id);
            if (note) {
                note.pinned = note.pinned;
            } else {
                note = findNote(state.listing.value.bin, n.id);
                if (note) {
                    note.pinned = note.pinned;
                }
            }
        }
    },
    noteBinned: function(n: INote) {
        state.listing.value.notes = removeNoteFromArray(state.listing.value.notes, n.id);
        state.listing.value.triaged = removeNoteFromArray(state.listing.value.triaged, n.id);

        if (state.listing.value.bin) {
            state.listing.value.bin.unshift(n);
        }
    },
    noteContentUpdated: function(n: INote) {
        let note = findNote(state.listing.value.notes, n.id)
            || findNote(state.listing.value.triaged, n.id)
            || findNote(state.listing.value.bin, n.id);
        if (note) {
            note.content = n.content;
            note.title = n.title;
            note.pinned = n.pinned;
        }
    },
    categoryDeleted: function(deletedCategory: ICategory) {
        state.categories.value = state.categories.value.filter((c: ICategory)  => c.id !== deletedCategory.id);

    },
    categoriesSet: function(categories: Array<ICategory>) {
        state.categories.value = categories;
    },
    noteUntriaged: function(note: INote) {
        state.listing.value.triaged = removeNoteFromArray(state.listing.value.triaged, note.id);

        if (state.listing.value.notes) {
            // todo: maybe insert this note in the correct position, not just at the beginning
            state.listing.value.notes.unshift(note);
        }
    },
    settingsColourScalar: function(id: string, value: string) {
        state.settings.value[id] = parseInt(value, 10);
    },
    settingsColourTriple: function(id: string, value: [string, string, string]) {
        state.settings.value[id] = [parseInt(value[0], 10),
                                    parseInt(value[1], 10),
                                    parseInt(value[2], 10)];
    },
    noteTriaged: function(note: INote) {
        state.listing.value.notes = removeNoteFromArray(state.listing.value.notes, note.id);

        if (state.listing.value.triaged) {
            state.listing.value.triaged.unshift(note);
        }
    },
    noteDeleted: function(note: INote) {
        state.listing.value.bin = removeNoteFromArray(state.listing.value.bin, note.id);
    },
    noteUnbinned: function(note: INote) {
        state.listing.value.bin = removeNoteFromArray(state.listing.value.bin, note.id);

        // todo: make this more robust
        if (note.category_id) {
            if (state.listing.value.triaged) {
                state.listing.value.triaged.unshift(note);
            }
        } else {
            if (state.listing.value.notes) {
                state.listing.value.notes.unshift(note);
            }
        }
    },
    binEmptied: function() {
        state.listing.value.bin = [];
    }
}

;
function findNote(array: Array<INote>, noteId: number): INote | undefined {
    return array && array.find(n => n.id === noteId);
}

function removeNoteFromArray(array: Array<INote>, noteId: number): Array<INote> {
    return array ? array.filter(n => n.id !== noteId) : array;
}

function calculateAge(note: INote) {
    let created_at = new Date(Date.parse(note.created_at));
    let today = new Date();
    let delta = today.getTime() - created_at.getTime();

    note.age = humanReadableAge(delta);

    return note;
}

function humanReadableAge(deltaMS: number) {

    let minutes = deltaMS / (1000 * 60);
    if (minutes < 60.0) {
        if (minutes < 1.0) {
            return `Just created`;
        } else {
            return plural(minutes, "minute", "s");
        }
    }

    let hours = deltaMS / (1000 * 60 * 60);
    if (hours < 24.0) {
        return plural(hours, "hour", "s");
    }

    let days = deltaMS / (1000 * 60 * 60 * 24);
    if (days < 31.0) {
        return plural(days, "day", "s");
    }

    let months = deltaMS / (1000 * 60 * 60 * 24 * 30);
    if (months < 12) {
        return plural(months, "month", "s");
    }

    let years = deltaMS / (1000 * 60 * 60 * 24 * 365.25);
    return plural(years, "year", "s");
}
