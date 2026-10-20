export type EventSummary = {
  id: number,
  title: string,
  event_date: string,
  start_time: string,
  end_time: string,
  capacity: number,
  remaining: number,
  address: string,
}

export type EventInfo = {
  eventList: EventSummary[];
  totalCount: number;
}

// 一覧の値と合体させる
export type EventDetail = EventSummary & {
  description: string,
  belongings: string,
  precautions: string,
  venue_name: string,
  estimated_time: string,
  participation_fee: number,
}

export type ParticipantInfo = {
  event_id: number,
  title: string,
  event_date: string,
  start_time: string,
  end_time: string,
  venue_name: string,
  name: string,
  guests: number,
  status: "confirmed" | "cancelled",
  has_started: boolean,
}