// todo: the exports could be wrong, see the correct way of defining interfaces

export interface IAdmin {
    db_name: string
}

export interface IUser {
    username: string,
    email: string,
    admin?: IAdmin
}

export interface ICategory {
    id: number,
    title: string,
}

export interface ITriagedNote {
    age: string,
    content: string,
    created_at: string,
    triaged_at: string,
    id: number,
    pinned: boolean,
    title: string,
    category_id: number
}

export interface INote {
    age: string,
    content: string,
    created_at: string,
    id: number,
    pinned: boolean,
    title: string
}

export interface IListing {
    bin: Array<INote>,
    notes: Array<INote>,
    triaged: Array<ITriagedNote>,
}

export interface IState {
    user?: IUser,
    settings: any,
    activeTopBarMenuItem: string,
    categories: Array<ICategory>,
    listing: IListing,
}

export interface IAction {
    type: string,
    id?: any,
    value?: any,
    url?: string,
    user?: any,
    categories?: any,
    notes?: any,
    triaged?: any,
    bin?: any,
    deletedCategory?: any,
    note?: any,
}

export type IReducer = (state: IState, action: IAction) => IState;

export interface IPigment {
    num: number,
    numString: string,
    class: string,
    classAlt: string
}
