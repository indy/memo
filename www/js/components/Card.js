import { html, route, useState } from '/lib/preact/mod.js';
import { parseNoteContent, parseCardTitle } from '/js/NoteUtils.js';
import { cssColourBg, cssColourBg1, cssColourFg1 } from '/js/AppUtils.js';

export default function Card({ note, pigment, resource, fullHeight, children, cardClass, editing, onFinishedEditing }) {
  const href = `/${resource}/${note.id}`;
  const [localState, setLocalState] = useState({
    userContent: undefined,
    userTitle: undefined
  });

  function onCardClicked(e) {
    if (!clickedOnCardUI(e.target) && !clickedOnInCardHyperlink(e.target)) {
      e.preventDefault();

      let selection = document.getSelection();
      selection += ""; // coerce into a string
      if (selection.length === 0 && resource !== 'bin') {
        route(href);
      }
    }
  }

  let shouldSetContent = false;
  let shouldSetTitle = false;

  if (note.content && localState.userContent === undefined) {
    shouldSetContent = true;
  }
  if (note.title && localState.userTitle === undefined) {
    shouldSetTitle = true;
  }

  if (shouldSetContent || shouldSetTitle) {
    setLocalState({
      ...localState,
      userTitle: shouldSetTitle ? note.title : localState.userTitle,
      userContent: shouldSetContent ? note.content : localState.userContent
    });
  }

  function handleChangeTitle(event) {
    const newUserText = event.target.value;
    setLocalState({
      ...localState,
      userTitle: newUserText
    })
  };

  function handleChangeContent(event) {
    const newUserText = event.target.value;
    setLocalState({
      ...localState,
      userContent: newUserText
    })
  };

  function onSaveClicked(e) {
    e.preventDefault();
    onFinishedEditing(localState.userTitle, localState.userContent);
  }

  let classes = cardClass ? cardClass + ' ' : 'card ';
  classes += `card-common ${pigment.class} darken-border`;

  fullHeight = !!fullHeight;
  if (!fullHeight) {
    classes += ' card-height-limited';
  }

    return html`<div class=${classes} onClick=${ onCardClicked }>
                <div class="card-body">
                  <div class="card-action" style="border-bottom: 1px solid ${cssColourBg1(pigment.numString)};">
                    <div class="card-action-row">
                      ${ children }
                    </div>
                    <div class="card-action-row-reverse">
                      <div class="card-age" style="color: ${cssColourFg1(pigment.numString)};">
                        ${ note.age }
                      </div>
                    </div>
                  </div>
                  ${ !editing && parseCardTitle(note)}
                  ${ !editing && parseNoteContent(note) }

                  ${ editing && html`
                    <div class="edit">
                      <input class="full-width" type="text" value=${localState.userTitle} onInput=${ handleChangeTitle }/>
                      <br/><br/>
                      <textarea class="full-width" type="text" value=${ localState.userContent } onInput=${ handleChangeContent }/>
                      <br/>
                      <button class="${pigment.classAlt} button card-action-cell" onClick=${ onSaveClicked }>Save</button>

                    </div>`}

                </div>
              </div>`;

}

function clickedOnCardUI(n) {
  if (!n) {
    return false;
  }

  // svg elements have a property called className but it isn't a string
  // fucking retarded web development.
  if (!(n instanceof SVGElement) &&
      n.className &&
      (n.className.includes("button") || n.className.includes("triage-dropdown-item"))) {
    return true;
  }

  return clickedOnCardUI(n.parentNode);
}

function clickedOnInCardHyperlink(n) {
  return n.className.includes("in-note-link");
}
