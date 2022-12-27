import { ICategory } from "./types";

export function cssColourBg(numString: string): string {
    return `var(--clock-${numString}-bg)`;
}

export function cssColourBg1(numString: string): string {
    return `var(--clock-${numString}-bg1)`;
}

export function cssColourFg1(numString: string): string {
    return `var(--clock-${numString}-fg1)`;
}

export function getTriageLabel(categories: ICategory[], id: number): string {
    let cat: ICategory = categories.find(c => c.id === id)!;
    return cat.title;
}
