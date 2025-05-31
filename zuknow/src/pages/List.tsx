import { useState, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuestionsStore } from '../stores/questionsStore'
import { Question } from '../types/Question'
import QuestionCard from '../components/QuestionCard'
import './List.css'

const List = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    questions,
    removeQuestion,
    setCurrentQuestion,
    getStatistics,
    searchQuestions,
    getQuestionsByDifficulty,
    exportToJSON,
    importFromJSON,
    importFromCSV,
    clearAllQuestions
  } = useQuestionsStore()

  const stats = getStatistics()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'category' | 'difficulty'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const filteredQuestions = useMemo(() => {
    let filtered = questions

    // 検索フィルタ
    if (searchTerm) {
      filtered = searchQuestions(searchTerm)
    }

    // カテゴリフィルタ
    if (selectedCategory) {
      filtered = filtered.filter(q => q.category === selectedCategory)
    }

    // タグフィルタ
    if (selectedTag) {
      filtered = filtered.filter(q => q.tags?.includes(selectedTag))
    }

    // 難易度フィルタ
    if (selectedDifficulty) {
      filtered = getQuestionsByDifficulty(selectedDifficulty as 'easy' | 'medium' | 'hard')
        .filter(q =>
          (!searchTerm || searchQuestions(searchTerm).includes(q)) &&
          (!selectedCategory || q.category === selectedCategory) &&
          (!selectedTag || q.tags?.includes(selectedTag))
        )
    }

    // ソート
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'createdAt':
        case 'updatedAt':
          aValue = new Date(a[sortBy]).getTime()
          bValue = new Date(b[sortBy]).getTime()
          break
        case 'category':
          aValue = a.category || ''
          bValue = b.category || ''
          break
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3, undefined: 4 }
          aValue = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 4
          bValue = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 4
          break
        default:
          aValue = a.createdAt
          bValue = b.createdAt
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [questions, searchTerm, selectedCategory, selectedTag, selectedDifficulty, sortBy, sortOrder, searchQuestions, getQuestionsByDifficulty])

  const handleEdit = (question: Question) => {
    setCurrentQuestion(question)
    navigate(`/edit/${question.id}`)
  }

  const handleDelete = async (question: Question) => {
    if (showDeleteConfirm === question.id) {
      try {
        await removeQuestion(question.id)
        setShowDeleteConfirm(null)
      } catch (error) {
        console.error('Failed to delete question:', error)
      }
    } else {
      setShowDeleteConfirm(question.id)
    }
  }

  const handleViewExplanation = (question: Question) => {
    setCurrentQuestion(question)
    navigate('/explanation')
  }

  const handleStartQuiz = (question: Question) => {
    setCurrentQuestion(question)
    navigate('/quiz')
  }

  const handleExport = async () => {
    try {
      await exportToJSON()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      if (file.name.endsWith('.json')) {
        await importFromJSON(file, false) // merge mode = false (replace)
      } else if (file.name.endsWith('.csv')) {
        await importFromCSV(file, false)
      } else {
        alert('サポートされていないファイル形式です。JSONまたはCSVファイルを選択してください。')
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('インポートに失敗しました。ファイルの形式を確認してください。')
    }

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('すべての問題を削除しますか？この操作は取り消せません。')) {
      try {
        await clearAllQuestions()
      } catch (error) {
        console.error('Failed to clear questions:', error)
      }
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedTag('')
    setSelectedDifficulty('')
    setSortBy('createdAt')
    setSortOrder('desc')
  }

  if (questions.length === 0) {
    return (
      <div className="list">
        <div className="list-empty">
          <h1>📋 問題一覧</h1>
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2>問題がありません</h2>
            <p>問題を作成するか、ファイルからインポートしてください。</p>
            <div className="empty-actions">
              <Link to="/edit" className="create-btn">
                ➕ 問題を作成
              </Link>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="import-btn"
              >
                📁 ファイルをインポート
              </button>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={handleFileImport}
          style={{ display: 'none' }}
        />
      </div>
    )
  }

  return (
    <div className="list">
      <header className="list-header">
        <h1>📋 問題一覧</h1>
        <div className="list-actions">
          <Link to="/edit" className="create-btn">
            ➕ 新規作成
          </Link>
          <button onClick={handleExport} className="export-btn">
            💾 エクスポート
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="import-btn"
          >
            📁 インポート
          </button>
        </div>
      </header>

      <div className="list-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="問題文、答え、解説から検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">すべてのカテゴリ</option>
            {stats.categoriesList.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="filter-select"
          >
            <option value="">すべてのタグ</option>
            {stats.tagsList.map(tag => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="filter-select"
          >
            <option value="">すべての難易度</option>
            <option value="easy">初級</option>
            <option value="medium">中級</option>
            <option value="hard">上級</option>
          </select>

          <button onClick={resetFilters} className="reset-btn">
            🔄 リセット
          </button>
        </div>

        <div className="sort-section">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="sort-select"
          >
            <option value="createdAt">作成日</option>
            <option value="updatedAt">更新日</option>
            <option value="category">カテゴリ</option>
            <option value="difficulty">難易度</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '⬆️ 昇順' : '⬇️ 降順'}
          </button>
        </div>
      </div>

      <div className="list-stats">
        <span className="stats-text">
          {filteredQuestions.length} / {questions.length} 問を表示
        </span>
        {(searchTerm || selectedCategory || selectedTag || selectedDifficulty) && (
          <span className="filter-active">フィルタ適用中</span>
        )}
      </div>

      <div className="questions-grid">
        {filteredQuestions.map(question => (
          <div key={question.id} className="question-item">
            <QuestionCard
              question={question}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            <div className="question-actions">
              <button
                onClick={() => handleStartQuiz(question)}
                className="action-btn quiz-btn"
              >
                📝 クイズ
              </button>
              <button
                onClick={() => handleViewExplanation(question)}
                className="action-btn explanation-btn"
              >
                💡 解説
              </button>
            </div>

            {showDeleteConfirm === question.id && (
              <div className="delete-confirm">
                <p>この問題を削除しますか？</p>
                <div className="confirm-actions">
                  <button
                    onClick={() => handleDelete(question)}
                    className="confirm-delete-btn"
                  >
                    削除
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="cancel-btn"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="list-footer">
        <button
          onClick={handleClearAll}
          className="clear-all-btn"
          disabled={questions.length === 0}
        >
          🗑️ すべて削除
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default List
