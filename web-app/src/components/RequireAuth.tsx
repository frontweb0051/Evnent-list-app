import { useAuth } from "@/contexts/AuthContext";
import { Outlet, Navigate } from "react-router";

export default function RequireAuth(){
  const { isLoading, user } = useAuth();
  if (isLoading) return null;
  if (user === null) {
    return <Navigate to="/login" replace/>
  }
  return <Outlet/>
}