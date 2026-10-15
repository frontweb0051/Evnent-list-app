function Header () {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="index.html" className="site-logo">
          <span className="logo-dot"></span>EventHub
        </a>
        <nav className="site-nav">
          <a href="index.html" className="nav-link">イベント一覧</a>
          <a href="#" className="nav-link">使い方</a>
          <a href="#" className="nav-cta">イベントを主催する</a>
        </nav>
      </div>
    </header>
  )
}

export default Header