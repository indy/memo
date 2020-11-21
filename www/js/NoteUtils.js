import { useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';

export function ensureListingLoaded(resource, url) {
  const [state, dispatch] = useStateValue();

  useEffect(() => {
    if(!state.listing[resource]) {
      fetchListing(dispatch, resource, url);
    }
  }, []);
}

export async function fetchListing(dispatch, resource, url) {
  const listing = await Net.get(url || `/api/${resource}`);
  setListing(dispatch, resource, listing);
}

export function setListing(dispatch, resource, listing) {
  dispatch({
    type: 'setListing',
    resource,
    listing
  });
}
