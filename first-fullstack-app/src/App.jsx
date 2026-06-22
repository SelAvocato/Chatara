import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext.jsx'
import Login from './pages/login/Login.jsx'
import Signup from './pages/signup/Signup.jsx'
import Layout from './layout/Layout.jsx'
import Chatroom from './pages/chatroom/Chatroom.jsx'
import { WebSocketProvider } from './context/WebSocketContext.jsx'

export default function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path='/' element={
                <WebSocketProvider>
                  <Chatroom />
                </WebSocketProvider>}
              />
            </Route>

            <Route path='/*' element={<h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>404 NOT FOUND</h1>} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}