import { h, Fragment, FunctionalComponent } from 'preact';
import { Router, route } from 'preact-router';
import { WasmInterfaceProvider }        from './WasmInterfaceProvider';
import { AppStateChange, AppStateProvider, getAppState, initialState } from './AppState';

import { Bin, BinnedNote } from './components/Bin';
import { TopBarMenu } from './components/TopBarMenu';
import { Note, Notes } from './components/Notes';
import { Login, Logout } from './components/Login';
import { Settings } from './components/Settings';
import { TriagedNote, TriagedNotes } from './components/TriagedNotes';

import { IState } from "./types";

export const App = ({state, wasmInterface}: {state: IState, wasmInterface: any}) =>  {
    return <WasmInterfaceProvider wasmInterface={wasmInterface}>
               <AppStateProvider state={state}>
                   <AppUI/>
               </AppStateProvider>
           </WasmInterfaceProvider>;
};

const AppUI = () => {
    const state = getAppState();

    function handleRoute(e: any) {
        AppStateChange.routeChanged(e.url);

        if (e.url !== '/login') {
            // all other pages require the user to be logged in
            if (state.user.value.username === "") {
                console.log(state.user.value);
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
};
