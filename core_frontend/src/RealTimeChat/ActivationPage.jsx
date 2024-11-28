import styles from "../assets/css/chat.module.css"
import {useEffect, useState} from "react";
import {activation_page, confirm_activation} from "../services/crud";
import {useNavigate, useParams} from "react-router-dom";
import {Button} from "react-bootstrap";
import {setDialogData} from "../redux_utils/actions";
import {useDispatch} from "react-redux";

function ActivationPage() {
    const [serverResult, setServerResult] = useState('')
    const [showActivate, setShowActivate] = useState(false)
    const dispatch = useDispatch()
    const { encrypted_uuid } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const async_callback = async () => {
            const response = await activation_page(encrypted_uuid)
            if (response.status === 200) {
                setShowActivate(true)
            }else if (response.status === 404){
                setServerResult('Page not found.')
            }else{
                if (response.data.error){
                    setServerResult(response.data.error)
                }else{
                    setServerResult('Unexpected error.')
                }
            }
        }

        async_callback()
    }, []);

    const handleSubmit = e => {
        e.preventDefault()
        const send_request = async () => {
            const response_data = await confirm_activation(encrypted_uuid)
            if (response_data.status){
                setShowActivate(false)
                setServerResult('Activated!')
                const timer = setTimeout(() => {
                    navigate('/c/', {replace: true})
                    clearTimeout(timer)
                }, 3000)
                dispatch(setDialogData(response_data.dialog_info))
            }else{
                setShowActivate(false)
                setServerResult(response_data.error)
            }

        }
        send_request()
    }

    return (
        <div className={`${styles.wrapper} ${styles.pos_center}`}>
            <h1>Activate your dialog link</h1>
            {!showActivate ? <p> {serverResult}</p> : <div>
                <form onSubmit={handleSubmit}>
                    <Button type={'submit'} variant={'primary'}>Click here to activate.</Button>
                </form>
            </div>}
        </div>
    )
}

export default ActivationPage