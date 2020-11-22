import { initialState, reducer } from '/js/AppState.js';
import { html, Router, Route, Link, route } from '/lib/preact/mod.js';

import Net from '/js/Net.js';
import { useStateValue, StateProvider } from '/js/StateProvider.js';

import { ArchivedNote, ArchivedNotes } from '/js/components/ArchivedNotes.js';
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
        type: 'setUser',
        user
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

  return html`
    <div id='top-bar-menu'>
      <${Link} class='top-bar-menuitem pigment-notes' href=${'/'}>Notes</${Link}>
      <${Link} class='top-bar-menuitem pigment-archived-notes' href=${'/archived-notes'}>Archive</${Link}>
      <${Link} href=${ loggedLink() } id="login-menuitem" class="pigment-inherit">${ loggedStatus() }</${Link}>
    </div>
`;
}

function AppUI(props) {
  const [state, dispatch] = useStateValue();

  async function loginHandler(user) {
    console.log(user);

    dispatch({
      type: 'setUser',
      user
    });

    route('/', true);

  }

  function logoutHandler() {
    dispatch({
      type: 'setUser',
      user: undefined
    });
    route('/login', true);
  }

  function handleRoute(e) {
    if (e.url !== '/login') {
      // all other pages require the user to be logged in
      if (!state.user) {
        route('/login', true);
      }
    }
  }

  return html`
    <div id='memo-app'>
      <${TopBarMenu}/>
      <${Router} onChange=${ handleRoute }>
        <${Login} path="/login" loginCallback=${ loginHandler }/>
        <${Logout} path="/logout" logoutCallback=${ logoutHandler }/>
        <${Notes} path="/"/>
        <${Note} path="/notes/:id"/>
        <${ArchivedNotes} path="/archived-notes"/>
        <${ArchivedNote} path="/archived-notes/:id"/>
      </${Router}>
    </div>`;
}
