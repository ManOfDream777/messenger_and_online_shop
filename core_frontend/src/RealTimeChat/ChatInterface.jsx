import styles from "../assets/css/chat.module.css"
import ChatSidebar from "../components/ChatSidebar";
import ChatContent from "../components/ChatContent";
import {WebSocketProvider} from "../custom_contexts/WebsocketContext";
import {decrypt_and_retrieve_localstorage_keys} from "../services/utils";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {restoreDialogData} from "../redux_utils/actions";
import {useParams} from "react-router-dom";

function ChatInterface() {
    const dispatch = useDispatch()
    const {uuid} = useParams()

    useEffect(() => {
        if (uuid) {
            window.location.replace('/c/')
        } else {
            const decrypted_keys = decrypt_and_retrieve_localstorage_keys()
            if (decrypted_keys) {
                dispatch(restoreDialogData(decrypted_keys))
            }
        }

        //     no keys found, do some actions to show user empty chats or notify user about lack of keys or ask him
        //     to create new chat with another user, because no keys - no messages.
    }, [dispatch]);

    return (
        <WebSocketProvider>
            <div className={styles.wrapper}>
                <ChatSidebar/>
                <ChatContent/>
            </div>
        </WebSocketProvider>
    )

}

export default ChatInterface