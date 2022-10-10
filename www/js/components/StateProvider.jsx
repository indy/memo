import { h, Fragment, createContext, useContext, useReducer } from '../../lib/preact/mod.js';

export const StateContext = createContext();

export const StateProvider = ({reducer, initialState, children}) => {
    return <StateContext.Provider value={useReducer(reducer, initialState)}>
               { children }
           </StateContext.Provider>;
};

// export const StateProvider = ({reducer, initialState, children}) => {
//     return <StateContext.Provider value={initialState}>
//                { children }
//            </StateContext.Provider>;
// };

export const useStateValue = () => useContext(StateContext);
