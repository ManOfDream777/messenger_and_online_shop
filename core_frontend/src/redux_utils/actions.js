export const OPEN_CHAT = 'OPEN_CHAT'
export const SET_NEW_TEXT_MESSAGE = 'SET_NEW_TEXT_MESSAGE'
export const SET_KEY = 'SET_KEY'
export const SET_PUBLIC_KEY = 'SET_PUBLIC_KEY'
export const RESTORE_FROM_LOCALSTORAGE = 'RESTORE_FROM_LOCALSTORAGE'
export const SET_DIALOG_DATA = 'SET_DIALOG_DATA'
export const SET_SIGNATURE = 'SET_SIGNATURE'
export const SET_USER_DATA = 'SET_USER_DATA'
export const SET_AVAILABLE_CHATS = 'SET_AVAILABLE_CHATS'
export const SET_BLANK_TEXT = 'SET_BLANK_TEXT'
export const SET_ONLINE_STATUS = 'SET_ONLINE_STATUS'
export const MESSAGE_SENT = 'MESSAGE_SENT'
export const UPDATE_LAST_MESSAGE = 'UPDATE_LAST_MESSAGE'
export const UPDATE_UNREAD_MESSAGES = 'UPDATE_UNREAD_MESSAGES'
export const UPDATE_PUBLIC_KEY = 'UPDATE_PUBLIC_KEY'
export const openChat = payload => ({
    type: OPEN_CHAT,
    payload
})

export const setNewMessage = payload => ({
    type: MESSAGE_SENT,
    payload
})
export const restoreDialogData = payload => ({
    type: RESTORE_FROM_LOCALSTORAGE,
    payload
})
export const setDialogData = payload => ({
    type: SET_DIALOG_DATA,
    payload
})
export const UpdatePublicKey = payload => ({
    type: UPDATE_PUBLIC_KEY,
    payload
})
export const setLastMessage = payload => ({
    type: UPDATE_LAST_MESSAGE,
    payload
})
export const updateUnreadMessages = payload => ({
    type: UPDATE_UNREAD_MESSAGES,
    payload
})

export const setNewTextMessage = payload => ({
    type: SET_NEW_TEXT_MESSAGE,
    payload
})

export const setUserData = payload => ({
    type: SET_USER_DATA,
    payload
})

export const setAvailableChats = payload => ({
    type: SET_AVAILABLE_CHATS,
    payload
})

export const setBlankText = payload => ({
    type: SET_BLANK_TEXT,
    payload
})

export const setKey = payload => ({
    type: SET_KEY,
    payload
})