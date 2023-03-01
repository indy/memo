import { h } from "preact";

import { Router, route, RouterOnChangeArgs } from "preact-router";
import { AppStateChange, AppStateProvider, getAppState } from "./AppState";

import { Bin } from "./components/Bin";
import { TopBarMenu } from "./components/TopBarMenu";
import { Notes, NoteView } from "./components/Notes";
import { Login, Logout } from "./components/Login";
import { Settings } from "./components/Settings";
import { TriageDrawer } from "./components/TriageDrawer";

import { State } from "./types";

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
                    <Notes path="/" />
                    <Notes path="/category/:categoryId" />
                    <NoteView path="/notes/:id" />
                    <Bin path="/bin" />
                    <Login path="/login" />
                    <Logout path="/logout" />
                    <Settings path="/settings" />
                </Router>
            </div>
        </div>
    );
};
