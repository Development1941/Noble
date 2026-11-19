import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FormalReviewModal } from './components/FormalReviewModal'
import { Layout } from './components/Layout'
import { MilestoneSheet } from './components/MilestoneSheet'
import { ProjectProvider, useProjects } from './context/ProjectContext'
import { CalendarPage } from './pages/CalendarPage'
import { PipelinePage } from './pages/PipelinePage'

function Modals() {
  const { modalMode } = useProjects()
  if (modalMode === 'plan') return <MilestoneSheet />
  if (modalMode === 'review') return <FormalReviewModal />
  return null
}

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<PipelinePage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Modals />
      </BrowserRouter>
    </ProjectProvider>
  )
}
