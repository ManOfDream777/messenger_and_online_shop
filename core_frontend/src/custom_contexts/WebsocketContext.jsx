import React, {createContext, useContext, useEffect, useRef} from 'react';
import {
    openChat,
    setAvailableChats,
    setBlankText,
    setLastMessage,
    setNewMessage, UpdatePublicKey,
    updateUnreadMessages
} from "../redux_utils/actions";
import {useDispatch} from "react-redux";
import {
    convertTimeStampToDate,
    decrypt_and_retrieve_localstorage_keys, decrypt_chat_history, decrypt_data_symmetrically,
    decrypt_incoming_chats,
    decrypt_message,
    encrypt_and_set_localstorage_keys,
    get_current_dialog_from_localstorage,
    setDialogDataInLocalStorage
} from "../services/utils";

const WebsocketContext = createContext(null);

export const WebSocketProvider = ({children}) => {
    const ws = useRef(null);
    const dispatch = useDispatch()

    useEffect(() => {
        ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/c/`);

        ws.current.onopen = () => {
            console.log('WebSocket connection opened');
        };

        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        ws.current.onmessage = async (event) => {
            const data = JSON.parse(event.data)
            switch (data.action_type) {
                case 'chat_list':
                    const chat_list = await decrypt_incoming_chats(data.message)
                    dispatch(setAvailableChats(chat_list))

                    const dialogs = decrypt_and_retrieve_localstorage_keys()

                    if (dialogs) {
                        const no_public_keys_dialog_ids = dialogs.filter(key => key.companion_public_key === '').map(key => key.dialog_id)
                        if (no_public_keys_dialog_ids.length > 0) {
                            ws.current.send(JSON.stringify({
                                action_type: 'exchange_keys',
                                dialog_ids: no_public_keys_dialog_ids
                            }))
                        }
                    }
                    break
                case 'retrieve_chat':
                    dispatch(openChat(await decrypt_chat_history(data.message)))
                    dispatch(setBlankText(false))
                    dispatch(updateUnreadMessages(data.message))
                    break
                case 'error need attention':
                    console.log(data.message)
                    // make error validation
                    break
                case 'unresolved error':
                    console.log(data.message)
                    // make error validation
                    break
                case 'message_sent':
                    const key = get_current_dialog_from_localstorage(data.message.dialog_id)
                    const original_data = data.message
                    const decrypted_secret_key = await decrypt_message(key.private_key, original_data.encrypted_secret_key_by_own_key, original_data.encrypted_secret_key_by_companion_key)
                    const decrypted_part = {
                        message: decrypt_data_symmetrically(original_data.text, decrypted_secret_key),
                        when_created: await convertTimeStampToDate(decrypt_data_symmetrically(original_data.when_created, decrypted_secret_key))
                    }
                    dispatch(setNewMessage({...data.message, text: decrypted_part.message, when_created: decrypted_part.when_created}))
                    dispatch(setLastMessage({...data.message, text: decrypted_part.message, when_created: decrypted_part.when_created}))
                    break
                case 'exchange_keys':
                    const public_keys = data.message
                    const dialogs_without_public_keys = decrypt_and_retrieve_localstorage_keys().filter(key => key.companion_public_key === '')
                    for (let i = 0; i < dialogs_without_public_keys.length; i++) {
                        const dialog = dialogs_without_public_keys[i]
                        const public_key = public_keys.find(key => key.dialog_id === dialog.dialog_id)
                        if (public_key) {
                            const dialog_data = {
                                dialog_id: dialog.dialog_id,
                                public_key: dialog.public_key,
                                private_key: dialog.private_key,
                                companion_public_key: JSON.parse(public_key.public_key)
                            }
                            setDialogDataInLocalStorage(dialog_data)
                            encrypt_and_set_localstorage_keys()
                            dispatch(UpdatePublicKey(dialog_data))
                        }
                    }
                    break

                default:
                    break
            }
        }

        return () => {
            ws.current.close();
        };
    }, []);

    const sendMessage = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(message);
        }
    };

    return (
        <WebsocketContext.Provider value={{sendMessage}}>
            {children}
        </WebsocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebsocketContext);
};
