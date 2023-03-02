import { h, createContext, ComponentChildren } from "preact";
import { signal } from "@preact/signals";
import { useContext } from "preact/hooks";

import {
    User,
    State,
    Note,
    Listing,
    Category,
    LoadState,
    NoteLocation,
} from "./types";

const emptyUser: User = {
    username: "",
    email: "",
    admin: { dbName: "" },
};

const state: State = {
    user: signal(emptyUser),
    wasmInterface: undefined,
    settings: signal({
        // note: extra setting variables are declared in
        // ColourCreator.js::augmentSettingsWithCssModifierParameters
        hueOffset: 0,
        hueDelta: 30,
    }),
    showCategoryDrawer: signal(false),
    activeTopBarMenuItem: signal(NoteLocation.Inbox),
    groupLabel: signal("categories"),
    categories: signal([]),
    listing: signal({
        inbox: [],
        group: {},
        bin: [],
    }),
    loaded: signal({
        inbox: LoadState.NotLoaded,
        group: {},
        bin: LoadState.NotLoaded,
    }),
};

export const initialState = state;

export const AppStateContext = createContext(state);

export const AppStateProvider = ({
    state,
    children,
}: {
    state: State;
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
            state.activeTopBarMenuItem.value = NoteLocation.Inbox;
        } else if (url === "/bin") {
            state.activeTopBarMenuItem.value = NoteLocation.Bin;
        } else {
            state.activeTopBarMenuItem.value = NoteLocation.Group;
        }
    },
    userLogin: function (
        user: User,
        categories: Array<Category>
        // notes: Array<Note>,
        // bin: Array<Note>
    ) {
        if (DEBUG_APP_STATE) {
            console.log("userLogin");
        }

        let cats: { [key: string]: Array<Note> } = {};
        let catsLoaded: { [key: string]: LoadState } = {};
        categories.forEach((c) => {
            cats[c.id] = [];
            catsLoaded[c.id] = LoadState.NotLoaded;
        });

        let listing = {
            ...state.listing.value,
            group: cats,
        };
        let loaded = {
            ...state.loaded.value,
            group: catsLoaded,
        };
        // let listing: Listing = {
        //     bin: bin.map(calculateAge),
        //     notes: notes.map(calculateAge),

        // };

        state.user.value = user;
        state.categories.value = categories;
        state.listing.value = listing;
        state.loaded.value = loaded;
    },
    setToLoading: function (kind: NoteLocation, categoryId?: number) {
        if (DEBUG_APP_STATE) {
            console.log("setToLoading");
        }

        let loaded = { ...state.loaded.value };

        switch (kind) {
            case NoteLocation.Inbox:
                loaded.inbox = LoadState.Loading;
                break;
            case NoteLocation.Group:
                if (categoryId) {
                    loaded.group[categoryId] = LoadState.Loading;
                } else {
                    console.error(
                        `setToLoading given a NoteLocation.Group without a categoryId`
                    );
                }
                break;
            case NoteLocation.Bin:
                loaded.bin = LoadState.Loading;
                break;
        }

        state.loaded.value = loaded;
    },
    loadedNotes: function (
        notes: Array<Note>,
        kind: NoteLocation,
        categoryId?: number
    ) {
        if (DEBUG_APP_STATE) {
            console.log("loadedNotes");
        }
        let loaded = { ...state.loaded.value };
        let listing = { ...state.listing.value };

        switch (kind) {
            case NoteLocation.Inbox:
                loaded.inbox = LoadState.Loaded;
                listing.inbox = notes.map(calculateAge);
                break;
            case NoteLocation.Group:
                if (categoryId) {
                    loaded.group[categoryId] = LoadState.Loaded;
                    listing.group[categoryId] = notes.map(calculateAge);
                } else {
                    console.error(
                        `loadedNotes given a NoteLocation.Group without a categoryId`
                    );
                }
                break;
            case NoteLocation.Bin:
                loaded.bin = LoadState.Loaded;
                listing.bin = notes.map(calculateAge);
                break;
        }

        state.listing.value = listing;
        state.loaded.value = loaded;
    },
    userLogout: function () {
        if (DEBUG_APP_STATE) {
            console.log("userLogout");
        }

        let user: User = { ...state.user.value };
        user.username = "";

        state.user.value = user;
    },
    showCategoryDrawer: function (show: boolean) {
        if (DEBUG_APP_STATE) {
            console.log("showCategoryDrawer");
        }

        state.showCategoryDrawer.value = show;
    },
    groupMenuItemLabel: function (title: string) {
        if (DEBUG_APP_STATE) {
            console.log("groupMenuItemLabel");
        }
        state.groupLabel.value = title;
    },
    groupDrawerDefaultLabel: function () {
        if (DEBUG_APP_STATE) {
            console.log("groupDrawerDefaultLabel");
        }
        state.groupLabel.value = "categories";
    },
    listingNoteAppended: function (note: Note) {
        if (DEBUG_APP_STATE) {
            console.log("listingNoteAppended");
        }

        let listing: Listing = { ...state.listing.value };

        if (note.categoryId) {
            if (!listing.group[note.categoryId]) {
                listing.group[note.categoryId] = [];
            }
        } else {
            if (!listing.inbox) {
                listing.inbox = [];
            }
        }

        let arr = note.categoryId
            ? listing.group[note.categoryId]
            : listing.inbox;
        arr.unshift(note);

        state.listing.value = listing;
    },
    notePinStateUpdated: function (n: Note) {
        if (DEBUG_APP_STATE) {
            console.log("notePinStateUpdated");
        }

        let listing = { ...state.listing.value };

        let note: Note = findNote(
            n.categoryId ? listing.group[n.categoryId] : listing.inbox,
            n.id
        )!;

        note.pinned = n.pinned;

        state.listing.value = listing;
    },
    noteBinned: function (n: Note) {
        // add a parameter to help find the array that the note is in
        if (DEBUG_APP_STATE) {
            console.log("noteBinned");
        }

        let listing = { ...state.listing.value };

        if (n.categoryId) {
            // binning a grouped note
            listing.group[n.categoryId] = removeNoteFromArray(
                listing.group[n.categoryId],
                n.id
            );
        } else {
            // binning a note from the inbox
            listing.inbox = removeNoteFromArray(listing.inbox, n.id);
        }

        if (listing.bin) {
            listing.bin.unshift(n);
        }

        state.listing.value = listing;
    },
    noteContentUpdated: function (n: Note) {
        // maybe with another parameter showing which list the note is in
        if (DEBUG_APP_STATE) {
            console.log("noteContentUpdated");
        }

        let listing = { ...state.listing.value };
        let arr = n.categoryId ? listing.group[n.categoryId] : listing.inbox;
        let note = findNote(arr, n.id)!;

        note.content = n.content;
        note.title = n.title;
        note.pinned = n.pinned;

        state.listing.value = listing;
    },
    categoryDeleted: function (categoryId: number) {
        if (DEBUG_APP_STATE) {
            console.log("categoryDeleted");
        }
        state.categories.value = state.categories.value.filter(
            (c: Category) => c.id !== categoryId
        );
        let listing = { ...state.listing.value };

        delete listing.group[categoryId];

        state.listing.value = listing;
    },
    categoriesSet: function (categories: Array<Category>) {
        if (DEBUG_APP_STATE) {
            console.log("categoriesSet");
        }

        let listing = { ...state.listing.value };

        for (let i: number = 0; i < categories.length; i++) {
            if (!listing.group[categories[i].id]) {
                listing.group[categories[i].id] = [];
            }
        }
        state.listing.value = listing;
        state.categories.value = categories;
    },
    noteUntriaged: function (noteId: number, categoryId: number) {
        if (DEBUG_APP_STATE) {
            console.log("noteUntriaged");
        }

        let listing = { ...state.listing.value };

        let note = findNote(listing.group[categoryId], noteId);
        if (note) {
            listing.group[categoryId] = removeNoteFromArray(
                listing.group[categoryId],
                noteId
            );

            note.categoryId = undefined;
            note.triagedAt = undefined;
            listing.inbox.unshift(note);
        }

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
        value: [number, number, number]
    ) {
        if (DEBUG_APP_STATE) {
            console.log("settingsColourTriple");
        }
        let newSettings = { ...state.settings.value };

        newSettings[id] = value;

        state.settings.value = newSettings;
    },
    noteTriaged: function (note: Note, currentCategoryId?: number) {
        if (DEBUG_APP_STATE) {
            console.log("noteTriaged");
        }
        let listing = { ...state.listing.value };

        if (note.categoryId) {
            // if we're moving a note from one category to another, remove
            // it from the previous category
            //

            if (currentCategoryId) {
                listing.group[currentCategoryId] = removeNoteFromArray(
                    listing.group[currentCategoryId],
                    note.id
                );
            } else {
                listing.inbox = removeNoteFromArray(listing.inbox, note.id);
            }

            // only add this note to the appState's category array if
            // it's already been loaded in. (Otherwise that category
            // will only have this note in it, and since it won't be
            // empty the app won't request the full list from the server.)
            //
            if (listing.group[note.categoryId].length > 0) {
                listing.group[note.categoryId].unshift(note);
            }
        } else {
            console.error("note should have a categoryId");
            console.error(note);
        }

        state.listing.value = listing;
    },
    noteDeleted: function (note: Note) {
        if (DEBUG_APP_STATE) {
            console.log("noteDeleted");
        }
        let listing = { ...state.listing.value };

        listing.bin = removeNoteFromArray(listing.bin, note.id);

        state.listing.value = listing;
    },
    noteUnbinned: function (note: Note) {
        if (DEBUG_APP_STATE) {
            console.log("noteUnbinned");
        }

        let listing = { ...state.listing.value };
        listing.bin = removeNoteFromArray(listing.bin, note.id);

        if (note.categoryId) {
            listing.group[note.categoryId].unshift(note);
        } else {
            listing.inbox.unshift(note);
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
function findNote(array: Array<Note>, noteId: number): Note | undefined {
    return array && array.find((n) => n.id === noteId);
}

function removeNoteFromArray(array: Array<Note>, noteId: number): Array<Note> {
    return array ? array.filter((n) => n.id !== noteId) : array;
}

function calculateAge(note: Note) {
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

function plural(
    num: number,
    decimalPlaces: number,
    phrase: string,
    suffix: string
) {
    let showNum = num.toFixed(decimalPlaces);
    return num === 1 ? `${showNum} ${phrase}` : `${showNum} ${phrase}${suffix}`;
}
