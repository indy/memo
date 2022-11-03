import { h, Fragment, route, useState } from '../../lib/preact/mod.js';
import Net from '../Net.js';
import { SvgBin, SvgPinned, SvgUnpinned } from '../svgIcons.jsx';

function ButtonDelete({ note, noteKind, pigment, dispatch }) {
    function onDeleteClicked(e) {
        e.preventDefault();

        Net.post(`/api/${ noteKind }/${ note.id }/bin`, {}).then(n => {
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

    return <button class={`${pigment.classAlt} button card-action-cell`} onClick={ onDeleteClicked }>
               <SvgBin fillColour={`--clock-${pigment.numString}-fg`}/>
           </button>;
}

function ButtonPinned({ note, pigment, dispatch }) {
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

    return <button class={`${pigment.classAlt} button card-action-cell`} onClick={ onPinnedClicked }>
               { note.pinned ?
                 <SvgPinned fillColour={`--clock-${pigment.numString}-fg`}/> :
                 <SvgUnpinned fillColour={`--clock-${pigment.numString}-fg`}/> }
           </button>;
}


function ButtonEdit({ pigment, editing, callback}) {
    function onEditClicked(e) {
        e.preventDefault();
        callback(!editing);
    }

    let editButtonText = editing ? "Cancel Editing" : "Edit";

    return <button class={`${pigment.classAlt} button card-action-cell`} onClick={ onEditClicked }>
               { editButtonText }
           </button>;
}

function ButtonUntriage({ note, pigment, dispatch}) {
    function onUntriageClicked(e) {
        e.preventDefault();
        Net.post(`/api/triaged/${ note.id }/untriage`, {}).then(n => {
            dispatch({
                type: 'note-untriaged',
                note
            });
        });
    }

    return <button class={`${pigment.classAlt} button card-action-cell`}
                   onClick={ onUntriageClicked }>
               Untriage
           </button>
}

export { ButtonDelete, ButtonPinned, ButtonEdit, ButtonUntriage };
