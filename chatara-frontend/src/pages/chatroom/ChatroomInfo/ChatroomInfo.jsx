import { useEffect, useRef, useState } from 'react'
import { useChatroom } from '../../../hooks/useChatroom'
import style from './ChatroomInfo.module.css'
import chatroomImage from '/icons/pfp.svg'

export default function ChatroomInfo() {
    const { chatroomInfoStyle, chatroomInfoHeaderStyle, chatroomImageStyle, chatroomInfoOptionsStyle, changeChatroomNameStyle, changeThemeStyle,
        seeMembersStyle, leaveChatroomStyle
    } = style
    const { chatroom, members, leaveChatroom } = useChatroom()
    const chatroomNameRef = useRef(null)
    const [isChangingChatroomName, setIsChangingChatroomName] = useState(false)
    const [isViewingMembers, setIsViewingMembers] = useState(false)
    const [isLeavingChatroom, setIsLeavingChatroom] = useState(false)
    const [newChatroomName, setNewChatroomName] = useState(chatroom?.name)

    useEffect(() => {
        chatroomNameRef?.current?.focus()
    }, [isChangingChatroomName])

    async function handleChatroomNameChange(e) {
        e.preventDefault()
        if (newChatroomName === chatroom?.name) return
    }

    console.log('members', members)

    return (
        <div className={chatroomInfoStyle}>
            <div className={chatroomInfoHeaderStyle}>
                <div className={chatroomImageStyle}>
                    <img src={chatroomImage} alt='Chatroom Image' />
                </div>
                {
                    isChangingChatroomName
                        ? <form onSubmit={handleChatroomNameChange}>
                            <input type='text' autoComplete='off' value={newChatroomName} onChange={(e) => { setNewChatroomName(e.target.value) }} ref={chatroomNameRef} />
                            <input type='button' value={'x'} onClick={() => setIsChangingChatroomName(false)} />
                            <input type='submit' value={'✓'} />
                        </form>
                        : <p>{chatroom?.name}</p>
                }
            </div>
            <div className={chatroomInfoOptionsStyle}>
                <div className={changeChatroomNameStyle} onClick={() => { setIsChangingChatroomName(true) }}>
                    <p>Change Chatroom Name</p>
                </div>
                <div className={changeThemeStyle}>
                    <p>Change Theme</p>
                </div>
                <div className={seeMembersStyle} onClick={() => setIsViewingMembers(!isViewingMembers)}>
                    <p>See Members</p>
                </div>
                {isViewingMembers &&
                    <div>
                        {members && members?.length !== 0 && members?.map(member =>
                            <div key={member?.id}>
                                {member?.username}
                            </div>
                        )
                        }
                    </div>}
                <div className={leaveChatroomStyle} onClick={() => setIsLeavingChatroom(true)}>
                    <p>Leave Chatroom</p>
                </div>
            </div>
            {isLeavingChatroom &&
                <div>
                    <p>Are you sure you want to leave the chatroom?</p>
                    <div>
                        <button onClick={leaveChatroom}>Leave</button>
                        <button onClick={() => setIsLeavingChatroom(false)}>Cancel</button>
                    </div>
                </div>
            }
        </div>
    )
}