import { render, h } from 'preact';
import "./index.css";

import { App, initialState, reducer } from './App';
import Net from './Net.js';

import { buildColourConversionFn, declareCssVariables, augmentSettingsWithCssModifierParameters } from './ColourCreator.js';

wasm_bindgen('/wasm_colour_bg.wasm')
    .then((wasm_colour_bg: any) => {
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


                console.log(user);
                console.log(state);
            }
            declareCssVariables(state.settings, wasmInterface);
            let root = document.getElementById('root');
            if (root) {
                render(<App state={state} wasmInterface={wasmInterface}/>, root);
            }
        });


    })
    .catch(console.error);
