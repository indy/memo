import { initialState, reducer } from '/js/AppState.js';
import { html, Router, Route, Link, route } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { useStateValue, StateProvider } from '/js/StateProvider.js';

import { TriagedNote, TriagedNotes } from '/js/components/TriagedNotes.js';
import { Bin, BinnedNote } from '/js/components/Bin.js';
import { Note, Notes } from '/js/components/Notes.js';
import { Login, Logout } from '/js/components/Login.js';

export async function buildInitialState() {
  try {
    // logged in
    let user = await Net.get("/api/users");

    if (user) {
      // update initial state with user
      //
      let state = reducer(initialState, {
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
      return initialState;
    }
  } catch(err) {
    console.log('no user is logged in');
    return initialState;
  }
}

export function App(state) {
  return html`
    <${StateProvider} initialState=${state} reducer=${reducer}>
        <${AppUI}/>
    </${StateProvider}>
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
    return state.user ? "/logout" : "/login";
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
      <${Router} onChange=${ handleRoute }>
        <${Notes} path="/"/>
        <${Note} path="/notes/:id"/>
        <${TriagedNotes} path="/triaged"/>
        <${TriagedNote} path="/triaged/:id"/>
        <${Bin} path="/bin"/>
        <${BinnedNote} path="/bin/:id"/>
        <${Login} path="/login"/>
        <${Logout} path="/logout"/>
      </${Router}>
    </div>`;
}
