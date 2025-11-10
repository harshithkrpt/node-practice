import { useState, useEffect } from "react";


export const useFetch = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        fetch(url, options)
            .then(res => {
                if(!res.ok) {
                    throw new Error("Network Error");
                }
                return res.json()
            })
            .then(json => {
                if(isMounted) {
                    setData(json);
                }
            })
            .catch((err) => {
                if(isMounted) {
                    setError(err);
                }
            })
            .finally(() => {
                if(isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        }
    }, [url]);

    return { data, loading, error };
}