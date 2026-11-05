import type { User } from "@/types/user";
import { createApiError } from "@/api/error";

export async function getMe():Promise<User | null> {
  const res = await fetch("/api/me", { cache: "no-store" });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error("ユーザー情報の取得に失敗しました。");
  }
  const json = await res.json();
  return json.data;
}

export async function login(email:string, password:string):Promise<User> {
  const data = {
    'email'    : email,
    'password' : password
  }
  const res = await fetch('/api/auth/login',{
    method: 'POST',
    headers: {"Content-Type" : "application/json"},
    body : JSON.stringify(data),  
  })
  if (!res.ok) {
    throw await createApiError(res, "ログインに失敗しました");
  }
  const json = await res.json();
  return json.data;
}

export async function register(name:string, email:string, password: string):Promise<User> {
  const data = {
    'name': name,
    'email': email,
    'password': password
  }
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { "Content-Type" : "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw await createApiError(res, "登録に失敗しました");
  }
  const json = await res.json();
  return json.data;
}

export async function logout():Promise<void> {
  const res = await fetch('/api/auth/logout',{
    method: 'POST',
    headers: { 'Content-Type' : 'application/json' }
  });
  if (!res.ok) {
    throw await createApiError(res, "ログアウトに失敗しました。");
  }
}