import styles from "../assets/css/chat.module.css"
import {useDispatch, useSelector} from "react-redux";
import {setNewTextMessage} from "../redux_utils/actions";
import {useParams} from "react-router-dom";
import {useWebSocket} from "../custom_contexts/WebsocketContext";
import {
    decrypt_and_retrieve_localstorage_keys,
    encrypt_data_symmetrically,
    encrypt_message,
    generate_secret_key_for_symmetrical_encryption_of_message_data
} from "../services/utils";

function ChatTextField() {
    const dispatch = useDispatch();
    const text = useSelector(state => state.chats.new_message_text);
    const dialog_id = useSelector(state => state.chats.chat.dialog_id)
    const key = useSelector(state => state.keys.dialogs.find(dialog => dialog.dialog_id === dialog_id))
    const uuid = useParams()
    const {sendMessage} = useWebSocket();
    const handleSubmit = e => {
        e.preventDefault()
        const async_callback = async () => {
            const secret_key = generate_secret_key_for_symmetrical_encryption_of_message_data()
            const encrypted_text = encrypt_data_symmetrically(text, secret_key)
            const encrypted_when_created = encrypt_data_symmetrically(new Date().getTime().toString(), secret_key)
            const encrypted_part_of_data_to_send = {
                message: encrypted_text,
                when_created: encrypted_when_created,
                encrypted_secret_key_by_own_key: await encrypt_message(key.public_key, secret_key),
                encrypted_secret_key_by_companion_key: await encrypt_message(key.companion_public_key, secret_key)
            }
            sendMessage(JSON.stringify({
                action_type: 'message_sent',
                companion_uuid: uuid.uuid,
                ...encrypted_part_of_data_to_send
            }))
        }
        async_callback()
        dispatch(setNewTextMessage(''))
        e.target.message.value = ''
    }

    const handleInput = e => {
        dispatch(setNewTextMessage(e.target.value))
    }

    const send_message_icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                   className="bi bi-arrow-up" viewBox="0 0 16 16">
        <path fillRule="evenodd"
              d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
    </svg>

    return (
        <div className={styles.send_message}>
            <form onSubmit={handleSubmit}>
                <textarea onInput={handleInput} name="message" placeholder={'Enter your message...'}>

                </textarea>
                <button className={text.length > 0 ? `${styles.send_msg}` : `${styles.send_msg} ${styles.hide_button}`}
                        type={'submit'}>{send_message_icon}</button>
            </form>
        </div>
    )
}

export default ChatTextField