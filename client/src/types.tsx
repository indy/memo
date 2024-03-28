// todo: the exports could be wrong, see the correct way of defining interfaces

import { Signal } from "@preact/signals";

import { NoteLocation, LoadState, ColourScheme } from "./enums";

export type Admin = {
    dbName: string;
};

export type User = {
    username: string;
    email: string;
    admin?: Admin;
};

export type UserWithUiConfig = User & {
    uiConfigJson: string;
};

export type Category = {
    id: number;
    title: string;
};

export type Note = {
    age: string;
    content: string;
    createdAt: string;
    id: number;
    pinned: boolean;
    title: string;
    triagedAt?: string;
    categoryId?: number;
};

export type Listing = {
    inbox: Array<Note>;
    group: { [key: number]: Array<Note> };
    bin: Array<Note>;
};

export type LoadedListing = {
    inbox: LoadState;
    group: { [key: number]: LoadState };
    bin: LoadState;
};

export type ColourTriple = [number, number, number];
export type ColourQuad = [number, number, number, number];

export type ColourSeeds = {
    hue: number;
    sat: number;

    bgL: number;
    bg1L: number;
    bgLDelta: number;

    fgH: number;
    fgS: number;
    fgL: number;
    fgLDelta: number;

    clockHDelta: number;

    clockFgL: number;
    clockBgL: number;
};

export type WasmInterface = {
    rgbFromHsl(h: number, s: number, l: number): any;
};

export type State = {
    user: Signal<User>;
    wasmInterface: WasmInterface | undefined;
    uiConfig: Signal<UiConfig>; // bit of duplication as the User contains the original uiConfig json string
    colourSeeds: Signal<ColourSeeds>;

    activeTopBarMenuItem: Signal<NoteLocation>;
    groupLabel: Signal<string>;
    showCategoryDrawer: Signal<boolean>;
    categories: Signal<Array<Category>>;
    listing: Signal<Listing>;
    loaded: Signal<LoadedListing>;
};

export type Pigment = {
    num: number;
    numString: string;
    class: string;
    classAlt: string;
    classFg: string;
};

// json structure that will be saved server-side
//
export type UiConfig = {
    colourScheme: ColourScheme;
};
