import { useState } from "react";
import type { EventSearchParams } from "@/api/events"

// onSearch は、EventSearchParams を1つ受け取る関数で、戻り値は使わない(void)
// onSearchの親はsetParams。paramsに入る値はオブジェクト{}なのでparamsの型指定
type FilterProps = {
  onSearch : (params:EventSearchParams) => void;
}

// 引数 : {onSearch : setParams}オブジェクト
// {onSearch} : 分割代入で値を取得
export default function Filter ( {onSearch} : FilterProps ) {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");

  const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch({q: q.trim(), from})
  }

  return (
    <div className="filter-bar">
      <div className="container">
        {/* <form className="filter-form" id="filter-form" onsubmit="return false;"> */}
        <form className="filter-form" onSubmit={handleSubmit}>
          <div className="filter-search-wrap">
            <span className="filter-search-icon">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" stroke-width="1.6"/>
                <path d="M13 13l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
            </span>
            <input
              type="search"
              id="q"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="filter-input"
              placeholder="タイトル・説明で検索"
              maxLength={100}
              autoComplete="off"
              aria-label="キーワード検索"
            />
          </div>
          <div className="filter-sep" aria-hidden="true"></div>
          <span className="filter-label-text">開催日</span>
          <input
            type="date"
            id="from"
            name="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="filter-date"
            aria-label="この日以降のイベントを表示"
          />
          <button type="submit">送信</button>
          <button type="button" className="filter-clear" id="js-clear-btn" style={{display:'none'}} aria-label="フィルターをリセット">
            ✕ リセット
          </button>
        </form>
      </div>
    </div> 
  )
}
