import { ColourScheme } from "./enums";
import type { State, ColourTriple, ColourQuad, ColourSeeds } from "./types";

type ColourDefinitions = {
    [index: string]: string | ColourTriple | ColourQuad | undefined;
};

/*

  using the browser's native oklch colour specifier.

  l: lightness: a percentage between 0..100
  c: chroma: a value between 0..100 (that's normalised to 0..0.4)
  h: hue angle in degrees

 */

function generateColoursFromSeeds(state: State, seeds: ColourSeeds) {
    const colourDefinitions: ColourDefinitions = generateColourDefs(seeds);

    let root = document.body;

    Object.keys(colourDefinitions).forEach((key) => {
        let cssName = cssFromUnderscore(key);
        let value = colourDefinitions[key];

        if (Array.isArray(value)) {
            if (value.length === 3) {
                let [l, c, h] = value as ColourTriple;
                root.style.setProperty(cssName, `oklch(${l}% ${(0.4/100)*c} ${h}deg)`);

            } else if (value.length === 4) {
                let [l, c, h, alpha] = value as ColourQuad;
                root.style.setProperty(
                    cssName,
                    `oklch(${l}% ${(0.4/100)*c} ${h}deg / ${alpha})`,
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

function declareSeeds(colourScheme: ColourScheme): ColourSeeds {
    let s: ColourSeeds;

    if (colourScheme === ColourScheme.Light) {
        s = {
            chroma: 10,
            hue: 67,

            bgL: 99.0,
            bgLDelta: -3,

            fgH: 67,
            fgC: 0,
            fgL: 5.0,
            fgLDelta: 10.0,

            clockHDelta: 30,

            clockFgC: 40,
            clockFgL: 40,

            clockBgC: 30,
            clockBgL: 93,

            clockHiC: 26,
            clockHiL: 86,
        };
    } else {
        s = {
            chroma: 20.0,
            hue: 230.0,

            bgL: 1,
            bgLDelta: 3,

            fgH: 16.7,
            fgC: 0,
            fgL: 90.0,
            fgLDelta: -10.0,

            clockHDelta: 30,

            clockFgC: 25,
            clockBgC: 20,
            clockHiC: 34,

            clockFgL: 70,
            clockBgL: 40,
            clockHiL: 50,
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
            seeds.clockFgL,
            seeds.clockFgC,
            hue,
        ] as ColourTriple;
        defs[`bg_clock_${index}`] = [
            seeds.clockBgL,
            seeds.clockBgC,
            hue,
        ] as ColourTriple;
        defs[`hi_clock_${index}`] = [
            seeds.clockHiL,
            seeds.clockHiC,
            hue,
        ] as ColourTriple;
    }

    // colours that can be derived from previously set
    // variables regardless of the current colour scheme
    //
    defs = {
        ...defs,

        ui_shadow: [seeds.bgL * 0.2, seeds.chroma, seeds.hue, 0.1] as ColourQuad,

        ui_shadow_2: [seeds.bgL * 0.1, seeds.chroma, seeds.hue, 0.1] as ColourQuad,

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
        seeds.bgL + seeds.bgLDelta * factor,
        seeds.chroma,
        seeds.hue,
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
        seeds.fgL + seeds.fgLDelta * factor,
        seeds.fgC,
        seeds.fgH,
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
