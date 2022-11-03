import { h } from 'preact';
import { useState } from 'preact/hooks';

import Net from '../Net';

import { AppStateChange } from '../AppState';

import { ICategory, IPigment } from "../types";

function TriageDropDown({ noteId, categories, pigment, cardFullHeightFn }: { dispatch?: any, noteId: string | number, categories: Array<ICategory>, pigment: IPigment, cardFullHeightFn: any }) {
    const [showList, setShowList] = useState(false);

    function onTriageCategorySelected(category: any) {
        Net.post(`/api/notes/${ noteId }/triage`, category).then(triagedNote => {
            AppStateChange.noteTriaged(triagedNote);
        });
    }

    function onToggleShowList(e: any) {
        e.preventDefault();
        cardFullHeightFn(!showList);
        setShowList(!showList);
    }

    function onTriageDropDownSelect(e: any) {
        e.preventDefault();

        const value = e.target.textContent;
        const category = categories.find(c => c.title === value);

        setShowList(!showList);

        if (category) {
            onTriageCategorySelected(category);
        }
    }

    function buildTriageButton() {
        return <button class={`${pigment.classAlt} button button-triage`}
                       onClick={ onToggleShowList }>
                   <span class="button-title-ellipses">Triage</span>
               </button>
    }

    function buildTriageList() {
        let categoryOptions = categories.map(c => <li class={`triage-dropdown-item ${pigment.classAlt}`}
                                                      onClick={ onTriageDropDownSelect }>
                                                      {c.title}
                                                  </li>);
        return <div>
                   <button class={`${pigment.classAlt} button`}
                           onClick={ onToggleShowList }>
                       Cancel
                   </button>
                   <ul class="triage-dropdown-list">
                       {categoryOptions}
                   </ul>
               </div>
    }

    return <div class="triage-dropdown card-action-cell">
               { !showList && buildTriageButton()}
               { showList && buildTriageList()}
           </div>
}

export { TriageDropDown };
