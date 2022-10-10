import { h, Fragment, useState } from '../../lib/preact/mod.js';
import Net from '../Net.js';

function TriageDropDown({ dispatch, noteId, categories, pigment, cardFullHeightFn }) {
    const [showList, setShowList] = useState(false);

    function onTriageCategorySelected(category) {
        Net.post(`/api/notes/${ noteId }/triage`, category).then(triagedNote => {
            dispatch({
                type: 'note-triaged',
                note: triagedNote
            });
        });
    }

    function onToggleShowList(e) {
        e.preventDefault();
        cardFullHeightFn(!showList);
        setShowList(!showList);
    }

    function onTriageDropDownSelect(e) {
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
