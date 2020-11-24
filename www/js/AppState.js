export const initialState = {
  user: undefined,
  listing: {
    notes: undefined,
    triaged: undefined,
    bin: undefined
  }

};

export const reducer = (state, action) => {
  switch (action.type) {
  case 'set-user':
    return {
      ...state,
      user: action.user
    };
  case 'set-listing':
    {
      let listing = getListingFromState(state);

      listing[action.resource] = action.listing;

      return updateStateWithListing(state, listing);
    }
  case 'append-note-to-listing':
    {
      let listing = getListingFromState(state);

      if (!listing.notes) {
        listing.notes = [];
      }

      listing.notes.unshift(action.note);

      return updateStateWithListing(state, listing);
    }
  case 'triage-note':
    {
      let listing = getListingFromState(state);

      // remove note from listing.notes
      listing.notes = removeNoteFromArray(listing.notes, action.note.id);

      if (listing.triaged) {
        listing.triaged.unshift(action.note);
      }

      return updateStateWithListing(state, listing);
    }
  case 'bin-note':
    {
      let listing = getListingFromState(state);

      listing.notes = removeNoteFromArray(listing.notes, action.note.id);
      listing.triaged = removeNoteFromArray(listing.triaged, action.note.id);

      if (listing.bin) {
        listing.bin.unshift(action.note);
      }

      return updateStateWithListing(state, listing);
    }
  case 'delete-note':
    {
      let listing = getListingFromState(state);

      listing.bin = removeNoteFromArray(listing.bin, action.note.id);

      return updateStateWithListing(state, listing);
    }
  case 'empty-bin':
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
