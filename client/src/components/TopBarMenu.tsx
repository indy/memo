import { h } from 'preact';
import { Link } from 'preact-router';
import { getAppState } from '../AppState';

function TopBarMenu() {
    const appState = getAppState();

    function loggedStatus() {
        let status = '';

        let user = appState.user.value;
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
        return appState.user.value.username !== "" ? "/settings" : "/login";
    }

    let notesExtraClass: string='';
    let triagedExtraClass: string='';
    let binExtraClass: string='';

    if (appState.activeTopBarMenuItem.value === 'notes') {
        notesExtraClass = 'top-bar-menuitem-active';
    } else if (appState.activeTopBarMenuItem.value === 'triaged') {
        triagedExtraClass = 'top-bar-menuitem-active';
    } else if (appState.activeTopBarMenuItem.value === 'bin') {
        binExtraClass = 'top-bar-menuitem-active';
    }

    let s1: string = `top-bar-menuitem pigment-notes ${notesExtraClass}`;
    let s2: string = `top-bar-menuitem pigment-triaged ${triagedExtraClass}`;
    let s3: string = `top-bar-menuitem pigment-bin ${binExtraClass}`;

    return <div id='top-bar-menu' class="hr">
               <Link href={ loggedLink() } id="login-menuitem" class="pigment-inherit">{ loggedStatus() }</Link>
               <Link class={s1} href={'/'}>Notes</Link>
               <Link class={s2} href={'/triaged'}>Triaged</Link>
               <Link class={s3} href={'/bin'}>Bin</Link>
           </div>
}

export { TopBarMenu }
