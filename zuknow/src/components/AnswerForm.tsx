import { useState } from 'react'
import './AnswerForm.css'

interface AnswerFormProps {
  onSubmit: (answer: string) => void
  onSkip?: () => void
  disabled?: boolean
  placeholder?: string
  correctAnswer?: string
  showResult?: boolean
  isCorrect?: boolean
}

const AnswerForm = ({
  onSubmit,
  onSkip,
  disabled = false,
  placeholder = "答えを入力してください...",
  correctAnswer,
  showResult = false,
  isCorrect
}: AnswerFormProps) => {
  const [userAnswer, setUserAnswer] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userAnswer.trim()) {
      onSubmit(userAnswer.trim())
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    }
  }

  return (
    <div className="answer-form">
      {!showResult ? (
        <form onSubmit={handleSubmit} className="answer-input-form">
          <div className="input-group">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="answer-input"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <div className="form-buttons">
              <button
                type="submit"
                disabled={disabled || !userAnswer.trim()}
                className="submit-btn"
              >
                📝 回答する
              </button>
              {onSkip && (
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={disabled}
                  className="skip-btn"
                >
                  ⏭️ スキップ
                </button>
              )}
            </div>
          </div>
        </form>
      ) : (
        <div className="answer-result">
          <div className={`result-status ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? (
              <div className="result-correct">
                <span className="result-icon">✅</span>
                <span className="result-text">正解です！</span>
              </div>
            ) : (
              <div className="result-incorrect">
                <span className="result-icon">❌</span>
                <span className="result-text">不正解でした</span>
              </div>
            )}
          </div>

          <div className="user-answer-display">
            <h4>あなたの回答:</h4>
            <p className="user-answer">{userAnswer}</p>
          </div>

          {correctAnswer && !isCorrect && (
            <div className="correct-answer-display">
              <h4>正解:</h4>
              <p className="correct-answer">{correctAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AnswerForm
