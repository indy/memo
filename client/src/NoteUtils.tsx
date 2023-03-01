import { h } from "preact";
import Net from "./Net";

import { State, Note, Pigment } from "./types";
import { AppStateChange } from "./AppState";

export function finishedEditingCallback(
    note: Note,
    setEditing: (b: boolean) => void
) {
    return function (updatedTitle: string, updatedContent: string) {
        let data = {
            ...note,
            content: updatedContent,
            title: updatedTitle,
        };
        Net.put<Note, Note>(`/api/notes/${note.id}`, data).then((newNote) => {
            AppStateChange.noteContentUpdated(newNote);
            setEditing(false);
        });
    };
}

export function getNoteById(state: State, id: number): Note | undefined {
    function search(ns: Array<Note>): Note | undefined {
        return ns.find((n: Note) => n.id === id);
    }

    let res: Note | undefined = search(state.listing.value.notes);
    if (res) {
        return res;
    }

    res = search(state.listing.value.bin);
    if (res) {
        return res;
    }

    for (const key in state.categories.value) {
        let cat = state.categories.value[key];

        let l: Array<Note> | undefined = state.listing.value.category[cat.id];
        if (l != undefined) {
            res = search(l);
            if (res) {
                return res;
            }
        }
    }
    return undefined;
}

export function partitionPinnedNotes(list?: Array<Note>): Array<Array<Note>> {
    let pinned: Array<Note> = [];
    let unpinned: Array<Note> = [];

    if (!list) {
        return [[], []];
    }

    list.forEach((n) => {
        if (n.pinned) {
            pinned.push(n);
        } else {
            unpinned.push(n);
        }
    });

    pinned.sort((a, b) => b.id - a.id);
    unpinned.sort((a, b) => b.id - a.id);

    return [pinned, unpinned];
}

export function notePigment(noteId: number): Pigment {
    const pigmentNum = (noteId % 12) + 1;
    const pigmentNumString =
        pigmentNum < 10 ? `0${pigmentNum}` : `${pigmentNum}`;
    const pigmentClass = `pigment-clock-${pigmentNumString}`;
    const pigmentClassAlt = `${pigmentClass}-alt`;

    return {
        num: pigmentNum,
        numString: pigmentNumString,
        class: pigmentClass,
        classAlt: pigmentClassAlt,
    };
}

// simple parsing for urls and newlines only. A stupid regexp approach will do here,
// but write an actual lexer+parser+compiler if other markup is required
//
export function parseNoteContent(note: Note) {
    return parseNoteText(note.content, "p", note.id);
}

export function parseNoteTitle(note: Note) {
    return parseNoteText(note.title, "h1", note.id);
}

export function parseCardTitle(note: Note) {
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
