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
  let root = document.getElementById("root");
  let mode = getComputedStyle(root).getPropertyValue("--mode").trim();

  let s;

  if (mode === "dark") {
    s = {
      ...settings,
      saturation: 70,
      lightnessFg: 60.0,
      lightnessBg: 30.0,
      lightnessHi: 25.0,
      lightnessHi2: 15.0
    }
  } else {
    s = {
      ...settings,
      saturation: 60.2,
      lightnessFg: 30.0,
      lightnessBg: 90.0,
      lightnessHi: 80.0,
      lightnessHi2: 70.0
    }
  }

  return s;
}

function declareCssVariables(settings, wasmInterface) {
  let root = document.getElementById("root");

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
