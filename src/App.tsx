import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Protected from './components/Protected'
import PublicOnly from './components/PublicOnly'
import { AuthProvider } from './lib/auth'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Register from './pages/Register'
import Spinner from './components/Spinner'

const Plant = lazy(() => import('./pages/Plant'))
const Wellbeing = lazy(() => import('./pages/Wellbeing'))
const Feed = lazy(() => import('./pages/Feed'))
const Profile = lazy(() => import('./pages/Profile'))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
