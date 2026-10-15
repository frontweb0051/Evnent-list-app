import { useState, useEffect } from "react";
import { EventList } from "@/components/EventList";
import { getEventList } from "@/api/event"
import type { EventSearchParams } from "@/api/event"
import Filter from "@/components/Filter";
import type { EventSummary } from "@/types/event"

function Home () {
  const [eventList, setEventList] = useState<EventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  const [params, setParams] = useState<EventSearchParams>({});
  const [totalCount, setTotalCount] = useState(0);

  // 検索条件が変わるたびに記事取得
  useEffect(()=> {
    let ignore = false;

    const fetchEventList = async () => {
      try {
        const response = await getEventList(params);
        if (!ignore) setEventList(response);
        if (!ignore) setIsLoading(true);
      } catch (err) {
        console.error(`エラー：記事が取得できませんでした。${err}`);
      } finally {
        setIsLoading(false);
      }
    }  
    fetchEventList();

    // クリーンアップ関数
    return ()=> {
      ignore = true
    }
  }, [params])

  // 全体の件数: 最初の1回だけ
  useEffect(() => {
    let ignore = false;

    getEventList()
      .then((all) => {
        if (!ignore) setTotalCount(all.length);
      })
      .catch((err) => console.error(`件数を取得できませんでした。${err}`));

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <p className="hero-eyebrow">Engineers' Events</p>
              <h1 className="hero-title">次の一歩は、<em>ここ</em>から。</h1>
              <p className="hero-desc">
                もくもく会・ハンズオン・勉強会を一覧で。参加登録はメールアドレスだけ、30秒で完了します。
              </p>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-n">{ totalCount }</span>
              <span className="hero-stat-l">開催予定のイベント</span>
            </div>
          </div>
        </div>
      </section>

      <Filter onSearch={setParams}/>

      <EventList list={ eventList } />
    </>
  )
}

export default Home