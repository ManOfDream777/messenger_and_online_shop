import styles from "../assets/css/chat.module.css";
import Badge from "react-bootstrap/Badge";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import CreateNewChat from "../RealTimeChat/CreateNewChat";

function ChatSidebar() {
    const chats = useSelector(state => state.chats.chats);
    const userData = useSelector(state => state.auth.userData);

    return (
        <div className={styles.sidebar}>
            <div className={styles.user_info}>
                <h3>Welcome, {userData.username}!</h3>
                <CreateNewChat/>
            </div>

            <div
                className={chats.length !== 0 ? styles.existing_dialogs : ` ${styles.existing_dialogs} ${styles.no_history}`}>
                {chats.length !== 0 ? chats.map((chat, index) => {
                        if (chat.companion_data === null) {
                            return (
                                <div key={index} className={styles.chat_box}>
                                    <h5>Your companion is unknown now.</h5>
                                    <p>No messages yet.</p>
                                </div>)
                        } else if (chat.error) {
                            return (
                                <div key={index} className={styles.chat_box}>
                                    <h5>{chat.error}</h5>
                                </div>)
                        } else if (chat.last_message === null) {
                            return (
                                <Link to={`/c/${chat.companion_data.uuid}/`} key={index} className={styles.chat_box}>
                                    <h5>
                                <span className={styles.companion_text_wrapper}>{chat.companion_data.username}
                                    <span className={chat.companion_data.online ? styles.online_status : ''}></span>
                                </span>
                                    </h5>
                                    <p>No messages yet.</p>
                                </Link>)
                        }
                        return (
                            <Link to={`/c/${chat.companion_data.uuid}/`} key={index} className={styles.chat_box}>
                                <h5>
                                <span className={styles.companion_text_wrapper}>{chat.companion_data.username}
                                    <span className={chat.companion_data.online ? styles.online_status : ''}></span>
                                </span>
                                </h5>
                                <p>{chat.last_message.sender === userData.username ? 'You' : chat.companion_data.username}: {chat.last_message.text.length > 25 ? chat.last_message.text.slice(0, 25) + '...' : chat.last_message.text}</p>
                                <p className={styles.last_message_time}>{chat.last_message.when_created}</p>
                                <div className={styles.unread_count}>{chat.unread_messages_count > 0 &&
                                    <Badge bg="primary">{chat.unread_messages_count}</Badge>}</div>
                            </Link>)
                    }) :
                    <p> Click on a chat to start conversation or wait until host will share with unique link to start
                        discussion or create new chat and share with link to another user!</p>
                }
            </div>
        </div>
    )
}

export default ChatSidebar