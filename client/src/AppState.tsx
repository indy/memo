import { h, createContext, ComponentChildren } from "preact";
import { signal } from "@preact/signals";
import { useContext } from "preact/hooks";

import { IUser, IState, INote, IListing, ICategory } from "./types";

import { plural } from "./JsUtils";

const emptyUser: IUser = {
    username: "",
    email: "",
    admin: { db_name: "" },
};

const state: IState = {
    user: signal(emptyUser),
    settings: signal({
        // note: extra setting variables are declared in
        // ColourCreator.js::augmentSettingsWithCssModifierParameters
        hueOffset: 0,
        hueDelta: 30,
    }),
    activeTopBarMenuItem: signal(""),
    categories: signal([]),
    listing: signal({
        notes: [],
        triaged: [],
        bin: [],
    }),
};

export const initialState = state;

export const AppStateContext = createContext(state);

export const AppStateProvider = ({
    state,
    children,
}: {
    state: IState;
    children: ComponentChildren;
}) => {
    return (
        <AppStateContext.Provider value={state}>
            {children}
        </AppStateContext.Provider>
    );
};

export const getAppState = () => useContext(AppStateContext);

const DEBUG_APP_STATE = true;

export const AppStateChange = {
    routeChanged: function (url: string) {
        if (DEBUG_APP_STATE) {
            console.log("routeChanged");
        }
        if (url === "/") {
            state.activeTopBarMenuItem.value = "notes";
        } else if (url === "/triaged") {
            state.activeTopBarMenuItem.value = "triaged";
        } else if (url === "/bin") {
            state.activeTopBarMenuItem.value = "bin";
        }
    },
    userLogin: function (
        user: IUser,
        categories: Array<ICategory>,
        notes: Array<INote>,
        triaged: Array<INote>,
        bin: Array<INote>
    ) {
        if (DEBUG_APP_STATE) {
            console.log("userLogin");
        }

        let listing: IListing = {
            bin: bin.map(calculateAge),
            notes: notes.map(calculateAge),
            triaged: triaged.map(calculateAge),
        };

        state.user.value = user;
        state.categories.value = categories;
        state.listing.value = listing;
    },
    userLogout: function () {
        if (DEBUG_APP_STATE) {
            console.log("userLogout");
        }

        let user: IUser = { ...state.user.value };
        user.username = "";

        state.user.value = user;
    },
    listingNoteAppended: function (note: INote) {
        if (DEBUG_APP_STATE) {
            console.log("listingNoteAppended");
        }

        let listing: IListing = { ...state.listing.value };
        if (!listing.notes) {
            listing.notes = [];
        }
        listing.notes.unshift(note);

        state.listing.value = listing;
    },
    notePinStateUpdated: function (n: INote) {
        if (DEBUG_APP_STATE) {
            console.log("notePinStateUpdated");
        }

        let listing = { ...state.listing.value };

        let note = findNote(listing.notes, n.id);
        if (note) {
            note.pinned = n.pinned;
        } else {
            note = findNote(listing.triaged, n.id);
            if (note) {
                note.pinned = n.pinned;
            } else {
                note = findNote(listing.bin, n.id);
                if (note) {
                    note.pinned = n.pinned;
                }
            }
        }
        state.listing.value = listing;
    },
    noteBinned: function (n: INote) {
        if (DEBUG_APP_STATE) {
            console.log("noteBinned");
        }
        let listing = { ...state.listing.value };

        listing.notes = removeNoteFromArray(listing.notes, n.id);
        listing.triaged = removeNoteFromArray(listing.triaged, n.id);

        if (listing.bin) {
            listing.bin.unshift(n);
        }

        state.listing.value = listing;
    },
    noteContentUpdated: function (n: INote) {
        if (DEBUG_APP_STATE) {
            console.log("noteContentUpdated");
        }

        let listing = { ...state.listing.value };

        let note =
            findNote(listing.notes, n.id) ||
            findNote(listing.triaged, n.id) ||
            findNote(listing.bin, n.id);
        if (note) {
            note.content = n.content;
            note.title = n.title;
            note.pinned = n.pinned;
        }

        state.listing.value = listing;
    },
    categoryDeleted: function (deletedCategory: ICategory) {
        if (DEBUG_APP_STATE) {
            console.log("categoryDeleted");
        }
        state.categories.value = state.categories.value.filter(
            (c: ICategory) => c.id !== deletedCategory.id
        );
    },
    categoriesSet: function (categories: Array<ICategory>) {
        if (DEBUG_APP_STATE) {
            console.log("categoriesSet");
        }
        state.categories.value = categories;
    },
    noteUntriaged: function (note: INote) {
        if (DEBUG_APP_STATE) {
            console.log("noteUntriaged");
        }

        let listing = { ...state.listing.value };

        listing.triaged = removeNoteFromArray(listing.triaged, note.id);

        if (listing.notes) {
            // todo: maybe insert this note in the correct position, not just at the beginning
            listing.notes.unshift(note);
        }

        state.listing.value = listing;
    },
    settingsColourScalar: function (id: string, value: string) {
        if (DEBUG_APP_STATE) {
            console.log("settingsColourScalar");
        }
        state.settings.value[id] = parseInt(value, 10);
    },
    settingsColourTriple: function (
        id: string,
        value: [string, string, string]
    ) {
        if (DEBUG_APP_STATE) {
            console.log("settingsColourTriple");
        }
        state.settings.value[id] = [
            parseInt(value[0], 10),
            parseInt(value[1], 10),
            parseInt(value[2], 10),
        ];
    },
    noteTriaged: function (note: INote) {
        if (DEBUG_APP_STATE) {
            console.log("noteTriaged");
        }
        let listing = { ...state.listing.value };

        listing.notes = removeNoteFromArray(listing.notes, note.id);

        if (listing.triaged) {
            listing.triaged.unshift(note);
        }

        state.listing.value = listing;
    },
    noteDeleted: function (note: INote) {
        if (DEBUG_APP_STATE) {
            console.log("noteDeleted");
        }
        let listing = { ...state.listing.value };

        listing.bin = removeNoteFromArray(listing.bin, note.id);

        state.listing.value = listing;
    },
    noteUnbinned: function (note: INote) {
        if (DEBUG_APP_STATE) {
            console.log("noteUnbinned");
        }

        let listing = { ...state.listing.value };
        listing.bin = removeNoteFromArray(listing.bin, note.id);

        // todo: make this more robust
        if (note.category_id) {
            if (listing.triaged) {
                listing.triaged.unshift(note);
            }
        } else {
            if (listing.notes) {
                listing.notes.unshift(note);
            }
        }
        state.listing.value = listing;
    },
    binEmptied: function () {
        if (DEBUG_APP_STATE) {
            console.log("binEmptied");
        }
        state.listing.value.bin = [];
    },
};
function findNote(array: Array<INote>, noteId: number): INote | undefined {
    return array && array.find((n) => n.id === noteId);
}

function removeNoteFromArray(
    array: Array<INote>,
    noteId: number
): Array<INote> {
    return array ? array.filter((n) => n.id !== noteId) : array;
}

function calculateAge(note: INote) {
    let created_at = new Date(Date.parse(note.created_at));
    let today = new Date();
    let delta = today.getTime() - created_at.getTime();
    let decimalPlaces = 2;

    note.age = humanReadableAge(delta, decimalPlaces);

    return note;
}

function humanReadableAge(deltaMS: number, decimalPlaces: number) {
    let minutes = deltaMS / (1000 * 60);
    if (minutes < 60.0) {
        if (minutes < 1.0) {
            return `Just created`;
        } else {
            return plural(minutes, decimalPlaces, "minute", "s");
        }
    }

    let hours = deltaMS / (1000 * 60 * 60);
    if (hours < 24.0) {
        return plural(hours, decimalPlaces, "hour", "s");
    }

    let days = deltaMS / (1000 * 60 * 60 * 24);
    if (days < 31.0) {
        return plural(days, decimalPlaces, "day", "s");
    }

    let months = deltaMS / (1000 * 60 * 60 * 24 * 30);
    if (months < 12) {
        return plural(months, decimalPlaces, "month", "s");
    }

    let years = deltaMS / (1000 * 60 * 60 * 24 * 365.25);
    return plural(years, decimalPlaces, "year", "s");
}
