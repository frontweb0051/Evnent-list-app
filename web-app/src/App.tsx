import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "@/components/Layout";
import EventListPage from "@/pages/EventListPage";
import EventDetailPage from "@/pages/EventDetailPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import CancelPage from "@/pages/CancelPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { AuthProvider } from '@/contexts/AuthContext'
import '@/assets/App.css';


export default function App () {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout/>}>
            <Route path="/" element={<EventListPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/paraticipant/:token" element={<CancelPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
