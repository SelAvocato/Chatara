import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext.jsx'
import { WebSocketProvider } from './context/WebSocketContext.jsx'
import { ChatroomProvider } from './context/ChatroomContext.jsx'
import Login from './pages/auth/login/Login.jsx'
import Signup from './pages/auth/signup/Signup.jsx'
import Layout from './layout/Layout.jsx'
import Chatroom from './pages/chatroom/Chatroom.jsx'
import ProtectedAuth from './pages/auth/ProtectedAuth.jsx'

export default function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path='/' element={
                <ChatroomProvider>
                  <WebSocketProvider>
                    <Chatroom />
                  </WebSocketProvider>
                </ChatroomProvider>
              }
              />
            </Route>

            <Route path='/*' element={<h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>404 NOT FOUND</h1>} />
            <Route element={<ProtectedAuth />}>
              <Route path='/login' element={<Login />} />
              <Route path='/signup' element={<Signup />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}