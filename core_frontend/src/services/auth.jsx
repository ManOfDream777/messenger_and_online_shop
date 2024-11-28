import axios from "axios"
import {getCSRFToken} from "./crud";

axios.defaults.withCredentials = true
axios.defaults.validateStatus = status => {
    return status <= 500
}
axios.defaults.headers = {
    'Content-Type': 'application/json',
}

export const checkAuthenticated = async () => {
    return await axios.get('http://127.0.0.1:8000/chat/check_auth/');
}

export const signUp = async (username, password, password2) => {

    return await axios.post('http://127.0.0.1:8000/chat/sign_up/', {
        username: username,
        password: password,
        password2: password2
    },{
        headers: {
            'X-CSRFToken': await getCSRFToken()
        }
    })

}


export const signIn = async (username, password) => {
    return await axios.post('http://127.0.0.1:8000/chat/sign_in/', {
        username: username,
        password: password
    }, {
        headers: {
            'X-CSRFToken': await getCSRFToken()
        }
    })
}

