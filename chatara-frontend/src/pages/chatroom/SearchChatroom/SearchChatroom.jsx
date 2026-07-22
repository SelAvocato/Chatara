import style from './SearchChatroom.module.css'
export default function SearchChatroom({ searchedChatroom, setSearchedChatroom }) {
    const { searchChatroomStyle } = style
    return (
        <div className={searchChatroomStyle}>
            <input type="text" value={searchedChatroom} onChange={(e) => setSearchedChatroom(e.target.value)} />

        </div>
    )
}