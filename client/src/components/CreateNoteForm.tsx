import { h } from "preact";
import { useState, useEffect } from "preact/hooks";

import Net from "../Net";
import { AppStateChange } from "../AppState";

import { Note } from "../types";

interface IProtoNote {
    title: string;
    content: string;
    pinned: boolean;
    categoryId?: number;
}

const USER_TEXT = "user-text";

function CreateNoteForm({ categoryId }: { categoryId?: number }) {
    const [userText, setUserText] = useState(
        window.localStorage.getItem(USER_TEXT) || ""
    );
    const [hasFocus, setHasFocus] = useState(false);

    const typeHereMessage = "type note here...";

    useEffect(() => {
        window.localStorage.setItem(USER_TEXT, userText);
    }, [userText]);

    function handleChangeEvent(event: Event) {
        if (event.target instanceof HTMLInputElement) {
            const newUserText = event.target.value;
            setUserText(newUserText);
        }
    }

    const hasUserContent = userText.trim().length > 0;
    const usingTextArea = hasFocus || hasUserContent;

    const textareaValue = usingTextArea ? userText : typeHereMessage;

    function onMouseDown() {
        /*
          NOTE: why not use a form and have logic in a submit function?
          With the save button below the textarea then the following will occur:
          The user clicks submit, the textarea will lose focus and shrink back
          in size, this will shift the save button up, away from the pointer
          and the onMouseUp won't be sent to the save button, resulting in no
          click event

          The workaround is either to have the save button above the textarea
          and use the normal submit form logic, or, as we're doing here just
          intercept the onMouseDown event and treat that as the trigger for
          saving the note.
        */
        const protoNote = noteFromText(userText);
        if (protoNote) {
            if (categoryId) {
                protoNote.categoryId = categoryId;
            }
            Net.post<IProtoNote, Note>(`/api/notes`, protoNote).then((note) => {
                AppStateChange.listingNoteAppended(note);
            });
            setUserText("");
        }
    }

    return (
        <div class="form-holder card-holder-pinned">
            <div class="card-holder-pinned-inner">
                <textarea
                    id="content"
                    type="text"
                    name="content"
                    class="bigger-when-focused"
                    value={textareaValue}
                    onFocus={() => setHasFocus(true)}
                    onBlur={() => setHasFocus(false)}
                    onInput={handleChangeEvent}
                />
                {usingTextArea && (
                    <div class="button-container">
                        <input
                            class="create-note-button button save-button"
                            type="submit"
                            onMouseDown={onMouseDown}
                            disabled={!hasUserContent}
                            value="Save"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function noteFromText(text: string): IProtoNote | null {
    const lines = text.split("\n");

    const title = lines.shift();
    if (title) {
        const content = lines.join("\n").trim();

        if (title.length === 0 && content.length === 0) {
            return null;
        }

        let protoNote: IProtoNote = {
            title,
            content,
            pinned: false,
        };

        return protoNote;
    }

    return null;
}

export { CreateNoteForm };
