import { h, createContext, ComponentChildren } from "preact";
import { signal } from "@preact/signals";
import { useContext } from "preact/hooks";

import { IUser, IState, INote, IListing, ICategory } from "./types";

import { plural } from "./JsUtils";

const emptyUser: IUser = {
    username: "",
    email: "",
    admin: { dbName: "" },
};

const state: IState = {
    user: signal(emptyUser),
    wasmInterface: undefined,
    settings: signal({
        // note: extra setting variables are declared in
        // ColourCreator.js::augmentSettingsWithCssModifierParameters
        hueOffset: 0,
        hueDelta: 30,
    }),
    showTriageDrawer: signal(false),
    activeTopBarMenuItem: signal(""),
    triageLabel: signal("triaged"),
    categories: signal([]),
    listing: signal({
        notes: [],
        triaged: [],
        category: {},
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

const DEBUG_APP_STATE = false;

export const AppStateChange = {
    routeChanged: function (url: string) {
        if (DEBUG_APP_STATE) {
            console.log("routeChanged");
        }
        if (url === "/") {
            state.activeTopBarMenuItem.value = "notes";
        } else if (url === "/bin") {
            state.activeTopBarMenuItem.value = "bin";
        } else {
            state.activeTopBarMenuItem.value = "triaged";
        }
    },
    userLogin: function (
        user: IUser,
        categories: Array<ICategory>,
        notes: Array<INote>,
        bin: Array<INote>
    ) {
        if (DEBUG_APP_STATE) {
            console.log("userLogin");
        }

        let cats: { [key: string]: Array<INote> } = {};
        categories.forEach((c) => (cats[c.id] = []));

        let listing: IListing = {
            bin: bin.map(calculateAge),
            notes: notes.map(calculateAge),
            category: cats,
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
    showTriageDrawer: function (show: boolean) {
        if (DEBUG_APP_STATE) {
            console.log("showTriageDrawer");
        }

        state.showTriageDrawer.value = show;
    },
    triageMenuItemLabel: function (title: string) {
        if (DEBUG_APP_STATE) {
            console.log("triageMenuItemLabel");
        }
        state.triageLabel.value = title;
    },
    triageDrawerDefaultLabel: function () {
        if (DEBUG_APP_STATE) {
            console.log("triageDrawerDefaultLabel");
        }
        state.triageLabel.value = "triaged";
    },
    loadedCategoryNotes: function (categoryId: number, notes: Array<INote>) {
        if (DEBUG_APP_STATE) {
            console.log("loadedCategoryNotes");
        }
        let listing: IListing = { ...state.listing.value };

        listing.category[categoryId] = notes.map(calculateAge);

        state.listing.value = listing;
    },
    listingNoteAppended: function (note: INote) {
        if (DEBUG_APP_STATE) {
            console.log("listingNoteAppended");
        }

        let listing: IListing = { ...state.listing.value };

        if (note.categoryId) {
            if (!listing.category[note.categoryId]) {
                listing.category[note.categoryId] = [];
            }
        } else {
            if (!listing.notes) {
                listing.notes = [];
            }
        }

        let arr = note.categoryId
            ? listing.category[note.categoryId]
            : listing.notes;
        arr.unshift(note);

        state.listing.value = listing;
    },
    notePinStateUpdated: function (n: INote) {
        if (DEBUG_APP_STATE) {
            console.log("notePinStateUpdated");
        }

        let listing = { ...state.listing.value };

        let note: INote = findNote(
            n.categoryId ? listing.category[n.categoryId] : listing.notes,
            n.id
        )!;

        note.pinned = n.pinned;

        state.listing.value = listing;
    },
    noteBinned: function (n: INote) {
        // add a parameter to help find the array that the note is in
        if (DEBUG_APP_STATE) {
            console.log("noteBinned");
        }

        let listing = { ...state.listing.value };

        if (n.categoryId) {
            // binning a triaged note
            listing.category[n.categoryId] = removeNoteFromArray(
                listing.category[n.categoryId],
                n.id
            );
        } else {
            // binning a note from the inbox
            listing.notes = removeNoteFromArray(listing.notes, n.id);
        }

        if (listing.bin) {
            listing.bin.unshift(n);
        }

        state.listing.value = listing;
    },
    noteContentUpdated: function (n: INote) {
        // maybe with another parameter showing which list the note is in
        if (DEBUG_APP_STATE) {
            console.log("noteContentUpdated");
        }

        let listing = { ...state.listing.value };
        let arr = n.categoryId ? listing.category[n.categoryId] : listing.notes;
        let note = findNote(arr, n.id)!;

        note.content = n.content;
        note.title = n.title;
        note.pinned = n.pinned;

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

        if (note.categoryId) {
            listing.category[note.categoryId] = removeNoteFromArray(
                listing.category[note.categoryId],
                note.id
            );
        }

        note.categoryId = undefined;
        note.triagedAt = undefined;
        listing.notes.unshift(note);

        state.listing.value = listing;
    },
    settingsColourScalar: function (id: string, value: string) {
        if (DEBUG_APP_STATE) {
            console.log("settingsColourScalar");
        }
        let newSettings = { ...state.settings.value };
        newSettings[id] = parseInt(value, 10);

        state.settings.value = newSettings;
    },
    settingsColourTriple: function (
        id: string,
        value: [string, string, string]
    ) {
        if (DEBUG_APP_STATE) {
            console.log("settingsColourTriple");
        }
        let newSettings = { ...state.settings.value };
        newSettings.value[id] = [
            parseInt(value[0], 10),
            parseInt(value[1], 10),
            parseInt(value[2], 10),
        ];
        state.settings.value = newSettings;
    },
    noteTriaged: function (note: INote) {
        if (DEBUG_APP_STATE) {
            console.log("noteTriaged");
        }
        let listing = { ...state.listing.value };

        if (note.categoryId) {
            listing.notes = removeNoteFromArray(listing.notes, note.id);

            // only add this note to the appState's category array if
            // it's already been loaded in. (Otherwise that category
            // will only have this note in it, and since it won't be
            // empty the app won't request the full list from the server.)
            //
            if (listing.category[note.categoryId].length > 0) {
                listing.category[note.categoryId].unshift(note);
            }
        } else {
            console.error("note should have a categoryId");
            console.error(note);
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

        if (note.categoryId) {
            listing.category[note.categoryId].unshift(note);
        } else {
            listing.notes.unshift(note);
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
    let createdAt = new Date(Date.parse(note.createdAt));
    let today = new Date();
    let delta = today.getTime() - createdAt.getTime();
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
