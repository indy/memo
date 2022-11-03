import { h, createContext, ComponentChildren } from "preact";
import { useContext } from "preact/hooks";

export const WasmInterfaceContext = createContext({});

export const WasmInterfaceProvider = ({
    wasmInterface,
    children,
}: {
    wasmInterface: any;
    children: ComponentChildren;
}) => {
    return (
        <WasmInterfaceContext.Provider value={wasmInterface}>
            {children}
        </WasmInterfaceContext.Provider>
    );
};

export const useWasmInterface = () => useContext(WasmInterfaceContext);
