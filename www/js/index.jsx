import { render } from '../lib/preact/mod.js';

import { App, initialState, reducer, augmentSettingsWithCssModifierParameters } from './App.jsx';

import Net from './Net.js';
import { buildColourConversionFn, declareCssVariables } from './ColourCreator.js';


// document.addEventListener('DOMContentLoaded', function() {
//     const state = {a: 1, b: 2, c: 3};
//     render(App(state), document.getElementById('root'));
// });



wasm_bindgen('/client_colour_bg.wasm')
    .then(wasm_colour_bg => {
        const wasmInterface = {
            RgbFromHsl: buildColourConversionFn(wasm_bindgen)
        };

        let state = initialState;
        state.settings = augmentSettingsWithCssModifierParameters(state.settings);

        Net.get("/api/users").then(async user => {
            if (user) {
                // update initial state with user
                //
                let categories = await Net.get("/api/categories");
                let notes = await Net.get(`/api/notes`);
                let triaged = await Net.get(`/api/triaged`);
                let bin = await Net.get(`/api/bin`);

                state = reducer(state, {
                    type: 'user-login',
                    user,
                    categories,
                    notes,
                    triaged,
                    bin
                });
            }
            declareCssVariables(state.settings, wasmInterface);
            render(App(state, wasmInterface), document.getElementById('root'));
        });
    })
    .catch(console.error);
