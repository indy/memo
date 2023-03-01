import { h, ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { route } from "preact-router";

import { notePigment } from "../Utils";

import { Note, Pigment } from "../types";

export default function Card({
    note,
    pigment,
    fullHeight,
    children,
    cardClass,
    editing,
    onFinishedEditing,
    binned,
}: {
    note: Note;
    pigment: Pigment;
    fullHeight?: boolean;
    children?: ComponentChildren;
    cardClass?: string;
    editing?: boolean;
    onFinishedEditing?: (updatedTitle: string, updatedContent: string) => void;
    binned?: boolean;
}) {
    //    const href = note.categoryId ? `/category/${note.categoryId}/notes/${note.id}` : `/notes/${note.id}`;
    const href = `/notes/${note.id}`;

    type LocalState = {
        userContent: string;
        userTitle: string;
    };

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

    function handleChangeTitle(event: Event) {
        if (event.target instanceof HTMLInputElement) {
            const newUserText = event.target.value;
            setLocalState({
                ...localState,
                userTitle: newUserText,
            });
        }
    }

    function handleChangeContent(event: Event) {
        if (event.target instanceof HTMLInputElement) {
            const newUserText = event.target.value;
            setLocalState({
                ...localState,
                userContent: newUserText,
            });
        }
    }

    function onSaveClicked(e: MouseEvent) {
        e.preventDefault();
        if (onFinishedEditing) {
            onFinishedEditing(localState.userTitle, localState.userContent);
        }
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

function parseNoteContent(note: Note) {
    return parseNoteText(note.content, "p", note.id);
}

function parseCardTitle(note: Note) {
    return parseNoteText(note.title, "h3", note.id);
}

function parseNoteText(text: string, parentTag: string, noteId: number) {
    const lines = text.split("\n");
    const elems: Array<any> = [];
    const pigment = notePigment(noteId);

    lines.forEach((line, i) => {
        splitLineByHyperlinks(line).forEach((seg) => {
            if (isHyperlinkSegment(seg)) {
                elems.push(
                    h(
                        "a",
                        {
                            href: ensureLinkable(seg),
                            class: `in-note-link ${pigment.class}`,
                        },
                        seg
                    )
                );
            } else {
                elems.push(seg);
            }
        });
        if (i < lines.length - 1) {
            elems.push(h("br", {}));
        }
    });

    return h(parentTag, {}, elems);
}

function splitLineByHyperlinks(line: string): Array<string> {
    // put space at the end of the line for the split regexp  to work with a regexp that ends a line
    let lineWithSpace = line + " ";

    let segs = lineWithSpace
        .split(/(https:\/\/.*?|http:\/\/.*?|www\..*?)(\s+)/)
        .filter((seg) => seg.length > 0);

    // remove space at end of the last seg
    segs[segs.length - 1] = segs[segs.length - 1].trim();

    return segs;
}

function isHyperlinkSegment(seg: string): boolean {
    return (
        seg.startsWith("https://") ||
        seg.startsWith("http://") ||
        seg.startsWith("www.")
    );
}

function ensureLinkable(seg: string): string {
    return seg.startsWith("www.") ? "//" + seg : seg;
}
