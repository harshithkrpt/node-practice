import { useState, useEffect } from "react";

export const useLocalStorage = (key, initialValue) => {
    const [value, setValue] = useState(() => {
        try {
            const existingValue = localStorage.getItem("key");
            return existingValue ? JSON.parse(existingValue) : initialValue;
        }
        catch {
            return initialValue;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}