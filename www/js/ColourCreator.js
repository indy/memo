function buildColourConversionFn(wasm_bindgen) {
  const { rgb_from_hsl } = wasm_bindgen;

  return (hsl) => {
    function clamp(value, min, max) {
      return value < min ? min : (value > max ? max : value);
    }

    function componentAsHexString(c) {
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

function augmentSettingsWithCssModifierParameters(settings) {
  let root = document.body;
  let mode = getComputedStyle(root).getPropertyValue("--mode").trim();

  let s;

  if (mode === "light") {
    s = {
      ...settings,

      bg: [46.5, 19.2, 95.7],
      fg: [53.2, 17.4, 3.4],
      fg1: [0, 0, 40.7],
      fg_inactive: [0, 0, 59.8],
      bg1: [85.9, 4.5, 93.9],
      bg2: [46.2, 20.1, 92],
      textarea_bg: [85.9, 100, 99.8],
      textarea_fg: [53.2, 17.4, 3.4],

      save_on_bg: [127, 70, 80],
      save_on_fg: [53.2, 17.4, 3.4],
      bg_section_controls: [0, 0, 90],
      card_shadow: [0, 0, 83.5],
      divider: [0, 0, 77.7],

      saturation: 60.2,
      lightnessFg: 30.0,
      lightnessBg: 90.0,
      lightnessHi: 80.0,
      lightnessHi2: 70.0
    }
  } else {

    let bgh = 220;
    let bgs = 60;
    let bgl = 40;


    s = {
      ...settings,

      bg: [bgh, bgs, bgl],
      fg: [bgh, 100, 10],
      fg1: [bgh, bgs + 40, 20],
      fg_inactive: [bgh, bgs + 40, 20],
      bg1: [bgh, bgs, bgl + 14],
      bg2: [bgh, bgs, bgl + 7],
      textarea_bg: [0, 0, 12],
      textarea_fg: [236, 2.7, 69],

      save_on_fg: [220, 10, 80],
      save_on_bg: [127, 90, 40],

      bg_section_controls: [bgh, bgs, bgl + 20],
      card_shadow: [bgh, bgs, bgl - 4],
      divider: [bgh, bgs, bgl - 13],

      saturation: 70,
      lightnessFg: 60.0,
      lightnessBg: 30.0,
      lightnessHi: 25.0,
      lightnessHi2: 15.0
    }
  }
  return s;
}

function declareCssVariables(settings, wasmInterface) {
  let root = document.body;

  function updateVariable(label) {
    let cssName = '--' + label.replaceAll('_', '-');

    root.style.setProperty(cssName, wasmInterface.RgbFromHsl(settings[label]));
  }

  updateVariable('bg');
  updateVariable('fg');
  updateVariable('fg1');
  updateVariable('fg_inactive');
  updateVariable('bg1');
  updateVariable('bg2');
  updateVariable('textarea_bg');
  updateVariable('textarea_fg');
  updateVariable('save_on_bg');
  updateVariable('save_on_fg');
  updateVariable('bg_section_controls');
  updateVariable('card_shadow');
  updateVariable('divider');

  let hue, rgb, index;
  for(let i = 0; i < 12; i++) {
    hue = settings.hueOffset + ( i * settings.hueDelta);

    index = indexAsString(i);

    rgb = wasmInterface.RgbFromHsl([hue, settings.saturation, settings.lightnessFg]);
    root.style.setProperty(`--fg-clock-${index}`, rgb);

    rgb = wasmInterface.RgbFromHsl([hue, settings.saturation, settings.lightnessBg]);
    root.style.setProperty(`--bg-clock-${index}`, rgb);

    rgb = wasmInterface.RgbFromHsl([hue, settings.saturation, settings.lightnessHi]);
    root.style.setProperty(`--bg-clock-${index}-hi`, rgb);

    rgb = wasmInterface.RgbFromHsl([hue, settings.saturation, settings.lightnessHi2]);
    root.style.setProperty(`--bg-clock-${index}-hi2`, rgb);
  }

  function updateDerivedVariable(cssLabel, copyFrom) {
    let source = getComputedStyle(root).getPropertyValue(copyFrom);
    root.style.setProperty(cssLabel, source);
  }

  updateDerivedVariable('--bg-notes', '--bg-clock-06');
  updateDerivedVariable('--bg-triaged', '--bg-clock-12');
  updateDerivedVariable('--bg-bin', '--bg-clock-02');

  updateDerivedVariable('--fg-notes', '--fg-clock-06');
  updateDerivedVariable('--fg-triaged', '--fg-clock-12');
  updateDerivedVariable('--fg-bin', '--fg-clock-02');

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
