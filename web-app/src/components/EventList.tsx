import { Link } from "react-router";
import type { EventSummary } from "@/types/event"
import { formatMonthEn, formatDay, formatWeekdayJa, formatTimeRange } from "@/lib/format"
import { getAvailability } from "@/lib/availability";


export const EventList: React.FC<{ list: EventSummary[]}> = ({ list }) => {
  const totalCount = list.length

  return (
    <section className="events-section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">開催予定のイベント</h2>
          <span className="section-count">{totalCount}件</span>
        </div>
        {totalCount === 0 ? (
          <p>概要するイベントがありませんでした。</p>
        ) : (
          <div className="events-grid" id="events-grid">
            {list.map((event) => (
              <EventItem key={event.id} item={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const EventItem: React.FC<{ item: EventSummary }> = ({item}) => {
  const availability = getAvailability(item.capacity, item.remaining);
  let cardClass = "event-card";
  let badgeClass = "badge badge-amber";
  if (availability.isFull) {
    cardClass = "event-card is-Full";
    badgeClass = "badge badge-navy";
  }

  return (
    <article className={cardClass}>
      <Link to={`/events/${item.id}`}>
        <div className="card-top">
          <div className="card-cal">
            <span className="card-cal-mo">{formatMonthEn(item.event_date)}</span>
            <span className="card-cal-d">{formatDay(item.event_date)}</span>
          </div>
          <div className="card-time-block">
            <div className="card-time">{formatTimeRange(item.start_time, item.end_time)}</div>
            <div className="card-dow">{formatWeekdayJa(item.event_date)}</div>
          </div>
          <span className={badgeClass} style={{marginLeft: 'auto'}}>{availability.label}</span>
        </div>
        <div className="card-body">
          <h3 className="card-title">{ item.title }</h3>
          <p className="card-loc">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z" stroke="currentColor" stroke-width="1.6"/>
              <circle cx="10" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/>
            </svg>
            { item.address }
          </p>
        </div>
        <div className="card-foot">
          <div className="card-remaining">
            <span className="remaining-n">{ item.remaining }</span>
            <span className="remaining-label">&thinsp;/ { item.capacity } 枠</span>
          </div>
          <span className="card-arrow" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
      </Link>
    </article>
  )
}

