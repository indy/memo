// todo: the exports could be wrong, see the correct way of defining interfaces

import { Signal } from "@preact/signals";

export interface IAdmin {
    db_name: string;
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
    created_at: string;
    id: number;
    pinned: boolean;
    title: string;
    triaged_at?: string;
    category_id?: number;
}

export interface IListing {
    bin: Array<INote>;
    notes: Array<INote>;
    triaged: Array<INote>;
}

export interface IState {
    user: Signal<IUser>;
    wasmInterface: any;
    settings: Signal<any>;
    activeTopBarMenuItem: Signal<string>;
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
