import { render, h } from "preact";
import "./index.css";

import { App } from "./App";
import { AppStateChange, initialState } from "./AppState";
import Net from "./Net.js";

import { WasmInterface } from "./types";

import {
    buildColourConversionFn,
    declareCssVariables,
    augmentSettingsWithCssModifierParameters,
} from "./ColourCreator.js";

import { IUser, ICategory, INote } from "./types";

wasm_bindgen("/wasm_colour_bg.wasm")
    .then((wasm_colour_bg: InitOutput) => {
        const wasmInterface: WasmInterface = {
            RgbFromHsl: buildColourConversionFn(wasm_colour_bg),
        };

        let state = initialState;
        state.wasmInterface = wasmInterface;
        state.settings.value = augmentSettingsWithCssModifierParameters(
            state.settings.value
        );

        Net.get<IUser>("/api/users").then(async (user) => {
            if (user) {
                // update initial state with user
                //
                let categories = await Net.get<Array<ICategory>>(
                    "/api/categories"
                );
                let notes = await Net.get<Array<INote>>(`/api/notes`);
                let bin = await Net.get<Array<INote>>(`/api/bin`);

                AppStateChange.userLogin(user, categories, notes, bin);
            }
            declareCssVariables(state.settings.value, wasmInterface);
            let root = document.getElementById("root");
            if (root) {
                render(<App state={state} />, root);
            }
        });
    })
    .catch(console.error);
