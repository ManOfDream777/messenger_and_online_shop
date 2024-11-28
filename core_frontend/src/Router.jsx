import {BrowserRouter, Routes, Route} from "react-router-dom";
import ChatInterface from "./RealTimeChat/ChatInterface";
import ProtectedRoutes from "./components/ProtectedRoutes";
import ChatAuth from "./RealTimeChat/ChatAuth";
import ActivationPage from "./RealTimeChat/ActivationPage";

function Router() {
  return (
        <BrowserRouter>
            <Routes>
                <Route element={<ProtectedRoutes/>}>
                    <Route element={<ActivationPage/>} path={'/c/activation_link/:encrypted_uuid/'}/>
                    <Route element={<ChatInterface/>} path={'/c/'}/>
                    <Route element={<ChatInterface/>} path={'/c/:uuid/'}/>
                </Route>
                <Route element={<ChatAuth/>} path={'/chat/auth/'}/>
                <Route element={<div> Страница не найдена </div>} path={'*'}/>
            </Routes>
        </BrowserRouter>
    )
}

export default Router;
