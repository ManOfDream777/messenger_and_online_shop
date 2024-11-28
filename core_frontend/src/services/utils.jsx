import {AES, enc} from 'crypto-js'

const local_secret_key = 'steeling_from_localstorage_not_possible'

export const generate_secret_key_for_symmetrical_encryption_of_message_data = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
export const encrypt_data_symmetrically = (data, secret_key) => {
    return AES.encrypt(data, secret_key).toString();
}

export const decrypt_data_symmetrically = (data, secret_key) => {
    return AES.decrypt(data, secret_key).toString(enc.Utf8);
}

export const exportKey = async key => {
    const exported = await window.crypto.subtle.exportKey("jwk", key);
    return JSON.stringify(exported, null, " ");
}

/*
@purpose: string "encrypt" for publicKey or "decrypt" for privateKey
 */
export const importKey = async (jwk, purpose) => {
    return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        [purpose],
    );
}

export async function encrypt_message(publicKey, message) {
    const ppk = await importKey(publicKey, 'encrypt');
    const encoded = new TextEncoder().encode(message);
    const encrypted = await crypto.subtle.encrypt(
        {name: "RSA-OAEP"},
        ppk,
        encoded
    );
    const uintArray = new Uint8Array(encrypted);

    const base64Data = JSON.stringify(Array.from(uintArray));
    return base64Data;
}

export async function decrypt_message(privateKey, encrypted_message_by_own_key, encrypted_message_by_companion_key) {
    const messages = [encrypted_message_by_own_key, encrypted_message_by_companion_key]
    const private_key = await importKey(privateKey, 'decrypt')
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        const bytes = JSON.parse(message)
        try {
            const decrypted = await crypto.subtle.decrypt(
                {name: "RSA-OAEP"},
                private_key,
                new Uint8Array(bytes)
            );
            const decoder = new TextDecoder();
            const decodedMessage = decoder.decode(decrypted);
            return decodedMessage;
        } catch (error) {
            // do nothing
        }
    }
}

export const setDialogDataInLocalStorage = dialog_info => {
    const keys = decrypt_and_retrieve_localstorage_keys()
    if (keys) {
        const updated_keys = keys.map(key => {
            if (key.dialog_id === dialog_info.dialog_id) {
                return {...key, companion_public_key: dialog_info.companion_public_key}
            }
            return key
        })
        localStorage.setItem('keys', JSON.stringify([...updated_keys]))
    } else {
        localStorage.setItem('keys', JSON.stringify([dialog_info]))
    }
}

export const get_current_dialog_from_localstorage = (dialog_id) => {
    const keys = decrypt_and_retrieve_localstorage_keys()
    const key = keys.find(dialog => dialog.dialog_id === dialog_id)
    if (key) {
        return key
    }
    return null;
}

export const decrypt_chat_history = async dialog => {
    const keys = decrypt_and_retrieve_localstorage_keys()
    const decrypted_messages = []
    for (let i = 0; i < dialog.messages.length; i++) {
        const message = dialog.messages[i]
        const key = keys ? keys.find(key => key.dialog_id === dialog.dialog_id) : false
        if (key) {
            const decrypted_secret_key = await decrypt_message(key.private_key, message.encrypted_secret_key_by_own_key, message.encrypted_secret_key_by_companion_key)
            message.text = decrypt_data_symmetrically(message.text, decrypted_secret_key)
            message.when_created = await convertTimeStampToDate(decrypt_data_symmetrically(message.when_created, decrypted_secret_key))
            decrypted_messages.push(message)
        } else {
            decrypted_messages.push({
                'text': 'Not possible to decrypt this message, because, most probably, you have lost your key pair.' +
                    ' Delete this' +
                    ' dialog and create new one.',
            })
        }
    }

    return {...dialog, messages: decrypted_messages}
}

export const decrypt_incoming_chats = async messages => {
    const keys = decrypt_and_retrieve_localstorage_keys()
    const decrypted_messages = []
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        const key = keys ? keys.find(key => key.dialog_id === message.id) : false
        if (key) {
            if (message.last_message !== null) {
                const decrypted_secret_key = await decrypt_message(key.private_key, message.last_message.encrypted_secret_key_by_own_key, message.last_message.encrypted_secret_key_by_companion_key)
                message.last_message.text = decrypt_data_symmetrically(message.last_message.text, decrypted_secret_key)
                message.last_message.when_created = await convertTimeStampToDate(decrypt_data_symmetrically(message.last_message.when_created, decrypted_secret_key))
                message.last_message.encrypted_secret_key = decrypted_secret_key
            }
            decrypted_messages.push(message)
        } else {
            decrypted_messages.push({
                'id': message.id,
                'error': 'Not possible to decrypt this dialog, because you have lost your key pair. Delete this' +
                    ' dialog and create new one.',
                'companion_data': message.companion_data
            })
        }
    }
    return decrypted_messages
}

export const encrypt_and_set_localstorage_keys = () => {
    const encrypted_data = encrypt_data_symmetrically(localStorage.getItem('keys'), local_secret_key)
    localStorage.setItem('keys', encrypted_data)
    return true
}

export const decrypt_and_retrieve_localstorage_keys = () => {
    const encrypted_data = localStorage.getItem('keys')
    if (encrypted_data) {
        return JSON.parse(decrypt_data_symmetrically(encrypted_data, local_secret_key))
    }
    return false
}
export const clear_error_msg = () => {
    const tags = document.querySelectorAll(`span[error_tag]`)
    tags.forEach(tag => {
        tag.textContent = ''
    })
}

export const handle_errors = (validator, e) => {
    const errors = validator.show_errors()
    errors.forEach(error => {
        const key = Object.keys(error)[0]
        const value = error[key]
        const tag = e.target.querySelector(`[error_tag=form_${key}]`)
        tag.textContent = value
    })
}

export const convertTimeStampToDate = async time_as_str => {
    const date_as_obj = new Date(Number(time_as_str))
    return `${date_as_obj.getHours()}:${date_as_obj.getMinutes() <= 9 ? `0${date_as_obj.getMinutes()}` : date_as_obj.getMinutes()} ${date_as_obj.getDate()}.${date_as_obj.getMonth() + 1}.${date_as_obj.getFullYear()}`
}