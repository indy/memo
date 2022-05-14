import { initialState, reducer } from '/js/AppState.js';
import { html, Router, Route, Link, route } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { WasmInterfaceProvider }        from '/js/WasmInterfaceProvider.js';
import { augmentSettingsWithCssModifierParameters } from '/js/ColourCreator.js';
import { useStateValue, StateProvider } from '/js/StateProvider.js';

import { Bin, BinnedNote } from '/js/components/Bin.js';
import { Login, Logout } from '/js/components/Login.js';
import { Note, Notes } from '/js/components/Notes.js';
import { Settings } from '/js/components/Settings.js';
import { TopBarMenu } from '/js/components/TopBarMenu.js';
import { TriagedNote, TriagedNotes } from '/js/components/TriagedNotes.js';


export async function buildInitialState() {
    let state = initialState;

    state.settings = augmentSettingsWithCssModifierParameters(state.settings);

    try {
        // logged in
        let user = await Net.get("/api/users");

        if (user) {
            // update initial state with user
            //

            let categories = await Net.get("/api/categories");
            let notes = await Net.get(`/api/notes`);
            let triaged = await Net.get(`/api/triaged`);
            let bin = await Net.get(`/api/bin`);

            state = reducer(state, {
                type: 'user-login',
                user,
                categories,
                notes,
                triaged,
                bin
            });

            console.log('user is logged in');

            return state;
        } else {
            console.log('no user is logged in');
            return state;
        }
    } catch(err) {
        console.log('no user is logged in');
        return state;
    }
}

export function App(state, wasmInterface) {
    return html`
    <${WasmInterfaceProvider} wasmInterface=${wasmInterface}>
      <${StateProvider} initialState=${state} reducer=${reducer}>
        <${AppUI}/>
      </${StateProvider}>
    </${WasmInterfaceProvider}>
  `;
}

function AppUI(props) {
    const [state, dispatch] = useStateValue();

    function handleRoute(e) {
        dispatch({
            type: 'route-changed',
            url: e.url
        });
        if (e.url !== '/login') {
            // all other pages require the user to be logged in
            if (!state.user) {
                console.log("redirecting to /login because user is not logged in");
                route('/login', true);
            }
        }
    }

    return html`
    <div id='memo-app'>
      <${TopBarMenu}/>
      <div id="app-content">
        <${Router} onChange=${ handleRoute }>
          <${Notes} path="/"/>
          <${Note} path="/notes/:id"/>
          <${TriagedNotes} path="/triaged"/>
          <${TriagedNote} path="/triaged/:id"/>
          <${Bin} path="/bin"/>
          <${BinnedNote} path="/bin/:id"/>
          <${Login} path="/login"/>
          <${Logout} path="/logout"/>
          <${Settings} path="/settings"/>
        </${Router}>
      </div>
    </div>`;
}
