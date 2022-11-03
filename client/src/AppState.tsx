import { h, createContext } from 'preact';
import { signal } from '@preact/signals';

import { WasmInterfaceProvider }        from './WasmInterfaceProvider';

import { useContext, useReducer } from 'preact/hooks';
import { plural } from "./JsUtils";

import { IReducer, IState, IAction, INote, ITriagedNote, IListing, ICategory } from "./types";

export const initialState: IState = {
    user: undefined,
    settings: {
        // note: extra setting variables are declared in
        // ColourCreator.js::augmentSettingsWithCssModifierParameters
        hueOffset: 0,
        hueDelta: 30
    },
    activeTopBarMenuItem: signal(''),
    categories: [],
    listing: {
        notes: [],
        triaged: [],
        bin: []
    }
};

// - Message names are in 'object-verb' convention.
// - Verbs is in the past tense mean that the new state is reflecting changes made
//   by another 'source of ground truth', e.g. on the server, preact's routing, etc
// - Verbs in the present tense mean that this state system holds the definitive truth
//

// function fuckfn(action: IAction): void {}
// let fuck = [initialState, fuckfn]
export const AppStateContext = createContext({});

export const AppStateProvider = ({reducer, initialState, children}: {reducer: IReducer, initialState: IState, children: any}) => {
    return <AppStateContext.Provider value={useReducer(reducer, initialState)}>
        { children }
    </AppStateContext.Provider>;
};

export const getAppState = () => useContext(AppStateContext);


export const reducer = (state: IState, action: IAction) => {
    switch (action.type) {
    case 'settings-colour-triple': // these triples are in HSLuv colour space
        {
            let newState = { ...state };
            newState.settings[action.id] = [parseInt(action.value[0], 10),
                                            parseInt(action.value[1], 10),
                                            parseInt(action.value[2], 10)];
            return newState;
        }
    case 'settings-colour-scalar':
        {
            let newState = { ...state };
            newState.settings[action.id] = parseInt(action.value, 10);
            return newState;
        }
        case 'route-changed':
            {
                let newState = { ...state };

                if (action.url === '/') {
                    newState.activeTopBarMenuItem.value = 'notes';
                } else if (action.url === '/triaged') {
                    newState.activeTopBarMenuItem.value = 'triaged';
                } else if (action.url === '/bin') {
                    newState.activeTopBarMenuItem.value = 'bin';
                }

                return newState;
            }
    case 'user-login': {
        let newState = { ...state };

        newState.user = action.user;

        newState.categories = action.categories;

        newState.listing['notes'] = action.notes.map(calculateAge);
        newState.listing['triaged'] = action.triaged.map(calculateAge);
        newState.listing['bin'] = action.bin.map(calculateAge);

        return newState;
    }
    case 'user-logout': {
        return {
            ...state,
            user: undefined
        }
    }
    case 'category-deleted':
        {
            return {
                ...state,
                categories: state.categories.filter((c: ICategory)  => c.id !== action.deletedCategory.id)
            }
        }
    case 'categories-set':
        return {
            ...state,
            categories: action.categories
        };
    case 'listing-note-appended':
        {
            let listing = getListingFromState(state);

            if (!listing.notes) {
                listing.notes = [];
            }

            listing.notes.unshift(action.note);

            return updateStateWithListing(state, listing);
        }
    case 'note-pinstate-updated':
        {
            let listing = getListingFromState(state);
            let note = findNote(listing.notes, action.note.id);

            if (note) {
                note.pinned = action.note.pinned;
            } else {
                note = findNote(listing.triaged, action.note.id);
                if (note) {
                    note.pinned = action.note.pinned;
                } else {
                    note = findNote(listing.bin, action.note.id);
                    if (note) {
                        note.pinned = action.note.pinned;
                    }
                }
            }

            return updateStateWithListing(state, listing);
        }
    case 'note-content-updated':
        {
            let listing = getListingFromState(state);

            let note = findNote(listing.notes, action.note.id)
                || findNote(listing.triaged, action.note.id)
                || findNote(listing.bin, action.note.id);
            if (note) {
                note.content = action.note.content;
                note.title = action.note.title;
                note.pinned = action.note.pinned;
            }

            return updateStateWithListing(state, listing);
        }
    case 'note-triaged':
        {
            let listing = getListingFromState(state);

            // remove note from listing.notes
            listing.notes = removeNoteFromArray(listing.notes, action.note.id);

            if (listing.triaged) {
                listing.triaged.unshift(action.note);
            }

            return updateStateWithListing(state, listing);
        }
    case 'note-untriaged':
        {
            let listing = getListingFromState(state);

            listing.triaged = removeTriagedNoteFromArray(listing.triaged, action.note.id);

            if (listing.notes) {
                // todo: maybe insert this note in the correct position, not just at the beginning
                listing.notes.unshift(action.note);
            }

            return updateStateWithListing(state, listing);
        }
    case 'note-binned':
        {
            let listing = getListingFromState(state);

            listing.notes = removeNoteFromArray(listing.notes, action.note.id);
            listing.triaged = removeTriagedNoteFromArray(listing.triaged, action.note.id);

            if (listing.bin) {
                listing.bin.unshift(action.note);
            }

            return updateStateWithListing(state, listing);
        }
    case 'note-deleted':
        {
            let listing = getListingFromState(state);

            listing.bin = removeNoteFromArray(listing.bin, action.note.id);

            return updateStateWithListing(state, listing);
        }
    case 'note-unbinned':
        {
            let listing = getListingFromState(state);

            listing.bin = removeNoteFromArray(listing.bin, action.note.id);

            // todo: make this more robust
            if (action.note.category_id) {
                if (listing.triaged) {
                    listing.triaged.unshift(action.note);
                }
            } else {
                if (listing.notes) {
                    listing.notes.unshift(action.note);
                }
            }

            return updateStateWithListing(state, listing);
        }
    case 'bin-emptied':
        {
            let listing = getListingFromState(state);

            listing.bin = [];

            return updateStateWithListing(state, listing);
        }
    default:
        return state;
    }
};

function findNote(array: Array<INote>, noteId: number): INote | undefined {
    return array && array.find(n => n.id === noteId);
}

function removeNoteFromArray(array: Array<INote>, noteId: number): Array<INote> {
    return array ? array.filter(n => n.id !== noteId) : array;
}

function removeTriagedNoteFromArray(array: Array<ITriagedNote>, noteId: number): Array<ITriagedNote> {
    return array ? array.filter(n => n.id !== noteId) : array;
}

function getListingFromState(state: IState): IListing {
    let listing = { ...state.listing };
    return listing;
}

function updateStateWithListing(state: IState, listing: IListing): IState {
    let newState = {
        ...state,
        listing
    };

    return newState;
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
