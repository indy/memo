export const initialState = {
  user: undefined,
  // when a user is logged in:
  // user: {
  //   username: ...
  //   email: ...
  // },

  deckkindsLoaded: {
    notes: false
  },
  deckkindsListing: {
    notes: []
  }

};

export const reducer = (state, action) => {
  switch (action.type) {
  case 'setUser':
    return {
      ...state,
      user: action.user
    };
  case 'setDeckListing':
    {
      let loaded = { ...state.deckkindsLoaded };
      loaded[action.resource] = true;

      let listing = {...state.deckkindsListing };
      listing[action.resource] = action.listing;

      let newState = {
        ...state,
        deckkindsLoaded: loaded,
        deckkindsListing: listing
      };

      return newState;
    }
  default:
    return state;
  }
};
