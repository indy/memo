export const initialState = {
  user: undefined,
  activeTopBarMenuItem: '',
  categories: [],
  triageCategory: undefined,
  listing: {
    notes: undefined,
    triaged: undefined,
    bin: undefined
  }
};

// Message names are in 'object-verb' convention.
// Verbs is in the past tense mean that the new state is reflecting changes made on the server
//
export const reducer = (state, action) => {
  switch (action.type) {
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
  case 'triage-category-set':
    return {
      ...state,
      triageCategory: action.triageCategory
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
