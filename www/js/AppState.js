export const initialState = {
  user: undefined,
  // when a user is logged in:
  // user: {
  //   username: ...
  //   email: ...
  // },

  listing: {
    notes: undefined,
    'triaged-notes': undefined
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
      let listing = {...state.listing };
      listing[action.resource] = action.listing;

      let newState = {
        ...state,
        listing: listing
      };

      return newState;
    }
  case 'append-note-to-listing':
    {
      let listing = { ...state.listing };

      if (!listing.notes) {
        listing.notes = [];
      }

      listing.notes.unshift(action.note);

      let newState = {
        ...state,
        listing
      };

      return newState;
    }
  case 'triage-note':
    {
      let listing = { ...state.listing };

      // remove note from listing.notes
      listing.notes = removeNoteFromArray(listing.notes, action.note.id);

      if (listing['triaged-notes']) {
        listing['triaged-notes'].unshift(action.note);
      }

      let newState = {
        ...state,
        listing
      };

      return newState;
    }
  case 'delete-note':
    {
      let listing = { ...state.listing };

      // remove note from listing.notes
      listing.notes = removeNoteFromArray(listing.notes, action.note.id);
      listing['triaged-notes'] = removeNoteFromArray(listing['triaged-notes'], action.note.id);

      let newState = {
        ...state,
        listing
      };

      return newState;
    }
  default:
    return state;
  }
};

function removeNoteFromArray(array, noteId) {
  return array ? array.filter(n => n.id !== noteId) : array;
}
