import { useState, useEffect } from "react";

export const useDebounce = (value, delay = 300) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timerId = setTimeout(() => setDebounced(value), delay);

        return () => clearTimeout(timerId)
    }, [value]);

    return debounced;
}