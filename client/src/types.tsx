// todo: the exports could be wrong, see the correct way of defining interfaces

import { Signal } from "@preact/signals";

export type Admin = {
    dbName: string;
};

export type User = {
    username: string;
    email: string;
    admin?: Admin;
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
    notes: Array<Note>;
    category: { [key: number]: Array<Note> };
    bin: Array<Note>;
};

export enum NoteKind {
    Inbox,
    Category,
    Bin
};

export enum LoadState {
    NotLoaded = 1,
    Loading,
    Loaded,
};

export type LoadedListing = {
    notes: LoadState;
    category: { [key: number]: LoadState };
    bin: LoadState;
};

export type ColourTriple = [number, number, number];

export type Settings = {
    [index: string]: number | ColourTriple | undefined;

    hueOffset: number;
    hueDelta: number;

    bg?: ColourTriple;
    bg1?: ColourTriple;
    bg2?: ColourTriple;
    fg?: ColourTriple;
    fg1?: ColourTriple;

    fg_inactive?: ColourTriple;
    textarea_bg?: ColourTriple;
    textarea_fg?: ColourTriple;

    save_on_bg?: ColourTriple;
    save_on_fg?: ColourTriple;

    divider?: ColourTriple;

    saturation?: number;
    lightnessBg?: number;
    lightnessBg1?: number;
    lightnessBg2?: number;
    lightnessFg?: number;
    lightnessFg1?: number;

    lightnessHi?: number;
    lightnessHi2?: number;
};

export type WasmInterface = {
    RgbFromHsl(hsl: ColourTriple): string;
};

export type State = {
    user: Signal<User>;
    wasmInterface: WasmInterface | undefined;
    settings: Signal<Settings>;
    activeTopBarMenuItem: Signal<"notes" | "triaged" | "bin">;
    triageLabel: Signal<string>;
    showTriageDrawer: Signal<boolean>;
    categories: Signal<Array<Category>>;
    listing: Signal<Listing>;
    loaded: Signal<LoadedListing>;
};

export type Pigment = {
    num: number;
    numString: string;
    class: string;
    classAlt: string;
};
