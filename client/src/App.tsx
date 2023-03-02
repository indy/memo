import { h } from "preact";

import { State } from "./types";

import { Router, route, RouterOnChangeArgs } from "preact-router";
import { AppStateChange, AppStateProvider, getAppState } from "./AppState";

import NoteView from "./components/NoteView";
import { TopBarMenu } from "./components/TopBarMenu";
import { InboxNotes, GroupedNotes, BinNotes } from "./components/Notes";
import { Login, Logout } from "./components/Login";
import { Settings } from "./components/Settings";
import { TriageDrawer } from "./components/TriageDrawer";

export const App = ({ state }: { state: State }) => {
    return (
        <AppStateProvider state={state}>
            <AppUI />
        </AppStateProvider>
    );
};

const AppUI = () => {
    const state = getAppState();

    function handleRoute(
        e: RouterOnChangeArgs<Record<string, string | undefined> | null>
    ): void {
        AppStateChange.routeChanged(e.url);

        if (e.url !== "/login") {
            // all other pages require the user to be logged in
            if (state.user.value.username === "") {
                console.log(
                    "redirecting to /login because user is not logged in"
                );

                // NOTE: this is a hack to work-around a bug in preact-router
                // in which a call to route during the initial render is ignored
                // see https://github.com/preactjs/preact-router/issues/417
                // once that issue is fixed the setTimeout can be replaced
                // with a normal function call to 'route'
                setTimeout(() => route("/login", true), 0);
                // route("/login", true);
            }
        }
    }

    return (
        <div id="memo-app">
            <TopBarMenu />
            <div id="app-content">
                <TriageDrawer />
                <Router onChange={handleRoute}>
                    <InboxNotes path="/" />
                    <GroupedNotes path="/category/:categoryId" />
                    <BinNotes path="/bin" />
                    <NoteView path="/notes/:id" />
                    <Login path="/login" />
                    <Logout path="/logout" />
                    <Settings path="/settings" />
                </Router>
            </div>
        </div>
    );
};
