// src/components/PrivateRoute.tsx
import { ReactNode, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface PrivateRouteProps {
    children: ReactNode;
    path: string;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        // If the user is not authenticated, redirect them to the login page
        return <Redirect to="/login" />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
