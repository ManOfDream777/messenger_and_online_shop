import styles from "../assets/css/chat.module.css"
import {checkAuthenticated, signIn} from "../services/auth";
import {useNavigate} from "react-router-dom";
import Swal from "sweetalert2";
import {useEffect} from "react";

function SignIn({actionSetter}) {
    const navigate = useNavigate()

    useEffect(() => {
        const async_callback = async () => {
            const check_authentication = await checkAuthenticated();
            if (check_authentication.status === 200) {
                navigate('/c/', {replace: true})
                return;
            }
        };

        async_callback();
    }, []);

    const handleSubmit = e => {
        e.preventDefault()
        const send_request = async () => {
            const username = e.target.username.value
            const password = e.target.password.value

            const response = await signIn(username, password)

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Sign In successful',
                    showConfirmButton: false,
                    timer: 1500,
                    willClose: () => {
                        navigate('/c/', {replace: true})
                    }
                })
            } else {
                // here should be error validation
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Sign In failed',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        }

        send_request()
    }

    return (
        <div className={styles.sign_in_wrapper}>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles.input_group}>
                    <label htmlFor={'username'}>Username</label>
                    <input id={'username'} name={'username'} type="text"/>
                </div>
                <div className={styles.input_group}>
                    <label htmlFor={'password'}>Password</label>
                    <input id={'password'} name={'password'} type="password"/>
                </div>

                <button type="submit">Sign In</button>
            </form>
            <div>
                <span className={styles.switcher} onClick={() => actionSetter('signup')}>Or, Sign Up</span>
            </div>
        </div>
    )

}

export default SignIn