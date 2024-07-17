import { ColourScheme } from "./enums";
import type { State, ColourTriple, ColourQuad, ColourSeeds } from "./types";

type ColourDefinitions = {
    [index: string]: string | ColourTriple | ColourQuad | undefined;
};

function generateColoursFromSeeds(state: State, seeds: ColourSeeds) {
    if (state.wasmInterface) {
        const colourDefinitions: ColourDefinitions = generateColourDefs(seeds);
        const rgbFromHsl = state.wasmInterface.rgbFromHsl;

        function clamp(value: number, min: number, max: number) {
            return value < min ? min : value > max ? max : value;
        }

        function clampedRgbFromHsl(
            h: number,
            s: number,
            l: number,
        ): [number, number, number] {
            const transportRGB = rgbFromHsl(h, s, l);

            let r = Math.floor(clamp(transportRGB.c0, 0, 1) * 255);
            let g = Math.floor(clamp(transportRGB.c1, 0, 1) * 255);
            let b = Math.floor(clamp(transportRGB.c2, 0, 1) * 255);

            return [r, g, b];
        }

        let root = document.body;

        Object.keys(colourDefinitions).forEach((key) => {
            let cssName = cssFromUnderscore(key);
            let value = colourDefinitions[key];

            if (Array.isArray(value)) {
                if (value.length === 3) {
                    let [h, s, l] = value as ColourTriple;

                    let [r, g, b] = clampedRgbFromHsl(h, s, l);
                    root.style.setProperty(cssName, `rgb(${r}, ${g}, ${b})`);
                } else if (value.length === 4) {
                    let [h, s, l, alpha] = value as ColourQuad;

                    let [r, g, b] = clampedRgbFromHsl(h, s, l);
                    root.style.setProperty(
                        cssName,
                        `rgba(${r}, ${g}, ${b}, ${alpha})`,
                    );
                } else {
                    console.error(
                        `${cssName}: unknown array size expected 3 or 4`,
                    );
                }
            } else {
                let name = value;
                if (name) {
                    let source = getComputedStyle(root).getPropertyValue(name);
                    root.style.setProperty(cssName, source);
                }
            }
        });
    }
}

function declareSeeds(colourScheme: ColourScheme): ColourSeeds {
    let s: ColourSeeds;

    if (colourScheme === ColourScheme.Light) {
        s = {
            hue: 67,
            sat: 20,

            bgL: 99.0,
            bgLDelta: -3,

            fgH: 67,
            fgS: 0,
            fgL: 5.0,
            fgLDelta: 10.0,

            clockHDelta: 30,

            clockFgS: 40,
            clockFgL: 40,

            clockBgS: 77,
            clockBgL: 93,

            clockHiS: 57,
            clockHiL: 86,
        };
    } else {
        s = {
            hue: 230.0,
            sat: 20.0,

            bgL: 1,
            bgLDelta: 3,

            fgH: 16.7,
            fgS: 0,
            fgL: 90.0,
            fgLDelta: -10.0,

            clockHDelta: 30,

            clockFgS: 50,
            clockFgL: 70,

            clockBgS: 60,
            clockBgL: 30,

            clockHiS: 80,
            clockHiL: 40,
        };
    }
    return s;
}

function generateColourDefs(seeds: ColourSeeds): ColourDefinitions {
    let defs: ColourDefinitions = {};

    for (let i = 0; i < 12; i++) {
        let hue = seeds.hue + i * seeds.clockHDelta;
        let index = indexAsString(i);

        defs[`fg_clock_${index}`] = [
            hue,
            seeds.clockFgS,
            seeds.clockFgL,
        ] as ColourTriple;
        defs[`bg_clock_${index}`] = [
            hue,
            seeds.clockBgS,
            seeds.clockBgL,
        ] as ColourTriple;
        defs[`hi_clock_${index}`] = [
            hue,
            seeds.clockHiS,
            seeds.clockHiL,
        ] as ColourTriple;
    }

    // colours that can be derived from previously set
    // variables regardless of the current colour scheme
    //
    defs = {
        ...defs,

        ui_shadow: [seeds.hue, seeds.sat, seeds.bgL * 0.2, 0.1] as ColourQuad,

        ui_shadow_2: [seeds.hue, seeds.sat, seeds.bgL * 0.1, 0.1] as ColourQuad,

        bg_inbox: "--bg-clock-06",
        bg_group: "--bg-clock-12",
        bg_bin: "--bg-clock-02",

        fg_inbox: "--fg-clock-06",
        fg_group: "--fg-clock-12",
        fg_bin: "--fg-clock-02",

        hi_inbox: "--hi-clock-06",
        hi_group: "--hi-clock-12",
        hi_bin: "--hi-clock-02",
    };

    defs = bgCol(defs, seeds, 1, "bg");
    defs = bgCol(defs, seeds, 0, "bg_lighter_1");
    defs = bgCol(defs, seeds, 2, "bg_darker_2");
    defs = bgCol(defs, seeds, 3, "bg_darker_3");
    defs = bgCol(defs, seeds, 4, "bg_darker_4");
    defs = bgCol(defs, seeds, 6, "bg_darker_6");

    defs = fgCol(defs, seeds, 0, "fg");
    defs = fgCol(defs, seeds, 1, "fg_lighter_1");
    defs = fgCol(defs, seeds, 2, "fg_lighter_2");
    defs = fgCol(defs, seeds, 5, "fg_lighter_5");
    defs = fgCol(defs, seeds, 7, "fg_lighter_7");

    defs = bgCol(defs, seeds, 4, "pinned_border_colour");
    defs = bgCol(defs, seeds, 4, "pinned_background_colour");
    defs = bgCol(defs, seeds, 3, "textarea_bg");
    defs = fgCol(defs, seeds, 3, "textarea_fg");

    return defs;
}

function bgCol(
    defs: ColourDefinitions,
    seeds: ColourSeeds,
    factor: number,
    name: string,
): ColourDefinitions {
    defs[name] = [
        seeds.hue,
        seeds.sat,
        seeds.bgL + seeds.bgLDelta * factor,
    ] as ColourTriple;

    return defs;
}

function fgCol(
    defs: ColourDefinitions,
    seeds: ColourSeeds,
    factor: number,
    name: string,
): ColourDefinitions {
    defs[name] = [
        seeds.fgH,
        seeds.fgS,
        seeds.fgL + seeds.fgLDelta * factor,
    ] as ColourTriple;

    return defs;
}

function indexAsString(i: number) {
    if (i === 0) {
        return "12";
    } else if (i < 10) {
        return `0${i}`;
    } else {
        return `${i}`;
    }
}

function cssFromUnderscore(name: string) {
    let cssName = "--" + name.replaceAll("_", "-");
    return cssName;
}

export { generateColoursFromSeeds, declareSeeds };
