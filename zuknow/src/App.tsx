import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useQuestionsStore } from './stores/questionsStore'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Explanation from './pages/Explanation'
import List from './pages/List'
import EditQuestion from './pages/EditQuestion'
import './App.css'

function App() {
  const loadQuestions = useQuestionsStore(state => state.loadQuestions)

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/explanation" element={<Explanation />} />
          <Route path="/list" element={<List />} />
          <Route path="/edit/:id?" element={<EditQuestion />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
