import {useState} from "react";
import SignIn from "./SignIn";
import styles from "../assets/css/chat.module.css"
import SignUp from "./SignUp";


function ChatAuth() {
    const [action, setAction] = useState('login')

    return (
        <main className={styles.wrapper}>
            <div className={styles.container}>
                {action === 'login' ? <SignIn actionSetter={setAction}/> : <SignUp actionSetter={setAction}/>}
            </div>
        </main>
    )

}

export default ChatAuth