import { html, route, useState } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { parseNoteContent, parseNoteTitle, ensureListingLoaded, notePigment, partitionPinnedNotes } from '/js/NoteUtils.js';
import { svgBin, svgPinned, svgUnpinned } from '/js/svgIcons.js';
import { useStateValue } from '/js/StateProvider.js';

import Card from '/js/components/Card.js';
import { TriageDropDown } from '/js/components/TriageDropDown.js';

export default function BaseNote({ id, noteKind }) {
  const [state, dispatch] = useStateValue();
  const [editing, setEditing] = useState(false);

  ensureListingLoaded(noteKind);

  if (!state.listing[noteKind]) {
    return html`<article/>`;
  }

  function onEditClicked(e) {
    e.preventDefault();
    setEditing(!editing);
  }

  function getNoteById(id) {
    let res = state.listing[noteKind].find(n => n.id === id);
    if (!res) {
      // isg hack: when triaging a note it may move from noteKind 'notes' to noteKind 'triaged', so look there
      res = state.listing.triaged.find(n => n.id === id);
    }
    return res;
  }

  const noteId = parseInt(id, 10);
  const note = getNoteById(noteId);

  function onDeleteClicked(e) {
    e.preventDefault();
    Net.post(`/api/notes/${ note.id }/bin`, {}).then(n => {
      dispatch({
        type: 'note-binned',
        note
      });
      if (noteKind === 'triaged') {
        route('/triaged');
      } else {
        route('/');
      }

    });
  }

  let editButtonText = editing ? "Cancel Editing" : "Edit";

  const pigment = notePigment(id);

  const [fullHeight, setFullHeight] = useState(true);

  function onTriageCategorySelected(noteId, category) {
    Net.post(`/api/notes/${ noteId }/triage`, category).then(triagedNote => {
      dispatch({
        type: 'note-triaged',
        note: triagedNote
      });
    });
  }

  function onPinnedClicked(e) {
    e.preventDefault();

    let data = {
      ...note,
      pinned: !note.pinned
    };
    Net.put(`/api/notes/${note.id}`, data).then(n => {
      dispatch({
        type: 'note-pinstate-updated',
        note: n
      });
    });
  }

  function onFinishedEditing(updatedTitle, updatedContent) {
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

  const resource = noteKind;
  const categories = state.categories;

  return html`<${Card} onFinishedEditing=${ onFinishedEditing } editing=${editing} note=${note} resource=${resource} pigment=${pigment} fullHeight=${fullHeight} cardClass="wider-card">
                  <button class="${pigment.classHi} button card-action-cell" onClick=${ onEditClicked }>${ editButtonText }</button>
                  <${TriageDropDown} noteId=${note.id}
                                     categories=${categories}
                                     pigment=${pigment}
                                     cardFullHeightFn=${setFullHeight}
                                     onSelectCallback=${onTriageCategorySelected}/>
                  <button class="${pigment.classHi} button card-action-cell" onClick=${ onPinnedClicked }>${ note.pinned ? svgPinned(`--fg-clock-${pigment.numString}`) : svgUnpinned(`--fg-clock-${pigment.numString}`) }</button>
                  <button class="${pigment.classHi} button card-action-cell" onClick=${ onDeleteClicked }>${ svgBin(`--fg-clock-${pigment.numString}`) }</button>
              </${Card}>`;

}
