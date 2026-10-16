import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="container">
      <h1>ページが見つかりません</h1>
      <p>URLが間違っているか、ページが移動した可能性があります。</p>
      <Link to="/">イベント一覧に戻る</Link>
    </div>
  );
}