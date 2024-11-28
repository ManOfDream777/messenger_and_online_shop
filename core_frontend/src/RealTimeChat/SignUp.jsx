import styles from "../assets/css/chat.module.css";
import {signIn, signUp} from "../services/auth";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import {SignUpValidator} from "../services/validators";
import {clear_error_msg, handle_errors} from "../services/utils";


function SignUp({actionSetter}) {
    const navigate = useNavigate()

    const handleSubmit = e => {
        e.preventDefault()
        clear_error_msg()
        const send_request = async () => {
            const username = e.target.username.value
            const password = e.target.password.value
            const password2 = e.target.password2.value

            const validator = new SignUpValidator(username, password, password2)

            if (validator.is_valid()) {
                const response = await signUp(username, password, password2)

                if (response.status === 201) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Sign Un successful',
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
                        text: 'Sign Un failed',
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
            }
            handle_errors(validator, e)
        }
        send_request()
    }

    return (
        <div className={styles.sign_up_wrapper}>
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles.input_group}>
                    <label htmlFor={'username'}>Username</label>
                    <input id={'username'} name={'username'} type="text"/>
                    <span error_tag={'form_username'}></span>
                </div>
                <div className={styles.input_group}>
                    <label htmlFor={'password'}>Password</label>
                    <input id={'password'} name={'password'} type="password"/>
                    <span error_tag={'form_password'}></span>
                </div>
                <div className={styles.input_group}>
                    <label htmlFor={'password2'}>Confirm password</label>
                    <input id={'password2'} name={'password2'} type="password"/>
                    <span error_tag={'form_password2'}></span>
                </div>

                <button type="submit">Sign In</button>
            </form>
            <div>
                <span className={styles.switcher} onClick={() => actionSetter('login')}>Or, Sign In</span>
            </div>
        </div>
    )
}

export default SignUp