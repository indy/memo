import { h, Fragment, Router, Route, Link, route, useContext } from '../lib/preact/mod.js';

import { initialState, reducer } from './AppState.js';
import Net from './Net.js';
import { WasmInterfaceProvider }        from './WasmInterfaceProvider.jsx';
import { augmentSettingsWithCssModifierParameters } from './ColourCreator.js';
import { useStateValue, StateProvider } from './components/StateProvider.jsx';

import { Bin, BinnedNote } from './components/Bin.jsx';
import { Login, Logout } from './components/Login.jsx';
import { Note, Notes } from './components/Notes.jsx';
import { Settings } from './components/Settings.jsx';
import { TopBarMenu } from './components/TopBarMenu.jsx';
import { TriagedNote, TriagedNotes } from './components/TriagedNotes.jsx';

export {initialState, reducer, augmentSettingsWithCssModifierParameters};

export function App(state, wasmInterface) {
    return <WasmInterfaceProvider wasmInterface={wasmInterface}>
               <StateProvider initialState={state} reducer={reducer}>
                   <AppUI/>
               </StateProvider>
           </WasmInterfaceProvider>;
}

function AppUI() {
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

    return <div id='memo-app'>
               <TopBarMenu/>
               <div id="app-content">
                   <Router onChange={ handleRoute }>
                       <Notes path="/"/>
                       <Note path="/notes/:id"/>
                       <TriagedNotes path="/triaged"/>
                       <TriagedNote path="/triaged/:id"/>
                       <Bin path="/bin"/>
                       <BinnedNote path="/bin/:id"/>
                       <Login path="/login"/>
                       <Logout path="/logout"/>
                       <Settings path="/settings"/>
                   </Router>
               </div>
           </div>
}
