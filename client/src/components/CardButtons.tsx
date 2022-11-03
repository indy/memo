import { h } from 'preact';
import { route } from 'preact-router';

import Net from '../Net';
import { SvgBin, SvgPinned, SvgUnpinned } from '../svgIcons';

import { INote, IPigment } from "../types";

function ButtonDelete({ note, noteKind, pigment, dispatch }: { note: INote, noteKind: string, pigment: IPigment, dispatch: any }) {
    function onDeleteClicked(e: any) {
        e.preventDefault();

        Net.post(`/api/${ noteKind }/${ note.id }/bin`, {}).then(() => {
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

function ButtonPinned({ note, pigment, dispatch }: { note: INote, pigment: IPigment, dispatch: any }) {
    function onPinnedClicked(e: any) {
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


function ButtonEdit({ pigment, editing, callback}: { pigment: IPigment, editing: boolean, callback: any}) {
    function onEditClicked(e: any) {
        e.preventDefault();
        callback(!editing);
    }

    let editButtonText = editing ? "Cancel Editing" : "Edit";

    return <button class={`${pigment.classAlt} button card-action-cell`} onClick={ onEditClicked }>
               { editButtonText }
           </button>;
}

function ButtonUntriage({ note, pigment, dispatch}: { note: INote, pigment: IPigment, dispatch: any}) {
    function onUntriageClicked(e: any) {
        e.preventDefault();
        Net.post(`/api/triaged/${ note.id }/untriage`, {}).then(() => {
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
