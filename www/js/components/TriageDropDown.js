import { html, useState } from '/lib/preact/mod.js';
import { ensureListingLoaded } from '/js/NoteUtils.js';

function TriageDropDown({ noteId, categories, pigment, cardFullHeightFn, onSelectCallback }) {
  const [showList, setShowList] = useState(false);

  ensureListingLoaded('triaged');

  function onToggleShowList(e) {
    e.preventDefault();
    cardFullHeightFn(!showList);
    setShowList(!showList);
  }

  function onTriageDropDownSelect(e) {
    e.preventDefault();

    const value = e.target.textContent;
    const cat = categories.find(c => c.title === value);

    setShowList(!showList);

    if (cat) {
      onSelectCallback(noteId, cat);
    }
  }

  function buildTriageButton() {
    return html`<button class="${pigment.classHi} button button-triage"
                        onClick=${ onToggleShowList }>
                  <span class="button-title-ellipses">Triage</span>
                </button>`;
  }

  function buildTriageList() {
    let categoryOptions = categories.map(c => html`<li class="triage-dropdown-item  ${pigment.classHi}"
                                                       onClick=${ onTriageDropDownSelect }>
                                                     ${c.title}
                                                   </li>`);
    return html`<div>
                  <button class="${pigment.classHi} button"
                          onClick=${ onToggleShowList }>
                    Cancel
                  </button>
                  <ul class="triage-dropdown-list">
                    ${categoryOptions}
                  </ul>
                </div>`;
  }

  return html`<div class="triage-dropdown card-action-cell">
                ${ !showList && buildTriageButton()}
                ${ showList && buildTriageList()}
              </div>`;
}

export { TriageDropDown };
