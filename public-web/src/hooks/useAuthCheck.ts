import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';

export function useAuthCheck() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Check auth status via guest endpoint to avoid 401 errors
                const response = await apiClient.get('/guest/check');
                if (response.data.data.is_logged_in) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkStatus();
    }, []);

    return { isLoggedIn, isLoading };
}
