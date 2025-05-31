import { Link, useLocation } from 'react-router-dom'
import { useQuestionsStore } from '../stores/questionsStore'
import './Navigation.css'

const Navigation = () => {
  const location = useLocation()
  const { getStatistics } = useQuestionsStore()
  const stats = getStatistics()

  const isActive = (path: string) => {
    return location.pathname === path ||
           (path === '/' && location.pathname === '/') ||
           (path !== '/' && location.pathname.startsWith(path))
  }

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>ZuKnow</h1>
        <span className="nav-subtitle">{stats.total}問の知識データベース</span>
      </div>

      <ul className="nav-links">
        <li>
          <Link
            to="/"
            className={`nav-link ${isActive('/') && !isActive('/quiz') && !isActive('/list') && !isActive('/explanation') ? 'active' : ''}`}
          >
            🏠 ホーム
          </Link>
        </li>
        <li>
          <Link
            to="/quiz"
            className={`nav-link ${isActive('/quiz') ? 'active' : ''}`}
          >
            📝 クイズ
          </Link>
        </li>
        <li>
          <Link
            to="/list"
            className={`nav-link ${isActive('/list') ? 'active' : ''}`}
          >
            📋 問題一覧
          </Link>
        </li>
        <li>
          <Link
            to="/edit"
            className={`nav-link ${isActive('/edit') ? 'active' : ''}`}
          >
            ➕ 問題作成
          </Link>
        </li>
      </ul>

      <div className="nav-stats">
        <div className="stat-item">
          <span className="stat-label">カテゴリ:</span>
          <span className="stat-value">{stats.categories}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">タグ:</span>
          <span className="stat-value">{stats.tags}</span>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
