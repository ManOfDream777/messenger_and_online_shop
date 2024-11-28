import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/global.css'
import {Provider} from "react-redux";
import {store} from "./redux_utils/store";



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <Router/>
        </Provider>
    </React.StrictMode>
);
