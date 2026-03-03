import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initStore, getStore, setStore } from '../data/store';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
    const [data, setData] = useState(() => initStore());

    const refresh = useCallback(() => {
        setData(getStore());
    }, []);

    const update = useCallback((updater) => {
        const current = getStore();
        const updated = updater(current);
        setStore(updated);
        setData(updated);
        return updated;
    }, []);

    return (
        <StoreContext.Provider value={{ data, refresh, update }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    return useContext(StoreContext);
}
