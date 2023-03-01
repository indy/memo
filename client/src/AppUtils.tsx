import { Category } from "./types";

export function cssColourBg(numString: string): string {
    return `var(--clock-${numString}-bg)`;
}

export function cssColourBg1(numString: string): string {
    return `var(--clock-${numString}-bg1)`;
}

export function cssColourFg1(numString: string): string {
    return `var(--clock-${numString}-fg1)`;
}

export function getTriageLabel(categories: Category[], id: number): string {
    let cat: Category = categories.find((c) => c.id === id)!;
    return cat.title;
}
