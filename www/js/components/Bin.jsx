import { h, Fragment, route, Link, useState } from '../../lib/preact/mod.js';

import Net from '../Net.js';
import { notePigment } from '../NoteUtils.js';
import { getAppState } from '../AppState.jsx';

import Card from './Card.jsx';

function Bin() {
    const [state, dispatch] = getAppState();

    const notes = state.listing.bin;
    const listing = notes ? notes.map(n => NoteListItem(n)) : [];


    function onDeleteClicked(e) {
        e.preventDefault();

        Net.delete(`/api/bin`, {}).then(() => {
            dispatch({
                type: 'bin-emptied'
            });
        });
    }

    return <div>
      <div class="button-container darken-border">
        { listing.length == 0 && <div>Bin is Empty</div>}
        { listing.length > 0 && <div class="button button-delete" onClick={ onDeleteClicked }>Permanently Delete</div>}
      </div>
      <div class="hr"/>
      <div class="card-holder">
        { listing }
      </div>
    </div>
}

function NoteListItem(note) {
    const [state, dispatch] = getAppState();

    const resource = 'bin';
    const pigment = notePigment(note.id);

    function onUndeleteClicked(e) {
        e.preventDefault();
        Net.post(`/api/bin/${ note.id }/unbin`, note).then(n => {
            dispatch({
                type: 'note-unbinned',
                note
            });
        });
    }

    function onDeleteClicked(e) {
        e.preventDefault();
        Net.delete(`/api/bin/${ note.id }`, {}).then(n => {
            dispatch({
                type: 'note-deleted',
                note
            });
        });
    }

    return <Card note={note} resource={resource} pigment={pigment}>
               <button class={`${pigment.classAlt} button card-action-cell`} onClick={ onUndeleteClicked }>Undelete</button>
               <button class={`${pigment.classAlt} button card-action-cell`} onClick={ onDeleteClicked }>Really Delete</button>
           </Card>
}

function BinnedNote({ id }) {
    const noteKind = 'bin';

    const [state, dispatch] = getAppState();
    const editing = false;
    const [fullHeight, setFullHeight] = useState(true);

    if (!state.listing[noteKind]) {
        // isg todo: fix this
        return <div></div>;
    }

    const noteId = parseInt(id, 10);
    const note = getNoteById(state, noteKind, noteId);
    const pigment = notePigment(id);

    return <Card editing={editing}
                 note={note}
                 resource={noteKind}
                 pigment={pigment}
                 fullHeight={fullHeight}
                 cardClass="wider-card">
           </Card>
}

export { Bin, BinnedNote };
