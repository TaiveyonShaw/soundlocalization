import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';

export const useFirebaseAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(
            (user) => setUser(user),
            (error) => setError(error.message)
        );

        return () => unsubscribe();
    }, []);

    return { user, error };
}; 