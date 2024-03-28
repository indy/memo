import { render } from "preact";

import { ColourScheme } from "./enums";

import type { Category, UiConfig, UserWithUiConfig, WasmInterface } from "./types";

import "./index.css";
import Net from "./Net";
import { App } from "./App";
import { AppStateChange, initialState } from "./AppState";
// import {
//     declareCssVariables,
//     augmentSettingsWithCssModifierParameters,
// } from "./ColourCreator";

import { getCssString, basicUiConfig } from "./Utils";

/*
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

        Net.get<UserWithUiConfig>("/api/users").then(async (user) => {
            if (user) {
                // update initial state with user
                //
                let categories = await Net.get<Array<Category>>(
                    "/api/categories"
                );

                AppStateChange.userLogin(user, categories);
            }
            declareCssVariables(state.settings.value, wasmInterface);
            let root = document.getElementById("root");
            if (root) {
                render(<App state={state} />, root);
            }
        });
    })
    .catch(console.error);
*/

document.addEventListener("DOMContentLoaded", async function () {
    // note: wasm_bindgen is loaded from a civil_wasm.js script tag in index.html

    // initialise the wasm_bindgen
    //
    await wasm_bindgen();

    // grab the exports
    //
    const {
        rgb_from_hsluv,
    } = wasm_bindgen;


    const wasmInterface: WasmInterface = {
        rgbFromHsl: rgb_from_hsluv,
    };

    let state = initialState;

    state.wasmInterface = wasmInterface;

    let root = document.getElementById("root");
    if (root) {
        // assigning root to rootElement just to please the tsc compiler, it will
        // now know that rootElement cannot be null
        //
        const rootElement = root;

        const user = await Net.get<UserWithUiConfig>("/api/users");
        if (user) {

            // update initial state with user
            //
            let categories = await Net.get<Array<Category>>(
                "/api/categories"
            );

            AppStateChange.userLogin(user, categories);

            // declareCssVariables(state.settings.value, wasmInterface);
            render(<App state={state} />, rootElement);

        } else {
            // use system default theme from css variable "--mode"
            //
            let mode = getCssString("--mode");

            let uiConfig: UiConfig = basicUiConfig();
            uiConfig.colourScheme = colourSchemeFromString(mode);

            AppStateChange.setUiConfig(uiConfig);

            render(<App state={state} />, rootElement);
        }
    }
});

function colourSchemeFromString(theme: string): ColourScheme {
    return theme === "light" ? ColourScheme.Light : ColourScheme.Dark;
}
/*
function setupUiConfig(uiConfigJson: string) {
    // start with valid default values for the config
    let uiConfig: UiConfig = basicUiConfig();

    // customise defaults with values from the server
    // the server may not have all the values that are defined by UiConfig
    //
    let untypedConfig: any = JSON.parse(uiConfigJson);
    let configFromServer: UiConfig = JSON.parse(uiConfigJson);
    Object.keys(untypedConfig).forEach((key) => {
        if (key === "colourScheme") {
            uiConfig.colourScheme = configFromServer.colourScheme;
        }
        if (key === "decksPerPage") {
            uiConfig.decksPerPage = configFromServer.decksPerPage;
        }
    });
    AppStateChange.setUiConfig({ uiConfig });
}
*/
