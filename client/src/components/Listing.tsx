import type { ComponentChildren } from "preact";

function PinnedListing({ children }: { children: ComponentChildren }) {
    if (children && Array.isArray(children) && children.length > 0) {
        return (
            <div class="card-holder-pinned">
                <div class="card-holder-pinned-inner">{children}</div>
            </div>
        );
    }

    return null;
}

function UnPinnedListing({ children }: { children: ComponentChildren }) {
    return <div class="card-holder">{children}</div>;
}

export { PinnedListing, UnPinnedListing };
