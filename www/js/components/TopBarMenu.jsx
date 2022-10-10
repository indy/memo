import { h, Fragment, Link } from '../../lib/preact/mod.js';

import { useStateValue } from './StateProvider.jsx';

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

    return <div id='top-bar-menu' class="hr">
               <Link href={ loggedLink() } id="login-menuitem" class="pigment-inherit">{ loggedStatus() }</Link>
               <Link class='top-bar-menuitem pigment-notes {notesExtraClass}' href={'/'}>Notes</Link>
               <Link class='top-bar-menuitem pigment-triaged {triagedExtraClass}' href={'/triaged'}>Triaged</Link>
               <Link class='top-bar-menuitem pigment-bin {binExtraClass}' href={'/bin'}>Bin</Link>
           </div>
}

export { TopBarMenu }
