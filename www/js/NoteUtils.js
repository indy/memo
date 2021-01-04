import { h, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';


export function notePigment(noteId) {
  const pigmentNum = (noteId % 12) + 1;
  const pigmentNumString = pigmentNum < 10 ? `0${pigmentNum}` : `${pigmentNum}`;
  const pigmentClass = `pigment-clock-${pigmentNumString}`;
  const pigmentClassHi = `${pigmentClass}-hi`;

  return {
    num: pigmentNum,
    numString: pigmentNumString,
    class: pigmentClass,
    classHi: pigmentClassHi
  }
}

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
  return parseNoteText(note.content, "p", note.id);
}

export function parseNoteTitle(note) {
  return parseNoteText(note.title, "h1", note.id);
}

export function parseCardTitle(note) {
  return parseNoteText(note.title, "h3", note.id);
}

function parseNoteText(text, parentTag, noteId) {
  const lines = text.split("\n");
  const elems = [];
  const pigment = notePigment(noteId);

  lines.forEach((line, i) => {
    splitLineByHyperlinks(line).forEach(seg => {
      if (isHyperlinkSegment(seg)) {
        elems.push(h("a", { href: ensureLinkable(seg), class: `in-note-link ${pigment.class}` }, seg));
      } else {
        elems.push(seg);
      }
    });
    if (i < lines.length - 1) {
      elems.push(h("br"));
    }
  });

  return h(parentTag, {}, elems);
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
