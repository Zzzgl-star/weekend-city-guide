import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Explore from './pages/Explore'
import ActivityDetail from './pages/ActivityDetail'
import Teams from './pages/Teams'
import CheckinPage from './pages/CheckinPage'
import CheckinForm from './pages/CheckinForm'
import GuideNew from './pages/GuideNew'
import Profile from './pages/Profile'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/checkin" element={<CheckinPage />} />
          <Route path="/checkin/new" element={<CheckinForm />} />
          <Route path="/guide/new" element={<GuideNew />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
