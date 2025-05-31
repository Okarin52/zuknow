import { Question } from '../types/Question'
import './QuestionCard.css'

interface QuestionCardProps {
  question: Question
  showAnswer?: boolean
  showExplanation?: boolean
  onEdit?: (question: Question) => void
  onDelete?: (question: Question) => void
  className?: string
}

const QuestionCard = ({
  question,
  showAnswer = false,
  showExplanation = false,
  onEdit,
  onDelete,
  className = ''
}: QuestionCardProps) => {
  const getDifficultyClass = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy'
      case 'medium': return 'difficulty-medium'
      case 'hard': return 'difficulty-hard'
      default: return 'difficulty-unspecified'
    }
  }

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '初級'
      case 'medium': return '中級'
      case 'hard': return '上級'
      default: return '未設定'
    }
  }

  return (
    <div className={`question-card ${className}`}>
      <div className="question-header">
        <div className="question-meta">
          {question.category && (
            <span className="category-tag">{question.category}</span>
          )}
          <span className={`difficulty-tag ${getDifficultyClass(question.difficulty)}`}>
            {getDifficultyLabel(question.difficulty)}
          </span>
        </div>
        {(onEdit || onDelete) && (
          <div className="question-actions">
            {onEdit && (
              <button
                className="action-btn edit-btn"
                onClick={() => onEdit(question)}
                title="編集"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                className="action-btn delete-btn"
                onClick={() => onDelete(question)}
                title="削除"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      <div className="question-content">
        <div className="question-text">
          <h3>問題</h3>
          <p>{question.question}</p>
        </div>

        {showAnswer && (
          <div className="answer-section">
            <h4>答え</h4>
            <p className="answer-text">{question.answer}</p>
          </div>
        )}

        {showExplanation && (
          <div className="explanation-section">
            <h4>解説</h4>
            <p className="explanation-text">{question.explanation}</p>
          </div>
        )}
      </div>

      {question.tags && question.tags.length > 0 && (
        <div className="question-tags">
          {question.tags.map((tag, index) => (
            <span key={index} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="question-footer">
        <span className="created-date">
          作成: {new Date(question.createdAt).toLocaleDateString('ja-JP')}
        </span>
        {question.updatedAt.getTime() !== question.createdAt.getTime() && (
          <span className="updated-date">
            更新: {new Date(question.updatedAt).toLocaleDateString('ja-JP')}
          </span>
        )}
      </div>
    </div>
  )
}

export default QuestionCard
