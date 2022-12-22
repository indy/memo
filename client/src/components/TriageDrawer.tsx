import { h } from "preact";
import { Link } from "preact-router";
import { getAppState, AppStateChange } from "../AppState";

function TriageDrawer() {
    const appState = getAppState();

    if (appState.showTriageDrawer.value) {
        console.log(appState.categories.value);

        return (
            <div class="drawer">
                { appState.categories.value.map(DrawerItem) }
            </div>
        );
    } else {
        return (
            <div>
            </div>
        );
    }
}

function DrawerItem({ id, title }: { id: number, title: string}) {

    function onLinkClicked(e: MouseEvent) {
        AppStateChange.showTriageDrawer(false);
    }

    return (
        <div class="drawer-item">
            <Link href={"/category/" + id} onClick={ onLinkClicked }>{ title }</Link>
        </div>
    )
}

export { TriageDrawer };
