export function capitalise(text: string) {
    const capitaliseWord = (word: string) =>
        word.slice(0, 1).toUpperCase() + word.slice(1);
    return text.split(" ").map(capitaliseWord).join(" ");
}

export function plural(
    num: number,
    decimalPlaces: number,
    phrase: string,
    suffix: string
) {
    let showNum = num.toFixed(decimalPlaces);
    return num === 1 ? `${showNum} ${phrase}` : `${showNum} ${phrase}${suffix}`;
}

export function formattedDate(timestamp: string) {
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const d = new Date(timestamp);
    const textual = d.toLocaleDateString("en-GB", options);

    return textual;
}
