import { h } from "preact";
import { useState } from "preact/hooks";

import { notePigment } from "../Utils";
import Card from "./Card";
import { ButtonDelete, ButtonPinned } from "./CardButtons";

import { TriageDropDown } from "./TriageDropDown";

import { Note, Category } from "../types";

type PostitTypes = {
    note: Note;
    categories: Array<Category>;
    categoryId?: number;
};

export default function Postit({ note, categories, categoryId }: PostitTypes) {
    const [fullHeight, setFullHeight] = useState(false);
    const pigment = notePigment(note.id);

    return (
        <Card note={note} pigment={pigment} fullHeight={fullHeight}>
            <TriageDropDown
                noteId={note.id}
                categories={categories}
                pigment={pigment}
                cardFullHeightFn={setFullHeight}
                currentCategoryId={categoryId}
            />

            <ButtonPinned note={note} pigment={pigment} />
            <ButtonDelete note={note} pigment={pigment} />
        </Card>
    );
}
