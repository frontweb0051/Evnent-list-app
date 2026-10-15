import type { EventSummary, EventDetail } from "@/types/event"

// ? : この値があってもなくても良い
export type EventSearchParams = {
  q? : string;
  from? : string;
}

// EventSearchParams = {} : paramsに値がはいらなかった時、paramsがundefindになってエラーがでるので初期値を空にしておく（値がなくても空文字を返すため）
export async function getEventList(params: EventSearchParams = {}): Promise<EventSummary[]> {
  const search = new URLSearchParams();
  if (params.q) {search.set("q", params.q)}
  if (params.from) {search.set("from", params.from)}
  
  const query = search.toString();
  const query_check = query ? `?${query}` : "";
  const res = await fetch(`/api/events${query_check}`);
  if (!res.ok) {
    throw new Error("記事の取得に失敗しました。");
  }
  // res.json()の返り値はPromiseなのでawaitをつけて返ってきたPromiseの値を取得する処理を追加
  const json = await res.json();
  return json.data;
}

export async function getEvent(id: number): Promise<EventDetail | null> {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) {
    throw new Error("記事の取得に失敗しました。")
  }
  const json = await res.json();
  return json.data;
}

export class ApiError extends Error {
  status: number;
  code: string;
  fields: Record<string, string>;

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export type ApplyInput = {
  name: string;
  email: string;
  guests: number;
  note: string;
  _hp: string;
}

export async function applyToEvent(eventId: number, input: ApplyInput):Promise<void> {
  const res = await fetch(`/api/events/${eventId}/participants`, {
    method: "POST",
    headers: {"Content-Type" : "application/json"},
    body : JSON.stringify(input),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const e = json?.error;
    throw new ApiError(
      res.status,
      e?.code ?? "UNKNOWN",
      e?.message ?? "送信に失敗しました",
      e?.fields ?? {}
    )
  }
}