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
#![cfg_attr(
    feature = "cargo-clippy",
    allow(many_single_char_names, too_many_arguments)
)]

extern crate cfg_if;
extern crate wasm_bindgen;

mod colour;
mod error;
mod utils;

use crate::colour::{Colour, Format};
use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;

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

#[wasm_bindgen]
pub struct Transport3C {
    c0: f64,
    c1: f64,
    c2: f64,
}

#[wasm_bindgen]
impl Transport3C {
    pub fn new(c0: f64, c1: f64, c2: f64) -> Transport3C {
        Transport3C {
            c0: c0,
            c1: c1,
            c2: c2,
        }
    }

    pub fn blank() -> Transport3C {
        Transport3C {
            c0: 0.0,
            c1: 0.0,
            c2: 0.0,
        }
    }

    pub fn get_0(&self) -> f64 {
        self.c0
    }

    pub fn get_1(&self) -> f64 {
        self.c1
    }

    pub fn get_2(&self) -> f64 {
        self.c2
    }
}

#[wasm_bindgen]
pub fn hsl_from_rgb(r: f64, g: f64, b: f64) -> Transport3C {
    let hsluv = Colour::RGB(r, g, b, 1.0).clone_as(Format::HSLuv).unwrap();

    match hsluv {
        Colour::HSLuv(h, s, l, _) => Transport3C::new(h, s, l),
        _ => Transport3C::blank(),
    }
}

#[wasm_bindgen]
pub fn rgb_from_hsl(h: f64, s: f64, l: f64) -> Transport3C {
    let rgb = Colour::HSLuv(h, s, l, 1.0).clone_as(Format::RGB).unwrap();

    match rgb {
        Colour::RGB(r, g, b, _) => Transport3C::new(r, g, b),
        _ => Transport3C::blank(),
    }
}
