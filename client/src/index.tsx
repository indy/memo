import { render } from "preact";

import { ColourScheme } from "./enums";

import type { Category, UiConfig, UserWithUiConfig } from "./types";

import "./index.css";
import Net from "./Net";
import { App } from "./App";
import { AppStateChange, initialState } from "./AppState";
// import {
//     declareCssVariables,
//     augmentSettingsWithCssModifierParameters,
// } from "./ColourCreator";

import { getCssString, basicUiConfig } from "./Utils";

document.addEventListener("DOMContentLoaded", async function () {

    let state = initialState;

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
