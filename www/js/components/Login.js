import { html, route, useState } from '/lib/preact/mod.js';
import { useStateValue } from '/js/StateProvider.js';

import Net from '/js/Net.js';

function Login() {
  const [appState, dispatch] = useStateValue();

  if (appState.user) {
    route('/', true);
  };

  const [state, setState] = useState({
    'login-email': '',
    'login-password': '',
    'register-username': '',
    'register-magic-word': '',
    'register-email': '',
    'register-password': '',
    'register-password2': ''
  });

  const handleChangeEvent = (event) => {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    const newState = { ...state };
    newState[name] = value;
    setState(newState);
  };

  function loginCallback(user) {
    dispatch({
      type: 'set-user',
      user
    });
    // once the state has a user, the Login page will redirect to '/'
  }

  function handleLoginSubmit(event) {
    event.preventDefault();

    Net.post('api/auth', {
      email: state['login-email'],
      password: state['login-password']
    }).then(user => {
      loginCallback(user);
    });
  };

  function okToSendRegistration() {
    return state['register-username'].length > 0 &&
      state['register-email'].length > 0 &&
      state['register-magic-word'].length > 0 &&
      state['register-password'].length > 0 &&
      state['register-password'] === state['register-password-2'];
  }

  function handleRegisterSubmit(event) {
    if (okToSendRegistration()) {
      Net.post('api/users', {
        username: state['register-username'],
        email: state['register-email'],
        password: state['register-password'],
        magic_word: state['register-magic-word']
      }).then(user => {
        loginCallback(user);
      });
    }

    event.preventDefault();
  };

  return html`
    <section>
      <h1>Login</h1>
      <form onSubmit=${ handleLoginSubmit }>
        <label for="login-email">Email:</label>
        <input id="login-email"
               type="text"
               name="login-email"
               value=${ state['login-email'] }
               onInput=${ handleChangeEvent } />
        <label for="login-password">Password:</label>
        <input id="login-password"
               type="password"
               name="login-password"
               value=${ state['login-password'] }
               onInput=${ handleChangeEvent } />
        <input type="submit" value="Login"/>
      </form>
      <h1>Register New User</h1>
      <form onSubmit=${ handleRegisterSubmit }>
        <label for="register-magic-word">Magic word that was given to you by Indy:</label>
        <input id="register-magic-word"
               type="text"
               name="register-magic-word"
               value=${ state['register-magic-word'] }
               onInput=${ handleChangeEvent } />
        <label for="register-username">Username:</label>
        <input id="register-username"
               type="text"
               name="register-username"
               value=${ state['register-username'] }
               onInput=${ handleChangeEvent } />
        <label for="register-email">Email:</label>
        <input id="register-email"
               type="text"
               name="register-email"
               value=${ state['register-email'] }
               onInput=${ handleChangeEvent } />
        <label for="register-password">Password:</label>
        <input id="register-password"
               type="password"
               name="register-password"
               value=${ state['register-password'] }
               onInput=${ handleChangeEvent } />
        <label for="register-password-2">Confirm Password:</label>
        <input id="register-password-2"
               type="password"
               name="register-password-2"
               value=${ state['register-password-2'] }
               onInput=${ handleChangeEvent } />
        <input type="submit" value="Register" disabled=${!okToSendRegistration()}/>
      </form>
    </section>`;
}

function Logout() {
  const [state, dispatch] = useStateValue();

  // actix session.purge should be fixed in master:
  // - https://github.com/actix/actix-extras/issues/87
  // - https://github.com/actix/actix-extras/pull/129/commits/fff0b682f11f62d5ebb99f048e547c7e0b3ffa93

  // https://stackoverflow.com/questions/5285940/correct-way-to-delete-cookies-server-side
  // https://stackoverflow.com/questions/10593013/delete-cookie-by-name

  function delete_cookie(name) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
  const handleLogout = (event) => {
    Net.delete('api/auth', {}).then(() => {
      //// this isn't logging out the user, refreshing the app logs the user back in

      // failed attempt at clearing cookies client side
      delete_cookie("auth");

      dispatch({
        type: 'set-user',
        user: undefined
      });
      route('/login', true);
    });
    event.preventDefault();
  };

  return html`
    <section>
      <form onSubmit=${ handleLogout }>
        <input type="submit" value="Logout"/>
      </form>
    </section>
`;
}

export { Login, Logout };
