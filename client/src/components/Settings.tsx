import { type ComponentChildren } from "preact";
import { useState } from "preact/hooks";

import { getAppState } from "../AppState";

import { ColourScheme } from "../enums";
import type { Note, Pigment, ColourSeeds } from "../types";

import { generateColoursFromSeeds } from "../ColourCreator";

import { ButtonEdit } from "./CardButtons";
import { CardBase } from "./Card";
import { Logout } from "./Login";

import { svgMoon, svgSun } from "../svgIcons";
import { updateAndSaveUiConfig } from "../Utils";

export default function Settings({ path }: { path?: string }) {
    const appState = getAppState();

    function updateColourScalar(e: Event, id: string) {
        if (e.target instanceof HTMLInputElement) {
            let seeds: ColourSeeds = appState.colourSeeds.value;
            let val = parseInt(e.target.value, 10);

            switch(id) {
                case "hue": seeds.hue = val; break;
                case "chroma": seeds.chroma = val; break;
                case "bgL": seeds.bgL = val; break;
                case "bgLDelta": seeds.bgLDelta = val; break;
                case "fgL": seeds.fgL = val; break;
                case "fgLDelta": seeds.fgLDelta = val; break;
                case "fgC": seeds.fgC = val; break;
                case "fgH": seeds.fgH = val; break;
                case "clockHDelta": seeds.clockHDelta = val; break;
                case "clockFgL": seeds.clockFgL = val; break;
                case "clockFgC": seeds.clockFgC = val; break;
                case "clockBgL": seeds.clockBgL = val; break;
                case "clockBgC": seeds.clockBgC = val; break;
                case "clockHiL": seeds.clockHiL = val; break;
                case "clockHiC": seeds.clockHiC = val; break;
            }
            generateColoursFromSeeds(appState, appState.colourSeeds.value);
        }
    }

    return (
        <div>
            <ColourSchemeSelector />
            <Logout />
            <hr />
            <h2>Card colours</h2>
            <label for="hue">Hue:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.hue}
                id="hue"
                name="hue"
                min="0"
                max="359"
                onInput={(e) => updateColourScalar(e, "hue")}
            />

            <label for="chroma">Chroma:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.chroma}
                id="chroma"
                name="chroma"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "chroma")}
            />

            <br/>

            <label for="bgL">BgL:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.bgL}
                id="bgL"
                name="bgL"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "bgL")}
            />

            <label for="bgLDelta">BgLDelta:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.bgLDelta}
                id="bgLDelta"
                name="bgLDelta"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "bgLDelta")}
            />

            <br/>

            <label for="fgL">FgL:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.fgL}
                id="fgL"
                name="fgL"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "fgL")}
            />


            <label for="fgLDelta">FgLDelta:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.fgLDelta}
                id="fgLDelta"
                name="fgLDelta"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "fgLDelta")}
            />

            <br/>

            <label for="fgC">FgC:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.fgC}
                id="fgC"
                name="fgC"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "fgC")}
            />

            <label for="fgH">FgH:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.fgH}
                id="fgH"
                name="fgH"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "fgH")}
            />

            <br/>

            <label for="clockHDelta">ClockforDelta:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.clockHDelta}
                id="clockHDelta"
                name="clockHDelta"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "clockHDelta")}
            />

            <br/>

            <label for="clockFgL">ClockFgL:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.clockFgL}
                id="clockFgL"
                name="clockFgL"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "clockFgL")}
            />

            <label for="clockFgC">ClockFgC:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.clockFgC}
                id="clockFgC"
                name="clockFgC"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "clockFgC")}
            />

            <br/>

            <label for="clockBgL">ClockBgL:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.clockBgL}
                id="clockBgL"
                name="clockBgL"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "clockBgL")}
            />

            <label for="clockBgC">ClockBgC:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.clockBgC}
                id="clockBgC"
                name="clockBgC"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "clockBgC")}
            />

            <br/>

            <label for="clockHiL">ClockHiL:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.clockHiL}
                id="clockHiL"
                name="clockHiL"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "clockHiL")}
            />

            <label for="clockHiC">ClockHiC:</label>
            <input
                type="number"
                value={appState.colourSeeds.value.clockHiC}
                id="clockHiC"
                name="clockHiC"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "clockHiC")}
            />

            <hr />

            <div class="card-holder">
                <SampleCard pigment="12" />
                <SampleCard pigment="01" />
                <SampleCard pigment="02" />
                <SampleCard pigment="03" />
                <SampleCard pigment="04" />
                <SampleCard pigment="05" />
                <SampleCard pigment="06" />
                <SampleCard pigment="07" />
                <SampleCard pigment="08" />
                <SampleCard pigment="09" />
                <SampleCard pigment="10" />
                <SampleCard pigment="11" />
            </div>
        </div>
    );
}

function SampleCard({ pigment }: { pigment: string }) {
    const note: Note = {
        age: "test age",
        content: "test content",
        createdAt: "",
        id: 0,
        pinned: false,
        title: "test title",
    };

    const pig: Pigment = {
        num: parseInt(pigment, 10),
        numString: pigment,
        class: `pigment-clock-${pigment}`,
        classAlt: `pigment-alt-clock-${pigment}`,
        classFg: `pigment-fg-clock-${pigment}`,
    };

    const editing = false;

    function callback() {}

    return (
        <CardBase note={note} pigment={pig} editing={editing}>
            <ButtonEdit pigment={pig} editing={editing} callback={callback} />
        </CardBase>
    );
}

function ColourSchemeSelector({}) {
    const appState = getAppState();

    const [colourScheme, setColourScheme] = useState(
        appState.uiConfig.value.colourScheme,
    );

    function updateColourScheme(cs: ColourScheme) {
        setColourScheme(cs);
        const uiConfig = {
            ...appState.uiConfig.value,
            colourScheme: cs,
        };
        updateAndSaveUiConfig(uiConfig);
    }

    return (
        <Module heading="colour scheme">
            <div class="icon-horizontal-grouping">
                <ColourSchemeOption
                    desiredScheme={ColourScheme.Light}
                    colourScheme={colourScheme}
                    setColourScheme={updateColourScheme}
                >
                    {svgSun()}
                </ColourSchemeOption>
                <ColourSchemeOption
                    desiredScheme={ColourScheme.Dark}
                    colourScheme={colourScheme}
                    setColourScheme={updateColourScheme}
                >
                    {svgMoon()}
                </ColourSchemeOption>
            </div>
        </Module>
    );
}

type ColourSchemeOptionProps = {
    desiredScheme: ColourScheme;
    colourScheme: ColourScheme;
    setColourScheme: (cs: ColourScheme) => void;
    children: ComponentChildren;
};

function ColourSchemeOption({
    desiredScheme,
    colourScheme,
    setColourScheme,
    children,
}: ColourSchemeOptionProps) {
    function clickHandler() {
        if (colourScheme !== desiredScheme) {
            setColourScheme(desiredScheme);
        }
    }

    let cl = "icon-button ";
    cl += colourScheme === desiredScheme ? "icon-selected" : "icon-unselected";

    return (
        <div class={cl} onClick={clickHandler}>
            {children}
        </div>
    );
}

type Props = {
    heading: string;
    buttons?: ComponentChildren;
    children: ComponentChildren;
};

function Module({ heading, children, buttons }: Props) {
    return (
        <article class="module">
            <div>
                <div>
                    <span class="module-top-part">
                        <span class="display-flex-justify-right">
                            {buttons}
                        </span>
                        <h1 class="ui">{heading}</h1>
                    </span>
                    {children}
                </div>
            </div>
        </article>
    );
}

/*

            <h2>Card colours</h2>
            <label for="hue-offset">Hue Offset:</label>
            <input
                type="number"
                value={settings.hueOffset}
                id="hue-offset"
                name="hue-offset"
                min="0"
                max="359"
                onInput={(e) => updateColourScalar(e, "hueOffset")}
            />
            <label for="hue-delta">Hue Delta:</label>
            <input
                type="number"
                value={settings.hueDelta}
                id="hue-delta"
                name="hue-delta"
                min="0"
                max="30"
                onInput={(e) => updateColourScalar(e, "hueDelta")}
            />
            <br />
            <label for="saturation">Saturation:</label>
            <input
                type="number"
                value={settings.saturation}
                id="saturation"
                name="saturation"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "saturation")}
            />
            <br />
            <label for="lightness-fg">LightnessFg:</label>
            <input
                type="number"
                value={settings.lightnessFg}
                id="lightness-fg"
                name="lightness-fg"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "lightnessFg")}
            />

            <label for="lightness-bg">LightnessBg:</label>
            <input
                type="number"
                value={settings.lightnessBg}
                id="lightness-bg"
                name="lightness-bg"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "lightnessBg")}
            />
            <br />
            <label for="lightness-hi">LightnessHi:</label>
            <input
                type="number"
                value={settings.lightnessHi}
                id="lightness-hi"
                name="lightness-hi"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "lightnessHi")}
            />
            <label for="lightness-hi2">LightnessHi2:</label>
            <input
                type="number"
                value={settings.lightnessHi2}
                id="lightness-hi2"
                name="lightness-hi2"
                min="0"
                max="100"
                onInput={(e) => updateColourScalar(e, "lightnessHi2")}
            />


 */
