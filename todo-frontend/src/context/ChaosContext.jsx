import { createContext, useContext, useState } from "react";

const ChaosContext = createContext();

export function ChaosProvider({ children }){
    const [chaosEnbled, setChaosEnabled] = useState(false);

    const toggleChaos = () => {
        const newVal = !chaosEnbled;

        setChaosEnabled(newVal);
        localStorage.setItem('chaos-mode', newVal.toString());
    };

    return (
        <ChaosContext.Provider value={{ chaosEnbled , toggleChaos }}>
            {children}
        </ChaosContext.Provider>
    );
}

export const useChaos = () => useContext(ChaosContext);