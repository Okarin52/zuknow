import { Link } from 'react-router-dom'
import { useQuestionsStore } from '../stores/questionsStore'
import QuestionCard from '../components/QuestionCard'
import './Explanation.css'

const Explanation = () => {
  const { currentQuestion, getRandomQuestion } = useQuestionsStore()

  const handleNextQuestion = () => {
    getRandomQuestion()
  }

  if (!currentQuestion) {
    return (
      <div className="explanation">
        <div className="explanation-empty">
          <h1>💡 解説</h1>
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h2>表示する問題がありません</h2>
            <p>まずクイズを開始して問題を選択してください。</p>
            <div className="empty-actions">
              <Link to="/quiz" className="quiz-btn">
                📝 クイズを開始
              </Link>
              <Link to="/list" className="list-btn">
                📋 問題一覧
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="explanation">
      <header className="explanation-header">
        <h1>💡 解説</h1>
        <div className="explanation-controls">
          <button
            onClick={handleNextQuestion}
            className="next-question-btn"
            title="別の問題をランダム選択"
          >
            🎲 別の問題
          </button>
          <Link to="/quiz" className="quiz-btn">
            📝 クイズモード
          </Link>
          <Link to="/list" className="list-btn">
            📋 問題一覧
          </Link>
        </div>
      </header>

      <div className="explanation-content">
        <QuestionCard
          question={currentQuestion}
          showAnswer={true}
          showExplanation={true}
          className="explanation-question"
        />

        <div className="explanation-details">
          <div className="detail-section">
            <h3>📊 問題の詳細情報</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">カテゴリ:</span>
                <span className="detail-value">
                  {currentQuestion.category || '未分類'}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">難易度:</span>
                <span className={`detail-value difficulty-${currentQuestion.difficulty || 'unspecified'}`}>
                  {currentQuestion.difficulty === 'easy' ? '初級' :
                   currentQuestion.difficulty === 'medium' ? '中級' :
                   currentQuestion.difficulty === 'hard' ? '上級' : '未設定'}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">作成日:</span>
                <span className="detail-value">
                  {new Date(currentQuestion.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {currentQuestion.updatedAt.getTime() !== currentQuestion.createdAt.getTime() && (
                <div className="detail-item">
                  <span className="detail-label">更新日:</span>
                  <span className="detail-value">
                    {new Date(currentQuestion.updatedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {currentQuestion.tags && currentQuestion.tags.length > 0 && (
            <div className="detail-section">
              <h3>🏷️ タグ</h3>
              <div className="tags-display">
                {currentQuestion.tags.map((tag, index) => (
                  <span key={index} className="tag-item">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="explanation-actions">
          <Link
            to={`/edit/${currentQuestion.id}`}
            className="edit-btn"
          >
            ✏️ この問題を編集
          </Link>

          <button
            onClick={handleNextQuestion}
            className="random-btn"
          >
            🎲 ランダムな問題
          </button>
        </div>
      </div>
    </div>
  )
}

export default Explanation
