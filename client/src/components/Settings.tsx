import { h } from "preact";
import { AppStateChange, getAppState } from "../AppState";

import { Note, Pigment } from "../types";

import { declareCssVariables } from "../ColourCreator";

import { ButtonEdit } from "./CardButtons";
import { CardBase } from "./Card";
import { Logout } from "./Login";

export default function Settings({ path }: { path?: string }) {
    const appState = getAppState();

    function updateColourScalar(e: Event, id: string) {
        if (e.target instanceof HTMLInputElement) {
            e.preventDefault();
            AppStateChange.settingsColourScalar(id, e.target.value);
        }
    }

    function updateColourTriple(e: Event, index: number, id: string) {
        if (e.target instanceof HTMLInputElement) {
            e.preventDefault();
            let value = settings[id];
            if (
                value !== undefined &&
                Array.isArray(value) &&
                value.length === 3
            ) {
                value[index] = parseInt(e.target.value, 10);
                AppStateChange.settingsColourTriple(id, value);
            }
        }
    }

    const settings = appState.settings.value;

    const wasmInterface = appState.wasmInterface;
    if (wasmInterface) {
        declareCssVariables(settings, wasmInterface);
    } else {
        console.error("require a valid wasmInterface");
    }

    return (
        <div>
            <Logout />
            <hr />
            <h2>UI colours</h2>
            <ColourControl
                onInput={updateColourTriple}
                value={settings.bg}
                id="bg"
            />
            <ColourControl
                onInput={updateColourTriple}
                value={settings.bg1}
                id="bg1"
            />
            <ColourControl
                onInput={updateColourTriple}
                value={settings.bg2}
                id="bg2"
            />
            <ColourControl
                onInput={updateColourTriple}
                value={settings.fg}
                id="fg"
            />
            <ColourControl
                onInput={updateColourTriple}
                value={settings.fg1}
                id="fg1"
            />
            <ColourControl
                onInput={updateColourTriple}
                value={settings.fg_inactive}
                id="fg_inactive"
            />
            <ColourControl
                onInput={updateColourTriple}
                value={settings.textarea_bg}
                id="textarea_bg"
            />
            <ColourControl
                onInput={updateColourTriple}
                value={settings.textarea_fg}
                id="textarea_fg"
            />
            <ColourControl
                onInput={updateColourTriple}
                value={settings.save_on_bg}
                id="save_on_bg"
            />
            <ColourControl
                onInput={updateColourTriple}
                value={settings.save_on_fg}
                id="save_on_fg"
            />
            <ColourControl
                onInput={updateColourTriple}
                value={settings.divider}
                id="divider"
            />
            <hr />
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

function ColourControl({
    onInput,
    value,
    id,
}: {
    onInput: (e: Event, index: number, id: string) => void;
    value: [number, number, number] | undefined;
    id: string;
}) {
    const labelH = `${id} h`;
    const labelS = `${id} s`;
    const labelL = `${id} l`;

    const idH = `${id}-h`;
    const idS = `${id}-s`;
    const idL = `${id}-l`;

    if (value !== undefined) {
        return (
            <div>
                <label for={idH}>{labelH}</label>
                <input
                    type="number"
                    value={value[0]}
                    id={idH}
                    name={idH}
                    min="0"
                    max="359"
                    onInput={(e) => onInput(e, 0, id)}
                />

                <label for={idS}>{labelS}</label>
                <input
                    type="number"
                    value={value[1]}
                    id={idS}
                    name={idS}
                    min="0"
                    max="100"
                    onInput={(e) => onInput(e, 1, id)}
                />

                <label for={idL}>{labelL}</label>
                <input
                    type="number"
                    value={value[2]}
                    id={idL}
                    name={idL}
                    min="0"
                    max="100"
                    onInput={(e) => onInput(e, 2, id)}
                />
            </div>
        );
    } else {
        return <div></div>;
    }
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
        classAlt: `pigment-clock-${pigment}-alt`,
        classFg: `pigment-clock-${pigment}-fg`,
    };

    const editing = false;

    function callback() {}

    return (
        <CardBase note={note} pigment={pig} editing={editing}>
            <ButtonEdit pigment={pig} editing={editing} callback={callback} />
        </CardBase>
    );
}
