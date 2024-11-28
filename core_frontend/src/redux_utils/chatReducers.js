import {
    OPEN_CHAT,
    SET_NEW_TEXT_MESSAGE,
    SET_KEY,
    SET_PUBLIC_KEY,
    SET_PRIVATE_KEY,
    SET_USER_DATA,
    SET_AVAILABLE_CHATS,
    SET_BLANK_TEXT,
    SET_ONLINE_STATUS,
    MESSAGE_SENT,
    UPDATE_LAST_MESSAGE,
    UPDATE_UNREAD_MESSAGES,
    SET_SIGNATURE,
    SET_DIALOG_DATA,
    UPDATE_PUBLIC_KEY,
    RESTORE_FROM_LOCALSTORAGE
} from "./actions";

const AuthDefaultState = {
    userData: {
        username: null,
        uuid: null,
    },
}

const ChatDefaultState = {
    chats: [],
    chat: {
        companion: '',
        messages: [],
        dialog_has_finished: false
    },
    show_blank_text: true,
    new_message_text: '',
}

const KeysDefaultState = {
    dialogs: [
        // {
        //     dialog_id: '',
        //     publicKey: '',
        //     privateKey: '',
        //     companion_public_key: '',
        // },
    ]
}
export const AuthReducer = (state = AuthDefaultState, action) => {
    switch (action.type) {
        case SET_USER_DATA:
            return {...state, userData: action.payload}
        case SET_ONLINE_STATUS:
            return {...state, userData: {...state.userData, online_status: action.payload}}
        default:
            return state
    }
}

export const UIChatReducer = (state = ChatDefaultState, action) => {
    switch (action.type) {
        case OPEN_CHAT:
            if (state.chat.companion !== action.payload.companion) {
                return {...state, chat: action.payload}
            }
            return {
                ...state, chat: {
                    ...state.chat, messages: [...action.payload.messages, ...state.chat.messages],
                    dialog_has_finished: action.payload.dialog_has_finished
                }
            }
        case SET_NEW_TEXT_MESSAGE:
            return {...state, new_message_text: action.payload}
        case SET_AVAILABLE_CHATS:
            return {...state, chats: action.payload}
        case SET_BLANK_TEXT:
            return {...state, show_blank_text: action.payload}
        case MESSAGE_SENT:
            return {...state, chat: {...state.chat, messages: [...state.chat.messages, action.payload]}}
        case UPDATE_LAST_MESSAGE:
            return {
                ...state,
                chats: state.chats.map(chat => {
                    if (chat.last_message === null) return chat
                    return ((chat.last_message.sender === action.payload.sender && chat.last_message.recipient === action.payload.recipient) ||
                        (chat.last_message.sender === action.payload.recipient && chat.last_message.recipient === action.payload.sender))
                        ? {...chat, last_message: action.payload}
                        : chat
                })
            };
        case UPDATE_UNREAD_MESSAGES:
            return {
                ...state, chats: state.chats.map(chat => {
                    if (chat.last_message === null) return chat
                    return chat.companion_data.username === action.payload.companion ? {
                        ...chat,
                        unread_messages_count: 0
                    } : chat

                })
            }
        default:
            return state
    }
}

export const KeysReducer = (state = KeysDefaultState, action) => {
    switch (action.type) {
        case SET_DIALOG_DATA:
            const dialogs_slice = state.dialogs.slice()
            if (!dialogs_slice.find(dialog => dialog.dialog_id === action.payload.dialog_id)) {
                return {...state, dialogs: [...state.dialogs, action.payload]}
            }
            return {...state, dialogs: [...state.dialogs]}

        case UPDATE_PUBLIC_KEY:
            return {...state, dialogs: state.dialogs.map(dialog => {
                if (dialog.dialog_id === action.payload.dialog_id) {
                    return {...dialog, companion_public_key: action.payload.companion_public_key}
                }
                return dialog
            })}
        case RESTORE_FROM_LOCALSTORAGE:
            return {...state, dialogs: action.payload}

        default:
            return state
    }
}