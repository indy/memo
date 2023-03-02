import { h } from "preact";
import { useState } from "preact/hooks";
import { Link } from "preact-router";

import { Category } from "../types";

import Net from "../Net";
import { getAppState, AppStateChange } from "../AppState";

export default function CategoryDrawer() {
    const appState = getAppState();

    let showing = appState.showCategoryDrawer.value;

    let cl = "drawer ";
    cl += showing ? "drawer-visible" : "drawer-invisible";

    return (
        <div class={ cl }>
            <CreateNewCategory/>
            {appState.categories.value.map(c => {
                return <DrawerItem id={c.id} title={c.title}/>
            })}
        </div>
    );
}

type ProtoCategory = {
    title: string;
};

function CreateNewCategory({ }) {
    const appState = getAppState();

    const [localState, setLocalState] = useState({
        activated: false,
        text: "",
        disabled: true,
    });

    function onClicked() {
        setLocalState({
            ...localState,
            activated: true,
        });
    }

    function onInput(event: Event) {
        if (event.target instanceof HTMLInputElement) {
            const value = event.target.value;
            const found = appState.categories.value.find(
                (c: Category) => c.title === value
            );

            const newState = {
                ...localState,
                disabled: !!found || value.length === 0,
                text: value,
            };

            setLocalState(newState);
        }
    }

    function newCategorySubmit(e: Event) {
        e.preventDefault();

        let protoCategory: ProtoCategory = { title: localState.text };
        Net.post<ProtoCategory, Array<Category>>(
            `/api/categories`,
            protoCategory
        ).then((latestCategories) => {
            AppStateChange.categoriesSet(latestCategories);
            setLocalState({
                ...localState,
                text: "",
                activated: false,
            });
        });
    }

    function onCancelMouseDown() {
        setLocalState({
            ...localState,
            activated: false,
        });
    }

    if (localState.activated) {
        return (
            <form class="form-inline" onSubmit={newCategorySubmit}>
                <label class="form-inline-item" for="new-category">
                    New category:
                </label>
                <input
                    class="form-inline-item"
                    type="text"
                    id="new-category"
                    name="new-category"
                    value={localState.text}
                    onInput={onInput}
                />
                <input
                    class="triaged-note-create-button-bodge form-inline-item button save-button"
                    type="submit"
                    value="Create"
                    disabled={localState.disabled}
                />
                <input
                    class="triaged-note-create-button-bodge form-inline-item button save-button"
                    onMouseDown={onCancelMouseDown}
                    type="button"
                    value="Cancel"
                />
            </form>
        );
    } else {

        let extra = "drawer-item drawer-item-new";
        return (
            <a class={extra} onClick={onClicked}>
                New Category...
            </a>
        );
    }
}

function DrawerItem({ id, title }: { id: number; title: string }) {
    function onLinkClicked() {
        AppStateChange.showCategoryDrawer(false);
    }


    let extra = "drawer-item";

    return (
        <Link class={ extra } href={"/category/" + id} onClick={onLinkClicked}>
            {title}
        </Link>
    );
}
