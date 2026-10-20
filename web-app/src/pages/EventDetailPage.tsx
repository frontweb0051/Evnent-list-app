import { useState, useEffect} from "react"
import { useParams, Link } from "react-router"
import ContactForm from "@/components/ContactForm"
import { getEvent } from "@/api/events"
import { formatDateJa, formatTimeRange } from "@/lib/format"
import { getAvailability } from "@/lib/availability";
import type { EventDetail } from "@/types/event"

export default function EventDetailPage () {
  const { id } = useParams();
  const [eventItem, setEventItem] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const reloadEvent = async () => {
    try {
      const data = await getEvent(Number(id));
      setEventItem(data);
    } catch(err) {
      console.error(`再取得に失敗しました${err}`);
    }
  }

  useEffect(() => {
    // この取得が「古くなった」ときに true にする目印(idが変わったとき等)
    let ignore = false;

    const fetchEventDetail = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const data = await getEvent(Number(id));
        if (!ignore) {
          setEventItem(data);
        }
      } catch (err) {
        console.error(`エラーが発生しました。${err}`);
        if (!ignore) {
          setHasError(true);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchEventDetail();

    // idが変わる前に実行される後片付け
    return () => {
      ignore = true;
    };
  }, [id]);

  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  if (hasError) {
    return <p>読み込みに失敗しました。時間をおいて、もう一度お試しください。</p>;
  }

  if (eventItem === null) {
    return (
      <div className="container">
        <p>イベントが見つかりません。</p>
        <Link to="/">イベント一覧に戻る</Link>
      </div>
    );
  }

  const availability = getAvailability(eventItem.capacity, eventItem.remaining);
  
  return (
    <div className="container">
      <Link to={"/"} className="back-link">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        イベント一覧に戻る
      </Link>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-header">
            <div className="detail-eyebrow">
              <span className="badge badge-amber">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                  <circle cx="5" cy="5" r="4"/>
                </svg>
                { availability.label }
              </span>
            </div>
            <h1 className="detail-title">{eventItem.title}</h1>

            <div className="meta-grid">
              <div className="meta-item">
                <div className="meta-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M7 2v4M13 2v4M3 9h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="meta-lbl">開催日時</div>
                  <div className="meta-val">
                    <span className="meta-val-num">{formatDateJa(eventItem.event_date)}</span><br />
                    {formatTimeRange(eventItem.start_time, eventItem.end_time)}
                  </div>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="10" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/>
                  </svg>
                </div>
                <div>
                  <div className="meta-lbl">開催場所</div>
                  <div className="meta-val">
                    { eventItem.address }<br />
                    <span style={{color: 'var(--text-3)', fontSize: '13px', fontWeight: '400'}}>
                      { eventItem.venue_name }
                    </span>
                  </div>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                    <path d="M10 10m-7 0a7 7 0 1014 0 7 7 0 00-14 0" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M10 7v3.5l2.5 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="meta-lbl">所要時間</div>
                  <div className="meta-val">
                    <span className="meta-val-num">{ eventItem.estimated_time }</span>
                  </div>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                    <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M4 17a6 6 0 0112 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="meta-lbl">参加費</div>
                  <div className="meta-val">
                    <span className="meta-val-num">
                      {/* toLocaleString() : 1000を1,000のようにしてくれる */}
                      { eventItem.participation_fee === 0 ? "参加費無料" : `${eventItem.participation_fee.toLocaleString()}円` }
                      </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cap-wrap">
              <div className="cap-row">
                <span className="cap-lbl">残り枠</span>
                <span className="cap-nums"><strong>{ eventItem.remaining }</strong> / { eventItem.capacity } 名</span>
              </div>
              <div className="cap-track">
                <div className={`cap-fill ${availability.level}`} style={{ width: `${availability.percentFilled}%` }}></div>
              </div>
            </div>
          </div>

          <div className="event-desc">
            <h2>イベント概要</h2>
            <p style={{whiteSpace: "pre-line"}}>{ eventItem.description }</p>
            <h2 style={{marginTop: '24px'}}>当日の持ち物</h2>
            <p>{ eventItem.belongings }</p>
            <h2 style={{marginTop: '24px'}}>注意事項</h2>
            <p>{ eventItem.precautions }</p>
          </div>
        </div>

        <ContactForm 
          contactId={eventItem.id} 
          remaining={eventItem.remaining}
          onApplied={reloadEvent}
        />

      </div>
    </div>
  );
}