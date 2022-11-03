function buildColourConversionFn(wasm_bindgen: any) {
    const { rgb_from_hsl } = wasm_bindgen;

    return (hsl: [number, number, number]) => {
        function clamp(value: number, min: number, max: number) {
            return value < min ? min : (value > max ? max : value);
        }

        function componentAsHexString(c: number) {
            let hex = c.toString(16);
            if (hex.length < 2) {
                hex = "0" + hex;
            }
            return hex;
        }

        const transportRGB = rgb_from_hsl(hsl[0], hsl[1], hsl[2]);

        let r = Math.floor(clamp(transportRGB.get_0(), 0, 1) * 255);
        let g = Math.floor(clamp(transportRGB.get_1(), 0, 1) * 255);
        let b = Math.floor(clamp(transportRGB.get_2(), 0, 1) * 255);

        transportRGB.free();

        return "#" + componentAsHexString(r) + componentAsHexString(g) + componentAsHexString(b);
    }
}

function augmentSettingsWithCssModifierParameters(settings: any) {
    let root = document.body;
    let mode = getComputedStyle(root).getPropertyValue("--mode").trim();

    let s;

    if (mode === "light") {
        s = {
            ...settings,

            bg: [46.5, 19.2, 95.7],
            bg1: [85.9, 4.5, 93.9],
            bg2: [46.2, 20.1, 92],
            fg: [53.2, 17.4, 3.4],
            fg1: [0, 0, 40.7],

            fg_inactive: [0, 0, 59.8],
            textarea_bg: [85.9, 100, 99.8],
            textarea_fg: [53.2, 17.4, 3.4],

            save_on_bg: [127, 70, 80],
            save_on_fg: [53.2, 17.4, 3.4],

            divider: [0, 0, 77.7],

            saturation: 60.2,
            lightnessBg: 90.0,
            lightnessBg1: 80.0,
            lightnessBg2: 70.0,
            lightnessFg: 30.0,
            lightnessFg1: 70.0
        }
    } else {

        let bgh = 220;
        let bgs = 60;
        let bgl = 10;


        s = {
            ...settings,

            bg: [bgh, bgs, bgl],
            bg1: [bgh, bgs, bgl + 10],
            bg2: [bgh, bgs, bgl + 17],
            fg: [bgh, 100, 70],
            fg1: [bgh, 100, 50],

            fg_inactive: [bgh, bgs + 40, 20],
            textarea_bg: [0, 0, 12],
            textarea_fg: [236, 2.7, 69],

            save_on_fg: [220, 10, 80],
            save_on_bg: [127, 90, 40],

            divider: [bgh, bgs, bgl - 13],

            saturation: 70,
            lightnessBg: 30.0,
            lightnessBg1: 25.0,
            lightnessBg2: 15.0,
            lightnessFg: 60.0,
            lightnessFg1: 15.0
        }
    }
    return s;
}

/*
  | suffix | use                        | example      |
  |--------+----------------------------+--------------|
  | fg     | normal text                | clock-05-fg  |
  | fg1    | secondary text             | clock-05-fg1 |
  | bg     | card colour                | clock-05-bg  |
  | bg1    | button background          | clock-05-bg1 |
  | bg2    | button background on hover | clock-05-bg2 |
*/

function declareCssVariables(settings: any, wasmInterface: any) {
    let root = document.body;

    function updateVariable(label: string, val: [number, number, number]) {
        let cssName = '--' + label.replaceAll('_', '-');

        root.style.setProperty(cssName, wasmInterface.RgbFromHsl(val));
    }

    function isColourTriplet(val: any): boolean {
        return Array.isArray(val) && val.length === 3;
    }

    for (const [key, val] of Object.entries(settings)) {
        if (isColourTriplet(val)) {
            let v: [number, number, number] = val;
            updateVariable(key, v);
        }
    }

    let hue, rgb, index;
    for(let i = 0; i < 12; i++) {
        hue = settings.hueOffset + ( i * settings.hueDelta);

        index = indexAsString(i);

        rgb = wasmInterface.RgbFromHsl([hue, settings.saturation, settings.lightnessFg]);

        root.style.setProperty(`--clock-${index}-fg`, rgb);

        rgb = wasmInterface.RgbFromHsl([hue, settings.saturation, settings.lightnessFg1]);
        root.style.setProperty(`--clock-${index}-fg1`, rgb);

        rgb = wasmInterface.RgbFromHsl([hue, settings.saturation, settings.lightnessBg]);
        root.style.setProperty(`--clock-${index}-bg`, rgb);

        rgb = wasmInterface.RgbFromHsl([hue, settings.saturation, settings.lightnessBg1]);
        root.style.setProperty(`--clock-${index}-bg1`, rgb);

        rgb = wasmInterface.RgbFromHsl([hue, settings.saturation, settings.lightnessBg2]);
        root.style.setProperty(`--clock-${index}-bg2`, rgb);

    }

    function updateDerivedVariable(cssLabel: string, copyFrom: string) {
        let source = getComputedStyle(root).getPropertyValue(copyFrom);
        root.style.setProperty(cssLabel, source);
    }

    updateDerivedVariable('--bg-notes', '--clock-06-bg');
    updateDerivedVariable('--bg-triaged', '--clock-12-bg');
    updateDerivedVariable('--bg-bin', '--clock-02-bg');

    updateDerivedVariable('--fg-notes', '--clock-06-fg');
    updateDerivedVariable('--fg-triaged', '--clock-12-fg');
    updateDerivedVariable('--fg-bin', '--clock-02-fg');

    updateDerivedVariable('--textarea-border', '--textarea-bg');
}

// let current = getComputedStyle(root).getPropertyValue("--fg-clock-12");

function indexAsString(i) {
    if (i === 0) {
        return "12";
    } else if (i < 10) {
        return `0${i}`;
    } else {
        return `${i}`;
    }
}

export { buildColourConversionFn, declareCssVariables, augmentSettingsWithCssModifierParameters }
