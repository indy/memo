// Copyright (C) 2018 Inderjit Gill

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
#![allow(dead_code)]

extern crate cfg_if;
extern crate wasm_bindgen;

mod colour;
mod error;

use crate::colour::{Hsluv, Rgb};
use cfg_if::cfg_if;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

cfg_if! {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    if #[cfg(feature = "console_error_panic_hook")] {
        extern crate console_error_panic_hook;
        pub use self::console_error_panic_hook::set_once as set_panic_hook;
    } else {
        #[inline]
        pub fn set_panic_hook() {}
    }
}

cfg_if! {
    if #[cfg(feature = "console_log")] {
        fn init_log() {
            use log::Level;
            console_log::init_with_level(Level::Info).expect("error initializing log");
        }
    } else {
        fn init_log() {}
    }
}

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Serialize, Deserialize)]
pub struct Transport3C {
    c0: f64,
    c1: f64,
    c2: f64,
}

impl Transport3C {
    pub fn new(c0: f64, c1: f64, c2: f64) -> Transport3C {
        Transport3C { c0, c1, c2 }
    }

    pub fn blank() -> Transport3C {
        Transport3C {
            c0: 0.0,
            c1: 0.0,
            c2: 0.0,
        }
    }
}

impl From<Rgb> for Transport3C {
    fn from(rgb: Rgb) -> Transport3C {
        Transport3C::new(rgb.r.into(), rgb.g.into(), rgb.b.into())
    }
}

impl From<Hsluv> for Transport3C {
    fn from(hsluv: Hsluv) -> Transport3C {
        Transport3C::new(hsluv.h.into(), hsluv.s.into(), hsluv.l.into())
    }
}

#[wasm_bindgen]
pub fn hsluv_from_rgb(r: f64, g: f64, b: f64) -> JsValue {
    let hsluv: Hsluv = Rgb::new(r as f32, g as f32, b as f32, 1.0).into();

    let res: Transport3C = hsluv.into();
    serde_wasm_bindgen::to_value(&res).unwrap()
}

#[wasm_bindgen]
pub fn rgb_from_hsluv(h: f64, s: f64, l: f64) -> JsValue {
    let rgb: Rgb = Hsluv::new(h as f32, s as f32, l as f32, 1.0).into();

    let res: Transport3C = rgb.into();
    serde_wasm_bindgen::to_value(&res).unwrap()
}

#[wasm_bindgen]
pub fn rgb_from_oklch(h: f64, s: f64, l: f64) -> JsValue {
    let rgb: Rgb = Hsluv::new(h as f32, s as f32, l as f32, 1.0).into();

    let res: Transport3C = rgb.into();
    serde_wasm_bindgen::to_value(&res).unwrap()
}
