import {useRef, useState} from "react";
import styles from "../assets/css/chat.module.css"
import {create_new_chat} from "../services/crud";
import {useDispatch} from "react-redux";
import {setDialogData} from "../redux_utils/actions";
import {Button, ButtonGroup, Dropdown} from "react-bootstrap";

// import QRCode from "react-qr-code";


function CreateNewChat() {
    const [data, setData] = useState({})
    const dispatch = useDispatch()
    const popup = useRef()
    const chat_icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                           className="bi bi-person-plus-fill" viewBox="0 0 16 16">
        <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
        <path fillRule="evenodd"
              d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
    </svg>
    const close_icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                            className="bi bi-x-lg" viewBox="0 0 16 16">
        <path
            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
    </svg>

    const handleClick = e => {
        popup.current.classList.add(styles.visible)
        const create_chat = async () => {
            const response_data = await create_new_chat()
            setData(response_data.response)
            dispatch(setDialogData(response_data.dialog_info))
        }
        create_chat()
    }

    const handleClose = e => {
        popup.current.classList.remove(styles.visible)
    }

    const handleCopyClick = e => {
        e.preventDefault()
        navigator.clipboard.writeText(data.uri)
        e.target.textContent = 'Copied!'
        const timeout = setTimeout(() => {
            e.target.textContent = 'Copy'
            e.target.classList.remove(styles.copied)
            clearTimeout(timeout)
        }, 2000)
        e.target.classList.add(styles.copied)
    }

    return (
        <>
            <div className={styles.create_new_chat}>
                <div onClick={handleClick} className={styles.icon_wrapper}>
                    {chat_icon}
                </div>
                <div ref={popup} className={styles.invitation_link}>
                    <div className={styles.close_button} onClick={handleClose}>{close_icon}</div>

                    <div className={styles.invitation_link_text}>
                        <div className={styles.invitation_link_text_inner}>
                            <h5>Share this link with your friend or family to start conversation:</h5>
                            <Dropdown className="d-inline mx-2" autoClose="outside" as={ButtonGroup}>
                               <Button variant="success">Link</Button>
                                <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={handleCopyClick}>Copy</Dropdown.Item>
                                    <Dropdown.ItemText>Link will be valid until {data.expiration_time}.</Dropdown.ItemText>
                                </Dropdown.Menu>
                            </Dropdown>

                        </div>
                        <p><span style={{color: "red"}}>Attention!</span> This link can be used <span style={{color: "red"}}>only once</span>. To start dialog with another user, you must
                            create new dialog.</p>
                        {/*<div style={{ height: "auto", margin: "0 auto", maxWidth: 64, width: "100%" }}>*/}
                        {/* QR code maybe implemented here, but I've thought this is useless for me. */}
                        {/*<QRCode value={data.uri} viewBox={`0 0 256 256`} size={512}*/}
                        {/*        style={{height: "auto", maxWidth: "100%", width: "100%"}}/>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>

        </>
    )
}

export default CreateNewChat