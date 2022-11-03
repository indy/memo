// svg icons are from https://icons.mono.company
// old ones were from https://github.com/tabler/tabler-icons

// tidy up svg with: https://yqnn.github.io/svg-path-editor/

import { h } from "preact";

type SvgArgs = { fillColour: string };

export function SvgBin({ fillColour }: SvgArgs) {
    const fillText = `var(${fillColour})`;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            height="24"
            width="24"
        >
            <path
                xmlns="http://www.w3.org/2000/svg"
                d="M7 4C7 2.89543 7.89543 2 9 2H15C16.1046 2 17 2.89543 17 4V6H18.9897C18.9959 5.99994 19.0021 5.99994 19.0083 6H21C21.5523 6 22 6.44772 22 7C22 7.55228 21.5523 8 21 8H19.9311L19.0638 20.1425C18.989 21.1891 18.1182 22 17.0689 22H6.93112C5.88184 22 5.01096 21.1891 4.9362 20.1425L4.06888 8H3C2.44772 8 2 7.55228 2 7C2 6.44772 2.44772 6 3 6H4.99174C4.99795 5.99994 5.00414 5.99994 5.01032 6H7V4ZM9 6H15V4H9V6ZM6.07398 8L6.93112 20H17.0689L17.926 8H6.07398ZM10 10C10.5523 10 11 10.4477 11 11V17C11 17.5523 10.5523 18 10 18C9.44772 18 9 17.5523 9 17V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V17C15 17.5523 14.5523 18 14 18C13.4477 18 13 17.5523 13 17V11C13 10.4477 13.4477 10 14 10Z"
                fill={fillText}
            ></path>
        </svg>
    );
}

export function SvgExpand() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            height="24"
            width="24"
        >
            <path
                xmlns="http://www.w3.org/2000/svg"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z"
                class="svg-fill-colour"
            ></path>
        </svg>
    );
}

export function SvgMinimise() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            height="24"
            width="24"
        >
            <path
                xmlns="http://www.w3.org/2000/svg"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12Z"
                class="svg-fill-colour"
            ></path>
        </svg>
    );
}

export function SvgPinned({ fillColour }: SvgArgs) {
    const fillText = `var(${fillColour})`;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            height="24"
            width="24"
        >
            <path
                xmlns="http://www.w3.org/2000/svg"
                d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM13.4142 13.4143L15.5356 8.46451L10.5858 10.5858L8.46448 15.5356L13.4142 13.4143Z"
                fill={fillText}
            ></path>
        </svg>
    );
}

export function SvgUnpinned({ fillColour }: SvgArgs) {
    const fillText = `var(${fillColour})`;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            height="24"
            width="24"
        >
            <path
                xmlns="http://www.w3.org/2000/svg"
                d="M6 10.5994V4C5.44772 4 5 3.55228 5 3C5 2.44772 5.44772 2 6 2H18C18.5523 2 19 2.44772 19 3C19 3.55228 18.5523 4 18 4V10.5994C18.9318 11.6201 19.4321 12.6341 19.6987 13.4338C19.8447 13.8719 19.9199 14.2435 19.9587 14.5148C19.9781 14.6506 19.9884 14.7615 19.9939 14.8436C19.9966 14.8847 19.9981 14.9186 19.999 14.9448L19.9996 14.9682L19.9998 14.9783L20 14.9907L20 14.9957L20 14.9979L20 14.999C20 14.999 19.9954 14.8677 20 15C20 15.5523 19.5523 16 19 16H13V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V16H5C4.44772 16 4 15.5523 4 15C4 14.5 4 14.999 4 14.999L4 14.9979L4.00001 14.9957L4.00004 14.9907L4.00019 14.9783C4.00033 14.9691 4.00059 14.9579 4.00101 14.9448C4.00185 14.9186 4.00338 14.8847 4.00612 14.8436C4.01159 14.7615 4.02191 14.6506 4.0413 14.5148C4.08006 14.2435 4.15528 13.8719 4.30132 13.4338C4.56788 12.6341 5.06824 11.6201 6 10.5994ZM16 4H8V11C8 11.2652 7.89464 11.5196 7.70711 11.7071C6.86009 12.5541 6.43577 13.3854 6.22128 14H17.7787C17.5642 13.3854 17.1399 12.5541 16.2929 11.7071C16.1054 11.5196 16 11.2652 16 11V4Z"
                fill={fillText}
            ></path>
        </svg>
    );
}
