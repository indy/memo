import { html, useState } from '/lib/preact/mod.js';
import { useStateValue } from '/js/StateProvider.js';
import { declareCssVariables } from '/js/ColourCreator.js';
import { useWasmInterface } from '/js/WasmInterfaceProvider.js';

import { Logout } from '/js/components/Login.js';

function Settings() {
  const [state, dispatch] = useStateValue();

  function dispatchMessage(e, type) {
    e.preventDefault();
    dispatch({
      type,
      value: e.target.value
    });
  }

  const settings = state.settings;

  const wasmInterface = useWasmInterface();
  declareCssVariables(settings, wasmInterface);

  return html`
    <div>
      <${Logout} />
      <hr/>
      <label for="hue-offset">Hue Offset:</label>
      <input type="number"
             value=${settings.hueOffset}
             id="hue-offset"
             name="hue-offset"
             min="0"
             max="359"
             onInput=${ (e) => dispatchMessage(e, 'settings-hue-offset') }/>
      <label for="hue-delta">Hue Delta:</label>
      <input type="number"
             value=${settings.hueDelta}
             id="hue-delta"
             name="hue-delta"
             min="0"
             max="30"
             onInput=${ (e) => dispatchMessage(e, 'settings-hue-delta') }/>
<br/>
      <label for="saturation">Saturation:</label>
      <input type="number"
             value=${settings.saturation}
             id="saturation"
             name="saturation"
             min="0"
             max="100"
             onInput=${ (e) => dispatchMessage(e, 'settings-saturation') }/>
<br/>
      <label for="lightness-fg">LightnessFg:</label>
      <input type="number"
             value=${settings.lightnessFg}
             id="lightness-fg"
             name="lightness-fg"
             min="0"
             max="100"
             onInput=${ (e) => dispatchMessage(e, 'settings-lightness-fg') }/>

      <label for="lightness-bg">LightnessBg:</label>
      <input type="number"
             value=${settings.lightnessBg}
             id="lightness-bg"
             name="lightness-bg"
             min="0"
             max="100"
             onInput=${ (e) => dispatchMessage(e, 'settings-lightness-bg') }/>
<br/>
      <label for="lightness-hi">LightnessHi:</label>
      <input type="number"
             value=${settings.lightnessHi}
             id="lightness-hi"
             name="lightness-hi"
             min="0"
             max="100"
             onInput=${ (e) => dispatchMessage(e, 'settings-lightness-hi') }/>
      <label for="lightness-hi2">LightnessHi2:</label>
      <input type="number"
             value=${settings.lightnessHi2}
             id="lightness-hi2"
             name="lightness-hi2"
             min="0"
             max="100"
             onInput=${ (e) => dispatchMessage(e, 'settings-lightness-hi2') }/>
      <hr/>
      <${SampleCard} pigment="pigment-clock-12"/>
      <${SampleCard} pigment="pigment-clock-01"/>
      <${SampleCard} pigment="pigment-clock-02"/>
      <${SampleCard} pigment="pigment-clock-03"/>
      <${SampleCard} pigment="pigment-clock-04"/>
      <${SampleCard} pigment="pigment-clock-05"/>
      <${SampleCard} pigment="pigment-clock-06"/>
      <${SampleCard} pigment="pigment-clock-07"/>
      <${SampleCard} pigment="pigment-clock-08"/>
      <${SampleCard} pigment="pigment-clock-09"/>
      <${SampleCard} pigment="pigment-clock-10"/>
      <${SampleCard} pigment="pigment-clock-11"/>
    </div>`;
}

function SampleCard({ pigment }) {
  return html`<div class="card ${pigment} darken-border">
                <div class="card-body">
                  <div class="card-action">
                    <button class="${pigment}-hi button button-height-bodge">Sample Button</button>
                  </div>
                  <h3>Sample Card</h3>
                  <p>Sample Text</p>
                </div>
              </div>`;
}

export { Settings };
