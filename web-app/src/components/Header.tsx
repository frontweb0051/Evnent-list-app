import { Link, useNavigate} from "react-router";
import { type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/api/error";

function Header () {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch(err) {
      if (err instanceof ApiError) {
        alert(err.message);
      } else {
        alert("通信に失敗しました。時間をおいてもう一度お試してください")
      }
    }
  }

  let authArea:ReactNode = null;

  if (!isLoading && user === null) {
    authArea = (
      <div className="header-auth no-user">
        <Link className="header-login" to="/login/">ログイン</Link>
        <Link className="header-register" to="/register/">会員登録</Link>
      </div>
    );
  }
  if (!isLoading && user) {
    authArea = (
      <div className="header-auth user">
        <Link className="header-user-name" to="/mypage">マイページ</Link>
        <button className="header-logout" onClick={handleLogout}>ログアウト</button>
      </div>
    );
  }

  
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="site-logo">
          <span className="logo-dot"></span>EventHub
        </Link>
        <nav className="site-nav" aria-label="メインナビゲーション">
          <Link to="/" className="nav-link">イベント一覧</Link>
          <a href="#" className="nav-link">使い方</a>
          <a href="#" className="nav-cta">イベントを主催する</a>
        </nav>
        {authArea}
      </div>
    </header>
  )
}

export default Header
