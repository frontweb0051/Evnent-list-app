import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router"
import { getParticipant, cancelParticipant } from "@/api/events";
import { ApiError } from "@/api/error"
import type { ParticipantInfo } from "@/types/event";
import { formatDateJa, formatTimeRange } from "@/lib/format";

type Status = "idle" | "submitting" | "success";


export default function CancelPage() {
  const {token} = useParams();
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");


  const cancelSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") {
      return;
    }

    setStatus("submitting");
    setFormError("");
    try {
      await cancelParticipant(String(token));
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      if (err instanceof ApiError) {
        console.log("キャンセル失敗:", err.status, err.code, err.message, err.fields);
        // ボタンの上に出す、キャンセル失敗のメッセージ(キャンセル済み・開始済みなど)
        setFormError(err.message);
      } else {
        setFormError("通信に失敗しました。時間をおいてもう一度お試しください");
      }
    }
  }

  useEffect(()=>{
    let ignore = false;

    const fetchParticipant = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const data = await getParticipant(String(token));
        if (!ignore) {
          setParticipant(data)
        } 
      } catch (err) {
        console.error(`エラーが発生しました。${err}`);
        if(!ignore) {
          setHasError(true);
        }
      } finally {
        if(!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchParticipant();

    return () => {
      ignore = true
    }
  },[token])

  if (isLoading) {
    return (
      <section className="cancel-page">
        <div className="container">
          <div className="cancel-state-card" role="status" aria-live="polite">
            <span className="cancel-state-mark cancel-state-mark-loading" aria-hidden="true">…</span>
            <h1 className="cancel-state-title">申込情報を確認しています</h1>
            <p className="cancel-state-description">そのまま少しお待ちください。</p>
          </div>
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <CancelState
        eyebrow="TEMPORARY ERROR"
        title="申込情報を確認できませんでした"
        description="通信に失敗しました。時間をおいて、もう一度お試しください。"
      />
    );
  }

  if (participant === null) {
    return (
      <CancelState
        eyebrow="APPLICATION NOT FOUND"
        title="申込情報が見つかりません"
        description="URLが無効か、申込情報が削除されている可能性があります。"
      />
    );
  }

  if (status === "success") {
    return (
      <CancelState
        eyebrow="CANCELLATION COMPLETE"
        title="申込をキャンセルしました"
        description="キャンセル手続きが完了しました。ご利用ありがとうございました。"
        success
      />
    );
  }

  if (participant.status === "cancelled") {
    return (
      <CancelState
        eyebrow="ALREADY CANCELLED"
        title="この申込はキャンセル済みです"
        description="申込はすでにキャンセルされています。イベント一覧から開催予定をご確認いただけます。"
      />
    )
  }

  if (participant.has_started) {
    return (
      <CancelState
        eyebrow="CANCELLATION UNAVAILABLE"
        title="キャンセルできません"
        description="イベントの開始時刻を過ぎているため、この申込はキャンセルできません。"
      />
    )
  }

  return (
    <section className="cancel-page">
      <div className="container">
        <div className="cancel-content">
          <div className="cancel-heading">
            <p className="cancel-eyebrow">CANCEL APPLICATION</p>
            <h1 className="cancel-title">申込内容の確認</h1>
            <p className="cancel-intro">キャンセルする申込が正しいかご確認ください。</p>
          </div>

          <article className="cancel-event-card">
            <p className="cancel-section-label">イベント</p>
            <h2>{participant.title}</h2>
            <dl className="cancel-details">
              <div>
                <dt>開催日時</dt>
                <dd>{formatDateJa(participant.event_date)}　{formatTimeRange(participant.start_time, participant.end_time)}</dd>
              </div>
              <div>
                <dt>開催場所</dt>
                <dd>{participant.venue_name}</dd>
              </div>
            </dl>
          </article>

          <article className="cancel-applicant-card">
            <p className="cancel-section-label">申込内容</p>
            <dl className="cancel-details">
              <div>
                <dt>お名前</dt>
                <dd>{participant.name}</dd>
              </div>
              <div>
                <dt>参加人数</dt>
                <dd>{participant.guests}名</dd>
              </div>
            </dl>
          </article>

          <form className="cancel-actions" onSubmit={cancelSubmit}>
            <p>キャンセルを確定すると、この申込は取り消されます。</p>
            {formError && <p className="cancel-form-error" role="alert">{formError}</p>}
            <button
              type="submit"
              className="btn btn-cancel"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "キャンセル処理中…" : "この申込をキャンセルする"}
            </button>
            <Link to="/" className="cancel-back-link">イベント一覧に戻る</Link>
          </form>
        </div>
      </div>
    </section>
  );
}

type CancelStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  success?: boolean;
};

function CancelState({eyebrow, title, description, success = false}: CancelStateProps) {
  return (
    <section className="cancel-page">
      <div className="container">
        <div className="cancel-state-card">
          <span className={`cancel-state-mark${success ? " cancel-state-mark-success" : ""}`} aria-hidden="true">
            {success ? "✓" : "!"}
          </span>
          <p className="cancel-eyebrow">{eyebrow}</p>
          <h1 className="cancel-state-title">{title}</h1>
          <p className="cancel-state-description">{description}</p>
          <Link to="/" className="btn btn-primary">イベント一覧に戻る</Link>
        </div>
      </div>
    </section>
  );
}
