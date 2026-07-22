import { useRef } from 'react'
import style from './SearchChatroom.module.css'
import searchIcon from '/icons/search-icon.svg'
export default function SearchChatroom({ searchedChatroom, setSearchedChatroom }) {
    const { searchChatroomStyle, searchImageContainer, searchInputStyle } = style
    const searchbarRef = useRef(null)

    return (
        <div className={searchChatroomStyle}>
            <div className={searchImageContainer} onClick={() => searchbarRef?.current?.focus()}>
                <img src={searchIcon} alt="Search Icon" />
            </div>
            <input className={searchInputStyle} type="text" placeholder='Search chatroom...' value={searchedChatroom} onChange={(e) => setSearchedChatroom(e.target.value)} ref={searchbarRef} />
        </div>
    )
}