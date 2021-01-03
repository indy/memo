import { html, useState } from '/lib/preact/mod.js';
import { useStateValue } from '/js/StateProvider.js';
import { declareCssVariables } from '/js/ColourCreator.js';
import { useWasmInterface } from '/js/WasmInterfaceProvider.js';

import { Logout } from '/js/components/Login.js';

function Settings() {
  const [state, dispatch] = useStateValue();

  function updateColourScalar(e, id) {
    e.preventDefault();
    dispatch({
      type: 'settings-colour-scalar',
      value: e.target.value,
      id
    });
  }

  function updateColourTriple(e, index, id) {
    e.preventDefault();
    let value = settings[id];
    value[index] = e.target.value;
    dispatch({
      type: 'settings-colour-triple',
      value,
      id
    });
  }

  const settings = state.settings;

  const wasmInterface = useWasmInterface();
  declareCssVariables(settings, wasmInterface);

  return html`
    <div>
      <${Logout} />
      <hr/>
      <h2>UI colours</h2>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.bg} id='bg'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.fg} id='fg'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.fg1} id='fg1'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.fg_inactive} id='fg_inactive'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.bg1} id='bg1'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.bg2} id='bg2'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.textarea_bg} id='textarea_bg'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.textarea_fg} id='textarea_fg'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.save_on_bg} id='save_on_bg'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.save_on_fg} id='save_on_fg'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.bg_section_controls} id='bg_section_controls'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.card_shadow} id='card_shadow'/>
      <${ColourControl} onInput=${updateColourTriple} value=${settings.divider} id='divider'/>
      <hr/>
      <h2>Card colours</h2>
      <label for="hue-offset">Hue Offset:</label>
      <input type="number"
             value=${settings.hueOffset}
             id="hue-offset"
             name="hue-offset"
             min="0"
             max="359"
             onInput=${ (e) => updateColourScalar(e, 'hueOffset') }/>
      <label for="hue-delta">Hue Delta:</label>
      <input type="number"
             value=${settings.hueDelta}
             id="hue-delta"
             name="hue-delta"
             min="0"
             max="30"
             onInput=${ (e) => updateColourScalar(e, 'hueDelta') }/>
<br/>
      <label for="saturation">Saturation:</label>
      <input type="number"
             value=${settings.saturation}
             id="saturation"
             name="saturation"
             min="0"
             max="100"
             onInput=${ (e) => updateColourScalar(e, 'saturation') }/>
<br/>
      <label for="lightness-fg">LightnessFg:</label>
      <input type="number"
             value=${settings.lightnessFg}
             id="lightness-fg"
             name="lightness-fg"
             min="0"
             max="100"
             onInput=${ (e) => updateColourScalar(e, 'lightnessFg') }/>

      <label for="lightness-bg">LightnessBg:</label>
      <input type="number"
             value=${settings.lightnessBg}
             id="lightness-bg"
             name="lightness-bg"
             min="0"
             max="100"
             onInput=${ (e) => updateColourScalar(e, 'lightnessBg') }/>
<br/>
      <label for="lightness-hi">LightnessHi:</label>
      <input type="number"
             value=${settings.lightnessHi}
             id="lightness-hi"
             name="lightness-hi"
             min="0"
             max="100"
             onInput=${ (e) => updateColourScalar(e, 'lightnessHi') }/>
      <label for="lightness-hi2">LightnessHi2:</label>
      <input type="number"
             value=${settings.lightnessHi2}
             id="lightness-hi2"
             name="lightness-hi2"
             min="0"
             max="100"
             onInput=${ (e) => updateColourScalar(e, 'lightnessHi2') }/>
      <hr/>
      <${SampleCard} pigment="12"/>
      <${SampleCard} pigment="01"/>
      <${SampleCard} pigment="02"/>
      <${SampleCard} pigment="03"/>
      <${SampleCard} pigment="04"/>
      <${SampleCard} pigment="05"/>
      <${SampleCard} pigment="06"/>
      <${SampleCard} pigment="07"/>
      <${SampleCard} pigment="08"/>
      <${SampleCard} pigment="09"/>
      <${SampleCard} pigment="10"/>
      <${SampleCard} pigment="11"/>
    </div>`;
}

function ColourControl({ onInput, value, id }) {
  const labelH = `${id} h`;
  const labelS = `${id} s`;
  const labelL = `${id} l`;

  const idH = `${id}-h`;
  const idS = `${id}-s`;
  const idL = `${id}-l`;

  return html`
<div>
  <label for=${idH}>${labelH}</label>
  <input type="number"
         value=${value[0]}
         id=${idH}
         name=${idH}
         min="0"
         max="359"
         onInput=${ (e) => onInput(e, 0, id)}/>

  <label for=${idS}>${labelS}</label>
  <input type="number"
         value=${value[1]}
         id=${idS}
         name=${idS}
         min="0"
         max="100"
         onInput=${ (e) => onInput(e, 1, id)}/>

  <label for=${idL}>${labelL}</label>
  <input type="number"
         value=${value[2]}
         id=${idL}
         name=${idL}
         min="0"
         max="100"
         onInput=${ (e) => onInput(e, 2, id)}/>
</div>`;
}

function SampleCard({ pigment }) {
  return html`<div class="card pigment-clock-${pigment} darken-border">
                <div class="card-body">
                  <div class="card-action" style="border-bottom: 1px solid var(--bg-clock-${pigment}-hi)">
                    <button class="pigment-clock-${pigment}-hi button button-height-bodge">Sample Button</button>
                  </div>
                  <h3>Sample Card</h3>
                  <p>Sample Text</p>
                </div>
              </div>`;
}

export { Settings };
