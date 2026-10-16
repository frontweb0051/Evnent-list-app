import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <section className="not-found-page">
      <div className="container">
        <div className="not-found-card">
          <p className="not-found-code" aria-hidden="true">404</p>
          <p className="not-found-eyebrow">PAGE NOT FOUND</p>
          <h1 className="not-found-title">ページが見つかりません</h1>
          <p className="not-found-description">
            URLが間違っているか、ページが移動した可能性があります。
          </p>
          <Link to="/" className="btn btn-primary not-found-link">
            イベント一覧に戻る
          </Link>
        </div>
      </div>
    </section>
  );
}
