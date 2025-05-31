import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuestionsStore } from '../stores/questionsStore'
import QuestionCard from '../components/QuestionCard'
import AnswerForm from '../components/AnswerForm'
import './Quiz.css'

const Quiz = () => {
  const navigate = useNavigate()
  const {
    questions,
    currentQuestion,
    getRandomQuestion
  } = useQuestionsStore()

  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    if (!currentQuestion && questions.length > 0) {
      getRandomQuestion()
    }
  }, [currentQuestion, questions, getRandomQuestion])

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return

    // 簡単な正解判定（大文字小文字無視、前後の空白除去）
    const normalizedUserAnswer = answer.toLowerCase().trim()
    const normalizedCorrectAnswer = currentQuestion.answer.toLowerCase().trim()
    const correct = normalizedUserAnswer === normalizedCorrectAnswer

    setIsCorrect(correct)
    setShowResult(true)
  }

  const handleSkip = () => {
    if (questions.length > 1) {
      getRandomQuestion()
      resetQuizState()
    }
  }

  const handleNext = () => {
    if (questions.length > 1) {
      getRandomQuestion()
      resetQuizState()
    } else {
      navigate('/list')
    }
  }

  const handleShowExplanation = () => {
    setShowExplanation(true)
  }

  const resetQuizState = () => {
    setShowResult(false)
    setIsCorrect(false)
    setShowExplanation(false)
  }

  if (questions.length === 0) {
    return (
      <div className="quiz">
        <div className="quiz-empty">
          <h1>📝 クイズ</h1>
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2>問題がありません</h2>
            <p>クイズを始めるには、まず問題を作成してください。</p>
            <Link to="/edit" className="create-btn">
              ➕ 問題を作成する
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="quiz">
        <div className="quiz-loading">
          <h1>📝 クイズ</h1>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>問題を読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz">
      <header className="quiz-header">
        <h1>📝 クイズ</h1>
        <div className="quiz-controls">
          <button
            onClick={() => getRandomQuestion()}
            className="random-btn"
            title="別の問題をランダム選択"
          >
            🎲 ランダム選択
          </button>
          <Link to="/list" className="list-btn">
            📋 問題一覧
          </Link>
        </div>
      </header>

      <div className="quiz-content">
        <QuestionCard
          question={currentQuestion}
          showAnswer={showResult}
          showExplanation={showExplanation}
          className="quiz-question"
        />

        {!showResult ? (
          <AnswerForm
            onSubmit={handleAnswer}
            onSkip={handleSkip}
            placeholder="答えを入力してください..."
          />
        ) : (
          <div className="quiz-result">
            <AnswerForm
              onSubmit={() => {}}
              disabled={true}
              showResult={true}
              isCorrect={isCorrect}
              correctAnswer={currentQuestion.answer}
            />

            <div className="result-actions">
              {!showExplanation && (
                <button
                  onClick={handleShowExplanation}
                  className="explanation-btn"
                >
                  💡 解説を見る
                </button>
              )}

              <button
                onClick={handleNext}
                className="next-btn primary"
              >
                {questions.length > 1 ? '➡️ 次の問題' : '📋 問題一覧へ'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="quiz-footer">
        <p className="quiz-info">
          問題数: {questions.length}問 |
          カテゴリ: {currentQuestion.category || '未分類'} |
          難易度: {
            currentQuestion.difficulty === 'easy' ? '初級' :
            currentQuestion.difficulty === 'medium' ? '中級' :
            currentQuestion.difficulty === 'hard' ? '上級' : '未設定'
          }
        </p>
      </div>
    </div>
  )
}

export default Quiz
