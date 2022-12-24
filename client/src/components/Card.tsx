import { h, ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { route } from "preact-router";

import { parseNoteContent, parseCardTitle } from "../NoteUtils";

import { INote, IPigment } from "../types";

export default function Card({
    note,
    pigment,
    fullHeight,
    children,
    cardClass,
    editing,
    onFinishedEditing,
    binned
}: {
    note: INote;
    pigment: IPigment;
    fullHeight?: boolean;
    children?: ComponentChildren;
    cardClass?: string;
    editing?: boolean;
    onFinishedEditing?: any;
    binned?: boolean;
}) {
    //    const href = note.categoryId ? `/category/${note.categoryId}/notes/${note.id}` : `/notes/${note.id}`;
    const href = `/notes/${note.id}`;

    interface LocalState {
        userContent: string;
        userTitle: string;
    }

    let ls: LocalState = {
        userContent: note.content,
        userTitle: note.title,
    };

    const [localState, setLocalState] = useState(ls);

    function onCardClicked(e: MouseEvent) {
        if (e.target && e.target instanceof HTMLElement) {
            if (
                !clickedOnCardUI(e.target) &&
                !clickedOnInCardHyperlink(e.target)
            ) {
                e.preventDefault();

                let selection = document.getSelection();
                if (selection) {
                    let s: string = selection.toString();
                    if (s.length === 0 && !binned) {
                        route(href);
                    }
                }
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
            userContent: shouldSetContent
                ? note.content
                : localState.userContent,
        });
    }

    function handleChangeTitle(event: any) {
        const newUserText = event.target.value;
        setLocalState({
            ...localState,
            userTitle: newUserText,
        });
    }

    function handleChangeContent(event: any) {
        if (event) {
            const newUserText = event.target.value;
            setLocalState({
                ...localState,
                userContent: newUserText,
            });
        }
    }

    function onSaveClicked(e: MouseEvent) {
        e.preventDefault();
        onFinishedEditing(localState.userTitle, localState.userContent);
    }

    let classes = cardClass ? cardClass + " " : "card ";
    classes += `card-common ${pigment.class} darken-border`;

    fullHeight = !!fullHeight;
    if (!fullHeight) {
        classes += " card-height-limited";
    }

    return (
        <div class={classes} onClick={onCardClicked}>
            <div class="card-body">
                <div
                    class="card-action"
                    style="border-bottom: 1px solid {cssColourBg1(pigment.numString)};"
                >
                    <div class="card-action-row">{children}</div>
                    <div class="card-action-row-reverse">
                        <div
                            class="card-age"
                            style="color: {cssColourFg1(pigment.numString)};"
                        >
                            {note.age}
                        </div>
                    </div>
                </div>
                {!editing && parseCardTitle(note)}
                {!editing && parseNoteContent(note)}

                {editing && (
                    <div class="edit">
                        <input
                            class="full-width"
                            type="text"
                            value={localState.userTitle}
                            onInput={handleChangeTitle}
                        />
                        <br />
                        <br />
                        <textarea
                            class="full-width"
                            type="text"
                            value={localState.userContent}
                            onInput={handleChangeContent}
                        />
                        <br />
                        <button
                            class="{pigment.classAlt} button card-action-cell"
                            onClick={onSaveClicked}
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function clickedOnCardUI(n: HTMLElement): boolean {
    if (!n) {
        return false;
    }

    // svg elements have a property called className but it isn't a string
    // fucking retarded web development.
    if (
        !(n instanceof SVGElement) &&
        n.className &&
        (n.className.includes("button") ||
            n.className.includes("triage-dropdown-item"))
    ) {
        return true;
    }

    if (n.parentNode && n.parentNode instanceof HTMLElement) {
        return clickedOnCardUI(n.parentNode);
    } else {
        return false;
    }
}

function clickedOnInCardHyperlink(n: HTMLElement) {
    return n.className.includes("in-note-link");
}
