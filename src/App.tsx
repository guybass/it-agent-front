import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/auth'
import { Layout } from '@/components/Layout'
import { ManagerDashboard } from '@/pages/ManagerDashboard'
import { ITDashboard } from '@/pages/ITDashboard'
import { OnboardWizard } from '@/pages/OnboardWizard'
import { TicketsPage } from '@/pages/Tickets'
import { EmployeeDetail } from '@/pages/EmployeeDetail'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<ManagerDashboard />} />
            <Route path="/onboard" element={<OnboardWizard />} />
            <Route path="/it" element={<ITDashboard />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/employees/:email" element={<EmployeeDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
