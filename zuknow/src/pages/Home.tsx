import { Link } from 'react-router-dom'
import { useQuestionsStore } from '../stores/questionsStore'
import './Home.css'

const Home = () => {
  const { getStatistics, getRandomQuestion } = useQuestionsStore()
  const stats = getStatistics()

  const handleQuickQuiz = () => {
    getRandomQuestion()
  }

  return (
    <div className="home">
      <header className="home-header">
        <h1>ZuKnow へようこそ! 🎓</h1>
        <p className="home-subtitle">
          知識を蓄積し、クイズで学習を深める個人用学習アプリ
        </p>
      </header>

      <div className="home-content">
        <section className="stats-section">
          <h2>📊 学習統計</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">総問題数</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.categories}</div>
              <div className="stat-label">カテゴリ数</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.tags}</div>
              <div className="stat-label">タグ数</div>
            </div>
          </div>

          {stats.total > 0 && (
            <div className="difficulty-breakdown">
              <h3>難易度別内訳</h3>
              <div className="difficulty-stats">
                <div className="difficulty-item easy">
                  <span className="difficulty-label">初級</span>
                  <span className="difficulty-count">{stats.difficulties.easy}問</span>
                </div>
                <div className="difficulty-item medium">
                  <span className="difficulty-label">中級</span>
                  <span className="difficulty-count">{stats.difficulties.medium}問</span>
                </div>
                <div className="difficulty-item hard">
                  <span className="difficulty-label">上級</span>
                  <span className="difficulty-count">{stats.difficulties.hard}問</span>
                </div>
                <div className="difficulty-item unspecified">
                  <span className="difficulty-label">未設定</span>
                  <span className="difficulty-count">{stats.difficulties.unspecified}問</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="actions-section">
          <h2>🚀 今すぐ始める</h2>
          <div className="action-cards">
            {stats.total > 0 ? (
              <>
                <Link to="/quiz" className="action-card primary" onClick={handleQuickQuiz}>
                  <div className="action-icon">🎯</div>
                  <div className="action-content">
                    <h3>クイズを開始</h3>
                    <p>ランダムな問題でクイズに挑戦</p>
                  </div>
                </Link>
                <Link to="/list" className="action-card">
                  <div className="action-icon">📋</div>
                  <div className="action-content">
                    <h3>問題を管理</h3>
                    <p>問題の一覧表示・編集・削除</p>
                  </div>
                </Link>
              </>
            ) : (
              <Link to="/edit" className="action-card primary">
                <div className="action-icon">➕</div>
                <div className="action-content">
                  <h3>最初の問題を作成</h3>
                  <p>学習を始めるために問題を追加しましょう</p>
                </div>
              </Link>
            )}
            <Link to="/edit" className="action-card">
              <div className="action-icon">✏️</div>
              <div className="action-content">
                <h3>新しい問題を作成</h3>
                <p>知識を追加して学習内容を充実</p>
              </div>
            </Link>
          </div>
        </section>

        {stats.categoriesList.length > 0 && (
          <section className="categories-section">
            <h2>📚 カテゴリ一覧</h2>
            <div className="categories-list">
              {stats.categoriesList.map((category, index) => (
                <span key={index} className="category-badge">
                  {category}
                </span>
              ))}
            </div>
          </section>
        )}

        {stats.tagsList.length > 0 && (
          <section className="tags-section">
            <h2>🏷️ タグ一覧</h2>
            <div className="tags-list">
              {stats.tagsList.slice(0, 20).map((tag, index) => (
                <span key={index} className="tag-badge">
                  #{tag}
                </span>
              ))}
              {stats.tagsList.length > 20 && (
                <span className="more-tags">他 {stats.tagsList.length - 20} 個...</span>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default Home
