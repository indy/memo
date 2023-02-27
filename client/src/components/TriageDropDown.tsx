import { h } from "preact";
import { useState } from "preact/hooks";

import Net from "../Net";

import { AppStateChange } from "../AppState";

import { ICategory, INote, IPigment } from "../types";

function TriageDropDown({
    noteId,
    categories,
    pigment,
    cardFullHeightFn,
    currentCategoryId,
}: {
    noteId: number;
    categories: Array<ICategory>;
    pigment: IPigment;
    cardFullHeightFn: Function;
    currentCategoryId?: number;
}) {
    const [showList, setShowList] = useState(false);

    function onTriageCategorySelected(category: ICategory) {
        Net.post<ICategory, INote>(
            `/api/notes/${noteId}/triage`,
            category
        ).then((triagedNote) => {
            AppStateChange.noteTriaged(triagedNote, currentCategoryId);
        });
    }

    function onToggleShowList(e: MouseEvent) {
        e.preventDefault();
        cardFullHeightFn(!showList);
        setShowList(!showList);
    }

    function onTriageDropDownSelect(e: MouseEvent) {
        e.preventDefault();

        if (e.target && e.target instanceof HTMLElement) {
            const value = e.target.textContent;
            const category = categories.find((c) => c.title === value);

            setShowList(!showList);

            if (category) {
                onTriageCategorySelected(category);
            }
        }
    }

    function onUnTriageDropDownSelect(e: MouseEvent) {
        e.preventDefault();

        if (currentCategoryId && e.target && e.target instanceof HTMLElement) {
            setShowList(!showList);

            Net.post(`/api/triaged/${noteId}/untriage`, {}).then(() => {
                AppStateChange.noteUntriaged(noteId, currentCategoryId);
            });
        }
    }

    function buildTriageButton() {
        return (
            <button
                class={`${pigment.classAlt} button button-triage`}
                onClick={onToggleShowList}
            >
                <span class="button-title-ellipses">Triage</span>
            </button>
        );
    }

    function buildTriageList() {

        let categoryOptions = [];
        if (currentCategoryId) {
            categoryOptions.push(
                <li class={`triage-dropdown-item ${pigment.classAlt}`}
                    onClick={onUnTriageDropDownSelect}>
                    UnTriage
                </li>);
        }

        categories.forEach((c) => {
            if (currentCategoryId && c.id === currentCategoryId) {
                // skip
            } else {
                categoryOptions.push(<li class={`triage-dropdown-item ${pigment.classAlt}`}
                                         onClick={onTriageDropDownSelect}>
                                         {c.title}
                                     </li>);
            }
        });

        return (
            <div>
                <button
                    class={`${pigment.classAlt} button`}
                    onClick={onToggleShowList}
                >
                    Cancel
                </button>
                <ul class="triage-dropdown-list">{categoryOptions}</ul>
            </div>
        );
    }

    return (
        <div class="triage-dropdown card-action-cell">
            {!showList && buildTriageButton()}
            {showList && buildTriageList()}
        </div>
    );
}

export { TriageDropDown };
