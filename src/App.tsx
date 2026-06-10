import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sileo'
import { GuestRoute } from './routes/GuestRoute'
import { AdminRoute } from './routes/AdminRoute'
import { ResetPassword } from './pages/ResetPassword'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Matches the QR the backend generates: APP_URL/shops/:shopId/tables/:tableId */}
          <Route path="/shops/:shopId/tables/:tableId" element={<GuestRoute />} />
          <Route path="/admin/:cafeId/theme" element={<AdminRoute />} />
          {/* Target of the forgot-password email link: APP_URL/reset_password?token=... */}
          <Route path="/reset_password" element={<ResetPassword />} />
          <Route
            path="*"
            element={
              <Navigate
                to="/shops/00000000-0000-4000-8000-000000000001/tables/00000000-0000-4000-8000-000000000002"
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        options={{
          fill: '#111111',
          styles: {
            title: 'text-white!',
            description: 'text-white/75!',
            badge: 'bg-white/20!',
          },
        }}
      />
    </QueryClientProvider>
  )
}
