import { render } from '/lib/preact/mod.js';
import Net from '/js/Net.js';
import { App, buildInitialState } from '/js/App.js';

import { buildColourConversionFn, declareCssVariables } from '/js/ColourCreator.js';

// document.addEventListener('DOMContentLoaded', async function() {
//   const state = await buildInitialState();
//   render(App(state), document.getElementById('root'));
// });

wasm_bindgen('/client_colour_bg.wasm')
  .then(async wasm_colour_bg => {

    const wasmInterface = {
      RgbFromHsl: buildColourConversionFn(wasm_bindgen)
    };

    const state = await buildInitialState();

    declareCssVariables(state.settings, wasmInterface);

    render(App(state, wasmInterface), document.getElementById('root'));
  })
  .catch(console.error);
