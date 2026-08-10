import { useEffect, useRef, useState } from 'react'
import { useChatroom } from '../../../hooks/useChatroom'
import style from './ChatroomInfo.module.css'
import Avatar from '../../../component/Avatar/Avatar'
import ChatroomImageForm from '../../../component/ChatroomImageForm/ChatroomImageForm'
import { useWebsocket } from '../../../hooks/useWebsocket'

export default function ChatroomInfo() {
    const { chatroomInfoStyle, chatroomInfoHeaderStyle, chatroomImageStyle, formStyle, inputRenameChatroomStyle, formActionsStyle, inputCancelRenameStyle,
        inputConfirmRenameStyle, chatroomNameStyle, chatroomInfoOptionsStyle, changeChatroomNameStyle, changeThemeStyle,
        seeMembersStyle, membersContainerStyle, memberContainerStyle, memberPfpContainerStyle, memberInfoStyle, memberNameStyle, memberRoleStyle, leaveChatroomStyle, leaveChatroomButtonStyle,
        leaveConfirmationStyle, leaveActionsStyle, leaveMessageStyle, confirmLeaveStyle, cancelLeaveStyle
    } = style
    const { chatroom, members, leaveChatroom, renameChatroom } = useChatroom()
    const { wsRef } = useWebsocket()
    const chatroomNameRef = useRef(null)
    const [isChangingChatroomName, setIsChangingChatroomName] = useState(false)
    const [isViewingMembers, setIsViewingMembers] = useState(false)
    const [isLeavingChatroom, setIsLeavingChatroom] = useState(false)
    const [newChatroomName, setNewChatroomName] = useState(chatroom?.name)

    useEffect(() => {
        chatroomNameRef?.current?.focus()
    }, [isChangingChatroomName])

    async function handleChatroomRename(e) {
        e.preventDefault()
        const trimmedChatroomName = newChatroomName.trim()
        if (!newChatroomName || trimmedChatroomName === '' || trimmedChatroomName === chatroom?.name) return
        renameChatroom(trimmedChatroomName)
        wsRef?.current?.send(JSON.stringify({ type: 'renameChatroom', id: chatroom?.id, name: trimmedChatroomName }))
        setIsChangingChatroomName(false)
    }

    return (
        <div className={chatroomInfoStyle}>
            <div className={chatroomInfoHeaderStyle}>
                <div className={chatroomImageStyle}>
                    <Avatar src={chatroom.chatroom_img_url || 'https://www.svgrepo.com/show/458220/group.svg'} />
                </div>
                {
                    isChangingChatroomName
                        ? <form className={formStyle} onSubmit={handleChatroomRename}>
                            <input className={inputRenameChatroomStyle} type='text' autoComplete='off' value={newChatroomName} onChange={(e) => { setNewChatroomName(e.target.value) }} ref={chatroomNameRef} />
                            <div className={formActionsStyle}>
                                <input className={inputCancelRenameStyle} type='button' value={'Cancel'} onClick={() => setIsChangingChatroomName(false)} />
                                <input className={inputConfirmRenameStyle} type='submit' value={'Rename'} />
                            </div>
                        </form>
                        : <p className={chatroomNameStyle}>{chatroom?.name}</p>
                }
            </div>
            <div className={chatroomInfoOptionsStyle}>
                <div>
                    <ChatroomImageForm />
                </div>
                <div className={changeChatroomNameStyle} onClick={() => { setIsChangingChatroomName(true) }}>
                    <p>Change Name</p>
                </div>
                <div className={changeThemeStyle}>
                    <p>Change Theme</p>
                </div>
                <div>
                    <p className={seeMembersStyle} onClick={() => setIsViewingMembers(!isViewingMembers)}>{isViewingMembers ? 'Hide Members' : 'Show Members'} </p>
                    {isViewingMembers &&
                        <div className={membersContainerStyle}>
                            {members && members?.length !== 0 && members?.map(member =>
                                <div className={memberContainerStyle} key={member?.id}>
                                    <div className={memberPfpContainerStyle}>
                                        <Avatar src={member.pfp_url} />
                                    </div>
                                    <div className={memberInfoStyle}>
                                        <p className={memberNameStyle}>{member?.username}</p>
                                        <p className={memberRoleStyle}>{chatroom?.creator_id === member?.id ? 'Admin' : 'Member'}</p>
                                    </div>
                                </div>
                            )
                            }
                        </div>}
                </div>

                <div className={leaveChatroomStyle}>
                    <p className={leaveChatroomButtonStyle} onClick={() => setIsLeavingChatroom(true)}>Leave Chatroom</p>
                    {isLeavingChatroom &&
                        <div className={leaveConfirmationStyle}>
                            <p className={leaveMessageStyle}>Are you sure you want to leave the chatroom?</p>
                            <div className={leaveActionsStyle}>
                                <button className={confirmLeaveStyle} onClick={leaveChatroom}>Leave</button>
                                <button className={cancelLeaveStyle} onClick={() => setIsLeavingChatroom(false)}>Cancel</button>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}