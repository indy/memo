import { h, Fragment, createContext, useContext } from '../lib/preact/mod.js';

export const WasmInterfaceContext = createContext();

export const WasmInterfaceProvider = ({wasmInterface, children}) => {
    return <WasmInterfaceContext.Provider value={wasmInterface}>
               {children}
           </WasmInterfaceContext.Provider>
};

export const useWasmInterface = () => useContext(WasmInterfaceContext);
