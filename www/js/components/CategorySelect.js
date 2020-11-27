import { html, Link, useState, useEffect } from '/lib/preact/mod.js';

export default function CategorySelect({ category, setCategory, available, addNewCategoryFn }) {
  let [text, setText] = useState(category ? category.title : '');

  function onInput(e) {
    setText(e.target.value);

    const found = available.find(a => a.title === e.target.value);
    if (found) {
      setCategory(found);
    }
  }

  function onFocus(e) {
    setText("");
  }

  function onKeyDown(e) {
    if (e.keyCode === 13) {      // Enter
      const found = available.find(a => a === text);
      if (!found) {
        // user has typed in a new category that needs to be created
        addNewCategoryFn(text);
      } else {
        setCategory(found);
      }
    }
  }

  const categories = available.map(c => html`<option value=${ c.title }/>`);

  return html`<div class='civsel-main-box'>
                <label>Triage Category:
                  <input list="categories"
                         name="triage-category"
                         value=${ text }
                         onInput=${ onInput }
                         onFocus=${ onFocus }
                         onKeyDown=${ onKeyDown }/>
                </label>
                <datalist id="categories">${categories}</datalist>
              </div>`;
}
