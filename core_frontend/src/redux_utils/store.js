import {combineReducers} from "redux";
import {configureStore} from "@reduxjs/toolkit"
import {AuthReducer, KeysReducer, UIChatReducer} from "./chatReducers";

const rootReducer = combineReducers({
        chats: UIChatReducer,
        keys: KeysReducer,
        auth: AuthReducer
    }
)

export const store = configureStore({
    reducer: rootReducer,
})
