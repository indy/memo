// todo: the exports could be wrong, see the correct way of defining interfaces

import { Signal } from "@preact/signals";

export interface IAdmin {
    dbName: string;
}

export interface IUser {
    username: string;
    email: string;
    admin?: IAdmin;
}

export interface ICategory {
    id: number;
    title: string;
}

export interface INote {
    age: string;
    content: string;
    createdAt: string;
    id: number;
    pinned: boolean;
    title: string;
    triagedAt?: string;
    categoryId?: number;
}

export interface IListing {
    notes: Array<INote>;
    category: { [key: number]: Array<INote> };
    bin: Array<INote>;
}

export interface ISettings {
    hueOffset: number;
    hueDelta: number;

    bg?: [number, number, number],
    bg1?: [number, number, number],
    bg2?: [number, number, number],
    fg?: [number, number, number],
    fg1?: [number, number, number],

    fg_inactive?: [number, number, number],
    textarea_bg?: [number, number, number],
    textarea_fg?: [number, number, number],

    save_on_bg?: [number, number, number],
    save_on_fg?: [number, number, number],

    divider?: [number, number, number],

    saturation?: number,
    lightnessBg?: number,
    lightnessBg1?: number,
    lightnessBg2?: number,
    lightnessFg?: number,
    lightnessFg1?: number
}

export interface WasmInterface {
    RgbFromHsl(hsl: [number, number, number]): string
}

export interface IState {
    user: Signal<IUser>;
    wasmInterface: WasmInterface | undefined;
    settings: Signal<any>;
    activeTopBarMenuItem: Signal<string>; // "notes" | "triaged" | "bin"
    triageLabel: Signal<string>;
    showTriageDrawer: Signal<boolean>;
    categories: Signal<Array<ICategory>>;
    listing: Signal<IListing>;
}

export interface IAction {
    type: string;
    id?: any;
    value?: any;
    url?: string;
    user?: any;
    categories?: any;
    notes?: any;
    triaged?: any;
    bin?: any;
    deletedCategory?: any;
    note?: any;
}

export interface IPigment {
    num: number;
    numString: string;
    class: string;
    classAlt: string;
}
