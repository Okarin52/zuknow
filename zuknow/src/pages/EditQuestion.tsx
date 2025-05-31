import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuestionsStore } from '../stores/questionsStore'
import { QuestionInput } from '../types/Question'
import './EditQuestion.css'

const EditQuestion = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    getQuestion,
    createQuestion,
    updateQuestion,
    loading,
    error,
    clearError,
    getStatistics
  } = useQuestionsStore()

  const stats = getStatistics()
  const isEditing = !!id
  const currentQuestion = id ? getQuestion(id) : null

  const [formData, setFormData] = useState<QuestionInput>({
    question: '',
    answer: '',
    explanation: '',
    category: '',
    tags: [],
    difficulty: undefined
  })

  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Partial<QuestionInput>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isEditing && currentQuestion) {
      setFormData({
        question: currentQuestion.question,
        answer: currentQuestion.answer,
        explanation: currentQuestion.explanation,
        category: currentQuestion.category || '',
        tags: currentQuestion.tags || [],
        difficulty: currentQuestion.difficulty
      })
    }
  }, [isEditing, currentQuestion])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const validateForm = (): boolean => {
    const newErrors: Partial<QuestionInput> = {}

    if (!formData.question.trim()) {
      newErrors.question = '問題文は必須です'
    } else if (formData.question.trim().length < 5) {
      newErrors.question = '問題文は5文字以上で入力してください'
    }

    if (!formData.answer.trim()) {
      newErrors.answer = '答えは必須です'
    } else if (formData.answer.trim().length < 1) {
      newErrors.answer = '答えを入力してください'
    }

    if (!formData.explanation.trim()) {
      newErrors.explanation = '解説は必須です'
    } else if (formData.explanation.trim().length < 10) {
      newErrors.explanation = '解説は10文字以上で入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const questionData: QuestionInput = {
        ...formData,
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        explanation: formData.explanation.trim(),
        category: formData.category?.trim() || undefined,
        tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
        difficulty: formData.difficulty || undefined
      }

      if (isEditing && id) {
        await updateQuestion(id, questionData)
      } else {
        await createQuestion(questionData)
      }

      navigate('/list')
    } catch (error) {
      console.error('Failed to save question:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (
    field: keyof QuestionInput,
    value: string | string[] | undefined
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !(formData.tags || []).includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }))
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleCancel = () => {
    if (window.confirm('編集内容を破棄してよろしいですか？')) {
      navigate('/list')
    }
  }

  if (isEditing && !currentQuestion) {
    return (
      <div className="edit-question">
        <div className="error-state">
          <h1>❌ エラー</h1>
          <p>指定された問題が見つかりません。</p>
          <Link to="/list" className="back-btn">
            📋 問題一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="edit-question">
      <header className="edit-header">
        <h1>
          {isEditing ? '✏️ 問題を編集' : '➕ 新しい問題を作成'}
        </h1>
        <div className="edit-actions">
          <Link to="/list" className="back-btn">
            📋 問題一覧
          </Link>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{error}</span>
          <button onClick={clearError} className="error-close">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="question" className="form-label required">
              問題文
            </label>
            <textarea
              id="question"
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="問題文を入力してください..."
              className={`form-textarea ${errors.question ? 'error' : ''}`}
              rows={4}
              maxLength={500}
            />
            {errors.question && (
              <span className="error-text">{errors.question}</span>
            )}
            <span className="char-count">
              {formData.question.length} / 500
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="answer" className="form-label required">
              答え
            </label>
            <textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => handleInputChange('answer', e.target.value)}
              placeholder="正解を入力してください..."
              className={`form-textarea ${errors.answer ? 'error' : ''}`}
              rows={3}
              maxLength={200}
            />
            {errors.answer && (
              <span className="error-text">{errors.answer}</span>
            )}
            <span className="char-count">
              {formData.answer.length} / 200
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="explanation" className="form-label required">
              解説
            </label>
            <textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              placeholder="解説を入力してください..."
              className={`form-textarea ${errors.explanation ? 'error' : ''}`}
              rows={5}
              maxLength={1000}
            />
            {errors.explanation && (
              <span className="error-text">{errors.explanation}</span>
            )}
            <span className="char-count">
              {formData.explanation.length} / 1000
            </span>
          </div>
        </div>

        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                カテゴリ
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="例: 数学、歴史、プログラミング"
                className="form-input"
                list="categories"
                maxLength={50}
              />
              <datalist id="categories">
                {stats.categoriesList.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty" className="form-label">
                難易度
              </label>
              <select
                id="difficulty"
                value={formData.difficulty || ''}
                onChange={(e) => handleInputChange('difficulty', e.target.value as any)}
                className="form-select"
              >
                <option value="">選択してください</option>
                <option value="easy">初級</option>
                <option value="medium">中級</option>
                <option value="hard">上級</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              タグ
            </label>
            <div className="tags-input-container">
              <div className="tag-input-row">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="タグを入力してEnterキーで追加"
                  className="form-input"
                  list="tags"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || (formData.tags || []).includes(tagInput.trim())}
                  className="add-tag-btn"
                >
                  追加
                </button>
              </div>
              <datalist id="tags">
                {stats.tagsList.map(tag => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
            </div>

            {(formData.tags || []).length > 0 && (
              <div className="tags-display">
                {(formData.tags || []).map((tag, index) => (
                  <span key={index} className="tag-item">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag-btn"
                      title="タグを削除"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-btn"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="submit-btn"
          >
            {isSubmitting || loading ? (
              <>
                <span className="loading-spinner"></span>
                {isEditing ? '更新中...' : '作成中...'}
              </>
            ) : (
              <>
                {isEditing ? '💾 更新' : '➕ 作成'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditQuestion
