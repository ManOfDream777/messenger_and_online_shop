import axios from "axios"
import {
    encrypt_and_set_localstorage_keys, exportKey, setDialogDataInLocalStorage,
} from "./utils";

axios.defaults.withCredentials = true
axios.defaults.validateStatus = status => {
    return status <= 500
}
axios.defaults.headers = {
    'Content-Type': 'application/json',
}

export const getCSRFToken = async () => {
    const response = await axios.options('http://127.0.0.1:8000/chat/get_csrf_token/')
    return response.data.csrf_token
}

export const create_new_chat = async () => {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    )

    const pubKeyJSON = await exportKey(keyPair.publicKey)
    const privateKeyJSON = await exportKey(keyPair.privateKey)

    const data = {
        public_key: pubKeyJSON
    }

    const response = await axios.post('http://127.0.0.1:8000/chat/create_new_chat/', data, {
        headers: {
            'X-CSRFToken': await getCSRFToken()
        }
    })

    if (response.status === 201) {
        const dialog_info = {
            dialog_id: response.data.dialog_id,
            public_key: JSON.parse(pubKeyJSON),
            private_key: JSON.parse(privateKeyJSON),
            companion_public_key: '', // set when exchanging keys
        }
        setDialogDataInLocalStorage(dialog_info)
        encrypt_and_set_localstorage_keys()
        return {response: response.data, dialog_info: dialog_info}
    }
}

export const activation_page = async encrypted_companion_uuid => {
    return await axios.get(`http://127.0.0.1:8000/chat/link/${encrypted_companion_uuid}/`)
}

export const confirm_activation = async encrypted_companion_uuid => {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    )
    const resultJSON = await exportKey(keyPair.publicKey);
    const privateKeyJSON = await exportKey(keyPair.privateKey)

    const data = {
        public_key: resultJSON
    }
    const response = await axios.post(`http://127.0.0.1:8000/chat/link/${encrypted_companion_uuid}/`, data, {
        headers: {
            'X-CSRFToken': await getCSRFToken()
        }
    })
    if (response.status === 200) {

        const dialog_info = {
            dialog_id: response.data.dialog_id,
            public_key: JSON.parse(resultJSON),
            private_key: JSON.parse(privateKeyJSON),
            companion_public_key: JSON.parse(response.data.companion_public_key),
        }
        setDialogDataInLocalStorage(dialog_info)
        encrypt_and_set_localstorage_keys()

        return {status: true, dialog_info: dialog_info}

    }
    return {status: false, error: response.data.error}

}
