import { h } from "preact";
import { useState } from "preact/hooks";
import { route } from "preact-router";

import Net from "../Net";

import { AppStateChange } from "../AppState";

export default function DeletableCategory({
    categoryId,
    label,
}: {
    categoryId: number;
    label: string;
}) {
    const [showToggle, setShowToggle] = useState(false);

    function buttonClicked(e: MouseEvent) {
        e.preventDefault();
        setShowToggle(true);
    }

    function noClicked(e: MouseEvent) {
        e.preventDefault();
        setShowToggle(false);
    }

    function yesClicked(e: MouseEvent) {
        e.preventDefault();
        setShowToggle(false);

        Net.delete(`/api/categories/${categoryId}`, {}).then(() => {
            AppStateChange.categoryDeleted(categoryId);
            route("/");
        });
    }

    return (
        <div>
            {!showToggle && (
                <button onClick={buttonClicked}>Delete {label}</button>
            )}
            {showToggle && (
                <button onClick={noClicked}>No, Cancel Delete</button>
            )}
            {showToggle && (
                <button onClick={yesClicked}>Yes, Really Delete</button>
            )}
        </div>
    );
}
