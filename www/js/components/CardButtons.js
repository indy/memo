import { html, route, useState } from '/lib/preact/mod.js';
import Net from '/js/Net.js';
import { svgBin, svgPinned, svgUnpinned } from '/js/svgIcons.js';

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

    return html`<button class="${pigment.classAlt} button card-action-cell" onClick=${ onDeleteClicked }>
                ${ svgBin(`--clock-${pigment.numString}-fg`) }
              </button>`;
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

    const icon = note.pinned ? svgPinned(`--clock-${pigment.numString}-fg`) : svgUnpinned(`--clock-${pigment.numString}-fg`);

    return html`<button class="${pigment.classAlt} button card-action-cell" onClick=${ onPinnedClicked }>
                ${ icon }
              </button>`;
}


function ButtonEdit({ pigment, editing, callback}) {
    function onEditClicked(e) {
        e.preventDefault();
        callback(!editing);
    }

    let editButtonText = editing ? "Cancel Editing" : "Edit";

    return html`<button class="${pigment.classAlt} button card-action-cell" onClick=${ onEditClicked }>
                ${ editButtonText }
              </button>`;
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

    return html`<button class="${pigment.classAlt} button card-action-cell"
                      onClick=${ onUntriageClicked }>
                Untriage
              </button>`;
}

export { ButtonDelete, ButtonPinned, ButtonEdit, ButtonUntriage };
