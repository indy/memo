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
  case 'setUser':
    return {
      ...state,
      user: action.user
    };
  case 'setListing':
    {
      let listing = {...state.listing };
      listing[action.resource] = action.listing;

      let newState = {
        ...state,
        listing: listing
      };

      return newState;
    }
  case 'appendNoteToListing':
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
  case 'triagedNote':
    {
      let listing = { ...state.listing };

      // remove note from listing.notes
      listing.notes = listing.notes.filter(n => n.id !== action.note.id);

      if (listing['triaged-notes']) {
        listing['triaged-notes'].unshift(action.note);
      }

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
