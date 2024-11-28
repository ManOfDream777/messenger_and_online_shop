import styles from "../assets/css/chat.module.css";
import ChatTextField from "./ChatTextField";
import {useSelector} from "react-redux";
import {useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {useWebSocket} from "../custom_contexts/WebsocketContext";

function ChatContent() {
    const chat = useSelector(state => state.chats.chat);
    const showBlankText = useSelector(state => state.chats.show_blank_text);
    const userData = useSelector(state => state.auth.userData);
    const dialog_has_finished = useSelector(state => state.chats.chat.dialog_has_finished);
    const [batchNumber, setBatchNumber] = useState(1)
    const [initialScroll, setInitialScroll] = useState(true)
    const {sendMessage} = useWebSocket();
    const {uuid} = useParams()
    const chat_history = useRef(null)


    const scrollHandler = () => {
        if (chat_history.current.scrollTop === 0 && !dialog_has_finished) {
            const batch_copy = batchNumber
            sendMessage(JSON.stringify({
                action_type: 'retrieve_chat',
                companion_uuid: uuid,
                batch_number: batch_copy + 1
            }))
            setBatchNumber(prev => prev + 1)
        }
    }

    useEffect(() => {
        const get_chat = async () => {
            if (uuid) {
                sendMessage(JSON.stringify({
                    action_type: 'retrieve_chat',
                    companion_uuid: uuid,
                    batch_number: batchNumber
                }))
            }
        }

        get_chat()
    }, [uuid]);

    useEffect(() => {
        if (chat_history.current && initialScroll) {
            chat_history.current.scrollTop = chat_history.current.scrollHeight;
            setInitialScroll(false)
        }
    },);

    useEffect(() => {
        chat_history.current?.addEventListener('scroll', scrollHandler)
        return () => {
            chat_history.current?.removeEventListener('scroll', scrollHandler)
        }
    }, [chat_history.current, scrollHandler]);


    if (showBlankText) {
        return (
            <div className={styles.content}>
                <p>Click on chat to start or continue the conversation.</p>
            </div>
        )
    }

    return (
        <div className={styles.content}>
            <div className={styles.content_companion}>
                <h3>{chat.companion}</h3>
            </div>
            <div className={styles.chat_history} ref={chat_history}>
                {chat.messages.length !== 0 ? chat.messages.map((message, index) => (
                        <div key={index}
                             className={message.sender !== userData.username ? `${styles.message_wrapper} ${styles.companion_message}` : `${styles.message_wrapper}`}>
                            <div className={styles.message}>
                                <p>{message.text}</p>
                                <small className={styles.message_time}>{message.when_created}</small>
                            </div>
                        </div>
                    )) :
                    <div className={styles.no_messages}>
                        <p>No messages yet. </p>
                    </div>
                }
            </div>
            <ChatTextField/>
        </div>
    )
}

export default ChatContent