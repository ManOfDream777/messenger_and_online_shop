import {Navigate, Outlet} from "react-router-dom";
import {useEffect, useState} from "react";
import {checkAuthenticated} from "../services/auth";
import {setUserData} from "../redux_utils/actions";
import {useDispatch} from "react-redux";

function ProtectedRoutes() {
    const [isAuth, setIsAuth] = useState(null)
    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch()

    useEffect(() => {
        const async_callback = async () => {
            try {
                const check_authentication = await checkAuthenticated();
                if (check_authentication.status === 200) {
                    setIsAuth(true);
                    dispatch(setUserData(check_authentication.data));
                } else {
                    setIsAuth(false);
                }
            } catch (error) {
                setIsAuth(false);
            } finally {
                setLoading(false);
            }
        };

        async_callback();
    }, [window.location]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuth ? <Outlet/> : <Navigate to={'/chat/auth/'} replace={true}/>;
}

export default ProtectedRoutes;