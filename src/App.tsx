import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FormalApprovalModal } from './components/FormalApprovalModal'
import { FormalReviewModal } from './components/FormalReviewModal'
import { Layout } from './components/Layout'
import { MilestoneSheet } from './components/MilestoneSheet'
import { ProjectProvider, useProjects } from './context/ProjectContext'
import { CalendarPage } from './pages/CalendarPage'
import { ExecutionPage } from './pages/ExecutionPage'
import { PipelinePage } from './pages/PipelinePage'

function Modals() {
  const { modalMode } = useProjects()
  if (modalMode === 'plan') return <MilestoneSheet />
  if (modalMode === 'review') return <FormalReviewModal />
  if (modalMode === 'execution') return <FormalApprovalModal />
  return null
}

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<PipelinePage />} />
            <Route path="approval" element={<ExecutionPage />} />
            <Route path="execution" element={<Navigate to="/approval" replace />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Modals />
      </BrowserRouter>
    </ProjectProvider>
  )
}
