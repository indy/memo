import { h, useEffect } from '/lib/preact/mod.js';

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
    type: 'listing-set',
    resource,
    listing
  });
}

// simple parsing for urls and newlines only. A stupid regexp approach will do here,
// but write an actual lexer+parser+compiler if other markup is required
//
export function parseNoteContent(note) {
  const lines = note.content.split("\n");
  const elems = [];

  lines.forEach((line, i) => {
    splitLineByHyperlinks(line).forEach(seg => {
      if (isHyperlinkSegment(seg)) {
        elems.push(h("a", { href: ensureLinkable(seg) }, seg));
      } else {
        elems.push(seg);
      }
    });
    if (i < lines.length - 1) {
      elems.push(h("br"));
    }
  });

  return h("p", {}, elems);
}

function splitLineByHyperlinks(line) {
  // put space at the end of the line for the split regexp  to work with a regexp that ends a line
  let lineWithSpace = line + " ";

  let segs = lineWithSpace.split(/(https:\/\/.*?|http:\/\/.*?|www\..*?)(\s+)/).filter(seg => seg.length > 0);

  // remove space at end of the last seg
  segs[segs.length - 1] = segs[segs.length - 1].trim();

  return segs;
}

function isHyperlinkSegment(seg) {
  return seg.startsWith("https://") || seg.startsWith("http://") || seg.startsWith("www.");
}

function ensureLinkable(seg) {
  return seg.startsWith("www.") ? "//" + seg : seg;
}
