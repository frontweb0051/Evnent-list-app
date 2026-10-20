import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "@/components/Layout";
import EventListPage from "@/pages/EventListPage";
import EventDetailPage from "@/pages/EventDetailPage";
import CancelPage from "@/pages/CancelPage";
import NotFoundPage from "@/pages/NotFoundPage";
import '@/assets/App.css';


export default function App () {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<EventListPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/paraticipant/:token" element={<CancelPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
