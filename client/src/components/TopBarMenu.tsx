import { h } from "preact";
import { Link } from "preact-router";

import { NoteLocation } from "../types";

import { getAppState, AppStateChange } from "../AppState";

export default function TopBarMenu() {
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

    let style: Record<NoteLocation, string> = {
        [NoteLocation.Inbox]: "top-bar-menuitem pigment-inbox",
        [NoteLocation.Group]: "top-bar-menuitem pigment-group",
        [NoteLocation.Bin]: "top-bar-menuitem pigment-bin",
    };
    style[appState.activeTopBarMenuItem.value] += " top-bar-menuitem-active";

    function onTriagedClicked(e: MouseEvent) {
        e.preventDefault();
        AppStateChange.showCategoryDrawer(!appState.showCategoryDrawer.value);
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
            <Link class={style[NoteLocation.Inbox]} href={"/"}>
                inbox
            </Link>
            <a class={style[NoteLocation.Group]} onClick={onTriagedClicked}>
                {appState.groupLabel.value}
            </a>
            <Link class={style[NoteLocation.Bin]} href={"/bin"}>
                bin
            </Link>
        </div>
    );
}
