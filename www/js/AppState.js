export const initialState = {
  user: undefined,
  settings: {
    // note: extra setting variables are declared in
    // ColourCreator.js::augmentSettingsWithCssModifierParameters
    hueOffset: 0,
    hueDelta: 30
  },
  activeTopBarMenuItem: '',
  categories: [],
  listing: {
    notes: undefined,
    triaged: undefined,
    bin: undefined
  }
};

// - Message names are in 'object-verb' convention.
// - Verbs is in the past tense mean that the new state is reflecting changes made
//   by another 'source of ground truth', e.g. on the server, preact's routing, etc
// - Verbs in the present tense mean that this state system holds the definitive truth
//
export const reducer = (state, action) => {
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
      let activeTopBarMenuItem = '';
      if (action.url === '/') {
        activeTopBarMenuItem = 'notes';
      } else if (action.url === '/triaged') {
        activeTopBarMenuItem = 'triaged';
      } else if (action.url === '/bin') {
        activeTopBarMenuItem = 'bin';
      }

      return {
        ...state,
        activeTopBarMenuItem
      };
    }
  case 'user-set':
    return {
      ...state,
      user: action.user
    };
  case 'category-deleted':
    {
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.deletedCategory.id)
      }
    }
  case 'categories-set':
    return {
      ...state,
      categories: action.categories
    };
  case 'listing-set':
    {
      let listing = getListingFromState(state);

      listing[action.resource] = action.listing;

      return updateStateWithListing(state, listing);
    }
  case 'listing-note-appended':
    {
      let listing = getListingFromState(state);

      if (!listing.notes) {
        listing.notes = [];
      }

      listing.notes.unshift(action.note);

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

      listing.triaged = removeNoteFromArray(listing.triaged, action.note.id);

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
      listing.triaged = removeNoteFromArray(listing.triaged, action.note.id);

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

function findNote(array, noteId) {
  return array && array.find(n => n.id === noteId);
}

function removeNoteFromArray(array, noteId) {
  return array ? array.filter(n => n.id !== noteId) : array;
}

function getListingFromState(state) {
  let listing = { ...state.listing };
  return listing;
}

function updateStateWithListing(state, listing) {
  let newState = {
    ...state,
    listing
  };

  return newState;
}
