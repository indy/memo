import { h, useEffect } from '/lib/preact/mod.js';

import { useStateValue } from '/js/StateProvider.js';
import Net from '/js/Net.js';


export function finishedEditingCallback(dispatch, note, setEditing) {
  return function(updatedTitle, updatedContent) {
    let data = {
      ...note,
      content: updatedContent,
      title: updatedTitle
    };
    Net.put(`/api/notes/${note.id}`, data).then(newNote => {
      dispatch({
        type: 'note-content-updated',
        note: newNote
      });
      setEditing(false);
    });
  }
}

export function getNoteById(state, noteKind, id) {
  let res = state.listing[noteKind].find(n => n.id === id);
  if (!res) {
    // isg hack: when triaging a note it may move from noteKind 'notes' to noteKind 'triaged', so look there
    res = state.listing.triaged.find(n => n.id === id);
  }
  return res;
}

export function partitionPinnedNotes(list) {
  let pinned = [];
  let unpinned = [];

  list.forEach(n => {
    if (n.pinned) {
      pinned.push(n);
    } else {
      unpinned.push(n);
    }
  });

  pinned.sort((a, b) => b.id - a.id);
  unpinned.sort((a, b) => b.id - a.id);

  return [pinned, unpinned];
}

export function notePigment(noteId) {
  const pigmentNum = (noteId % 12) + 1;
  const pigmentNumString = pigmentNum < 10 ? `0${pigmentNum}` : `${pigmentNum}`;
  const pigmentClass = `pigment-clock-${pigmentNumString}`;
  const pigmentClassAlt = `${pigmentClass}-alt`;

  return {
    num: pigmentNum,
    numString: pigmentNumString,
    class: pigmentClass,
    classAlt: pigmentClassAlt
  }
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
