import type { EventSummary, EventDetail, ParticipantInfo } from "@/types/event"
import { createApiError } from "@/api/error";

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
    throw new Error("イベントの取得に失敗しました。");
  }
  // res.json()の返り値はPromiseなのでawaitをつけて返ってきたPromiseの値を取得する処理を追加
  const json = await res.json();
  return json.data;
}

export async function getEvent(id: number): Promise<EventDetail | null> {
  const res = await fetch(`/api/events/${id}`);

  // 存在しないイベントは、エラーではなく null として返す
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("イベントの取得に失敗しました。")
  }
  const json = await res.json();
  return json.data;
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
    throw await createApiError(res, "通信に失敗しました");
  }
}

export async function getParticipant(token: string): Promise<ParticipantInfo | null> {
  const res = await fetch(`/api/participants/${token}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("申込みの取得に失敗しました");
  }
  const json = await res.json();
  return json.data;
}


export async function cancelParticipant(token:string): Promise<void> {
  const res = await fetch(`/api/participants/${token}/cancel`, {
    method: 'POST',
  });

  if (!res.ok) {
    throw await createApiError(res, "送信に失敗しました");
  }
}
