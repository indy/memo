import { h } from "preact";
import { Link } from "preact-router";

import { getAppState, AppStateChange } from "../AppState";

function TopBarMenu() {
    const appState = getAppState();

    function loggedStatus() {
        let status = "";

        let user = appState.user.value;
        if (user) {
            status += user.username;
            if (user.admin) {
                status += ` (${user.admin.dbName})`;
            }
        } else {
            status = "Login";
        }

        return status;
    }

    function loggedLink() {
        return appState.user.value.username !== "" ? "/settings" : "/login";
    }

    let notesExtraClass: string = "";
    let triagedExtraClass: string = "";
    let binExtraClass: string = "";

    if (appState.activeTopBarMenuItem.value === "notes") {
        notesExtraClass = "top-bar-menuitem-active";
    } else if (appState.activeTopBarMenuItem.value === "bin") {
        binExtraClass = "top-bar-menuitem-active";
    } else {
        triagedExtraClass = "top-bar-menuitem-active";
    }

    let s1: string = `top-bar-menuitem pigment-notes ${notesExtraClass}`;
    let s2: string = `top-bar-menuitem pigment-triaged ${triagedExtraClass}`;
    let s3: string = `top-bar-menuitem pigment-bin ${binExtraClass}`;

    function onTriagedClicked(e: MouseEvent) {
        e.preventDefault();
        AppStateChange.showTriageDrawer(!appState.showTriageDrawer.value);
    }

    return (
        <div id="top-bar-menu" class="hr">
            <Link
                href={loggedLink()}
                id="login-menuitem"
                class="pigment-inherit"
            >
                {loggedStatus()}
            </Link>
            <Link class={s1} href={"/"}>
                notes
            </Link>
            <a class={s2} onClick={onTriagedClicked}>
                {appState.triageLabel.value}
            </a>
            <Link class={s3} href={"/bin"}>
                bin
            </Link>
        </div>
    );
}

export { TopBarMenu };
