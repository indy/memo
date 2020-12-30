import { initialState, reducer } from '/js/AppState.js';
import { html, Router, Route, Link, route } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { WasmInterfaceProvider }        from '/js/WasmInterfaceProvider.js';
import { useStateValue, StateProvider } from '/js/StateProvider.js';
import { augmentSettingsWithCssModifierParameters } from '/js/ColourCreator.js';

import { TriagedNote, TriagedNotes } from '/js/components/TriagedNotes.js';
import { Bin, BinnedNote } from '/js/components/Bin.js';
import { Note, Notes } from '/js/components/Notes.js';
import { Login, Logout } from '/js/components/Login.js';
import { Settings } from '/js/components/Settings.js';

export async function buildInitialState() {
  let state = initialState;

  state.settings = augmentSettingsWithCssModifierParameters(state.settings);

  try {
    // logged in
    let user = await Net.get("/api/users");

    if (user) {
      // update initial state with user
      //
      state = reducer(state, {
        type: 'user-set',
        user
      });

      let categories = await Net.get("/api/categories");
      state = reducer(state, {
        type: 'categories-set',
        categories
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

function TopBarMenu(props) {
  const [state] = useStateValue();

  function loggedStatus() {
    let status = '';

    let user = state.user;
    if (user) {
      status += user.username;
      if (user.admin) {
        status += ` (${user.admin.db_name})`;
      }
    } else {
      status = 'Login';
    }

    return status;
  }

  function loggedLink() {
    return state.user ? "/settings" : "/login";
  }

  let notesExtraClass='';
  let triagedExtraClass='';
  let binExtraClass='';

  if (state.activeTopBarMenuItem === 'notes') {
    notesExtraClass = 'top-bar-menuitem-active';
  } else if (state.activeTopBarMenuItem === 'triaged') {
    triagedExtraClass = 'top-bar-menuitem-active';
  } else if (state.activeTopBarMenuItem === 'bin') {
    binExtraClass = 'top-bar-menuitem-active';
  }

  return html`
    <div id='top-bar-menu' class="hr">
      <${Link} href=${ loggedLink() } id="login-menuitem" class="pigment-inherit">${ loggedStatus() }</${Link}>
      <${Link} class='top-bar-menuitem pigment-notes ${notesExtraClass}' href=${'/'}>Notes</${Link}>
      <${Link} class='top-bar-menuitem pigment-triaged ${triagedExtraClass}' href=${'/triaged'}>Triaged</${Link}>
      <${Link} class='top-bar-menuitem pigment-bin ${binExtraClass}' href=${'/bin'}>Bin</${Link}>
    </div>
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
