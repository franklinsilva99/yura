import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Protected from './components/Protected'
import PublicOnly from './components/PublicOnly'
import { AuthProvider } from './lib/auth'
import Feed from './pages/Feed'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Plant from './pages/Plant'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Wellbeing from './pages/Wellbeing'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
          </Route>
          <Route element={<Protected />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/planta" replace />} />
              <Route path="/planta" element={<Plant />} />
              <Route path="/bienestar" element={<Wellbeing />} />
              <Route path="/comunidad" element={<Feed />} />
              <Route path="/u/:username" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
