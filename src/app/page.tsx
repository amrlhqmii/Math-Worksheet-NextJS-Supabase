'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from "@/lib/supabaseClient";

type Choice = { key: string; label: string }
type Item = {
  id: string
  prompt: string
  choices: Choice[]
  correctKey: string
}

type HighScore = {
  id: string
  name: string
  score: number
  total: number
  createdAt?: string
}

const WORKSHEET_TITLE = 'Rounding Off to Nearest 10'
const COPYRIGHT_TEXT = `www.mathinenglish.com. © Math in English.`

const PLACEHOLDER_ITEMS: Item[] = [
  {
    id: 'q1',
    prompt: '17 rounded off to the nearest 10 is..',
    choices: [
      { key: 'A', label: '10' },
      { key: 'B', label: '20' },
      { key: 'C', label: '17' },
    ],
    correctKey: 'B'
  },
  {
    id: 'q2',
    prompt: '45 rounded off to the nearest 10 is..',
    choices: [
      { key: 'A', label: '50' },
      { key: 'B', label: '45' },
      { key: 'C', label: '40' },
    ],
    correctKey: 'A',
  },
  {
    id: 'q3',
    prompt: '75 rounded off to the nearest 10 is..',
    choices: [
      { key: 'A', label: '70' },
      { key: 'B', label: '80' },
      { key: 'C', label: '175' },
    ],
    correctKey: 'B',
  },
  {
    id: 'q4',
    prompt: '19 rounded to the nearest 10 is..',
    choices: [
      { key: 'A', label: '20' },
      { key: 'B', label: '10' },
      { key: 'C', label: '19' },
    ],
    correctKey: 'A',
  },

  {
    id: 'q5',
    prompt: '64 rounded off to the nearest 10 is..',
    choices: [
      { key: 'A', label: '64' },
      { key: 'B', label: '70 ' },
      { key: 'C', label: '60' },
    ],
    correctKey: 'C',
  },
  {
    id: 'q6',
    prompt: '0 rounded off to the nearest 10 is..',
    choices: [
      { key: 'A', label: '10' },
      { key: 'B', label: '1' },
      { key: 'C', label: '0' },
    ],
    correctKey: 'C',
  },
  {
    id: 'q7',
    prompt: '98 rounded off to the nearest 10 is..',
    choices: [
      { key: 'A', label: '80' },
      { key: 'B', label: '100' },
      { key: 'C', label: '89' },
    ],
    correctKey: 'B',
  },
  {
    id: 'q8',
    prompt: '199 rounded off to the nearest 10 is...',
    choices: [
      { key: 'A', label: '190' },
      { key: 'B', label: '100' },
      { key: 'C', label: '200' },
    ],
    correctKey: 'C',
  },
  {
    id: 'q9',
    prompt: '94 rounded off to the nearest 10 is..',
    choices: [
      { key: 'A', label: '100' },
      { key: 'B', label: '94 ' },
      { key: 'C', label: '90' },
    ],
    correctKey: 'C',
  },
  {
    id: 'q10',
    prompt: '165 rounded off to the nearest 10 is..',
    choices: [
      { key: 'A', label: '160' },
      { key: 'B', label: '170' },
      { key: 'C', label: '150' },
    ],
    correctKey: 'B',
  },
  {
    id: 'q11',
    prompt: '445 rounded off to the nearest 10 is..',
    choices: [
      { key: 'A', label: '450' },
      { key: 'B', label: '440' },
      { key: 'C', label: '500' },
    ],
    correctKey: 'A',
  },
  {
    id: 'q12',
    prompt: '999 rounded off to the nearest 10 is..',
    choices: [
      { key: 'A', label: '990' },
      { key: 'B', label: '1,000 ' },
      { key: 'C', label: '909' },
    ],
    correctKey: 'B',
  },
];


export default function WorksheetPage() {

  const [name, setName] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [highScores, setHighScores] = useState<HighScore[]>([])

  const items = useMemo(() => PLACEHOLDER_ITEMS, [])
  const total = items.length

  // Load top 10 high scores live
  useEffect(() => {
    const fetchScores = async () => {
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .order("createdAt", { ascending: true })
        .limit(10);

      if (error) console.error("Error fetching scores:", error);
      else setHighScores(data || []);
    };

    fetchScores();
  }, []);

  const handleChoose = (qid: string, key: string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qid]: key }))
  }

  const handleReset = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(null)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setModalMessage("Please enter your name before submitting!")
      setShowModal(true)
      return
    }

    const unanswered = items.filter((it) => !answers[it.id])
    if (unanswered.length > 0) {
      setModalMessage("Please answer all the questions before submitting!")
      setShowModal(true)
      return
    }

    let s = 0
    for (const it of items) {
      if (answers[it.id] === it.correctKey) s += 1
    }
    setScore(s)
    setSubmitted(true)

    try {
      const { error } = await supabase
        .from("scores")
        .insert([
          {
            name: name.trim().slice(0, 40),
            score: s,
            total,
            createdAt: new Date().toISOString(), // Supabase auto-handles timestamptz
          },
        ])

      if (error) {
        console.error("Failed to save score", error)
        setModalMessage("Failed to save your score. Please try again.")
        setShowModal(true)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setModalMessage("Unexpected error occurred!")
      setShowModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-gray-900/90 border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -20, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="w-10 h-10 rounded-2xl grid place-items-center"
            >
              <img
                src="/favicon.ico"
                alt="App Icon"
                className="w-8 h-8"
              />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{WORKSHEET_TITLE}</h1>
              <p className="text-sm text-gray-400 leading-tight">by Math In English</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full sm:w-64 rounded-2xl border border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <motion.button
              onClick={handleReset}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-100 px-4 py-2 shadow-lg transition-colors"
              aria-label="Reset answers"
            >
              Reset
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              aria-label="Submit answers"
            >
              Submit
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-2">

        {/* Instruction */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.02 }}
          className="mx-auto pb-4 pt-2 text-sm text-gray-100 text-center"
        >
          <div className="rounded-2xl border border-gray-700 bg-gray-800/50 backdrop-blur p-4 shadow-lg">
            <h2 className="text-base font-semibold text-white">
              Choose the correct answer
            </h2>
          </div>
        </motion.div>

        {/* Questions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {items.map((item, idx) => {
            const picked = answers[item.id]
            const isCorrect = submitted && picked === item.correctKey
            const isWrong = submitted && picked && picked !== item.correctKey
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 * idx }}
                className="rounded-2xl bg-gray-800/70 backdrop-blur border border-gray-700 shadow-lg p-4 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-wider text-gray-400">Question {idx + 1}</p>
                    <h3 className="text-base font-semibold mt-1 text-white">{item.prompt}</h3>
                  </div>
                  {submitted && (
                    <div className="text-right text-sm">
                      {isCorrect && <span className="inline-block rounded-full bg-green-900/50 border border-green-500 text-green-300 px-3 py-1">Correct</span>}
                      {isWrong && <span className="inline-block rounded-full bg-red-900/50 border border-red-500 text-red-300 px-3 py-1">Wrong</span>}
                    </div>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  {item.choices.map((c) => {
                    const active = answers[item.id] === c.key
                    return (
                      <button
                        key={c.key}
                        onClick={() => handleChoose(item.id, c.key)}
                        className={`text-left rounded-xl border px-3 py-2 transition-all ${
                          active 
                            ? 'border-blue-500 bg-blue-800 text-white shadow-lg' 
                            : 'border-gray-600 bg-gray-800/50 text-gray-100 hover:bg-gray-700/70 hover:border-gray-500'
                        } ${submitted ? 'cursor-not-allowed opacity-60' : ''}`}
                        disabled={submitted}
                        aria-pressed={active}
                        aria-label={`Answer ${c.key}: ${c.label}`}
                      >
                        <span className="font-semibold mr-2 text-gray-300">{c.key}.</span>
                        <span>{c.label}</span>
                      </button>
                    )
                  })}
                </div>

                {submitted && isWrong && (
                  <p className="mt-3 text-sm text-gray-400">
                    Correct answer: <span className="font-semibold text-green-300">{item.correctKey}</span>
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Score*/}
        <AnimatePresence>
          {submitted && score !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700 p-4 shadow-lg"
            >
              <p className="text-lg text-white">
                Score: <span className="font-semibold text-blue-300">{score}</span> / {total}
              </p>
              <p className="text-gray-400 text-sm">{score === total ? 'Perfect!' : score >= Math.ceil(total * 0.75) ? 'Great job!' : 'Keep practicing!'}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* High Scores */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3 text-white">High Scores</h2>
          <div className="rounded-2xl border border-gray-700 bg-gray-800/70 backdrop-blur shadow-lg overflow-hidden">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium bg-gray-700/50 px-4 py-2">
              <div className="col-span-2 text-center text-gray-300">Name</div>
              <div className="col-span-2 text-center text-gray-300">Score</div>
            </div>
            <ul>
              {highScores.length === 0 && (
                <li className="px-4 py-3 text-gray-400 text-sm">No scores yet. Be the first!</li>
              )}
              {highScores.map((row, i) => (
                <li key={row.id} className="grid grid-cols-4 gap-2 px-4 py-2 border-t border-gray-700/50 text-sm hover:bg-gray-700/30 transition-colors">
                  <div className="col-span-2 truncate text-center text-gray-200">{row.name}</div>
                  <div className="col-span-2 text-center text-gray-200">{row.score} / {row.total}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-6 pb-10 pt-6 text-sm text-gray-400 text-center">
        <div className="rounded-2xl border border-gray-700 bg-gray-800/50 backdrop-blur p-4 shadow-lg">
          <p className="leading-relaxed">
            <strong className="text-gray-200">Copyright:</strong>{' '}
            <a
              href="https://www.mathinenglish.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {COPYRIGHT_TEXT}
            </a>
          </p>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl p-6 m-6 max-w-sm text-center">
            <p className="text-gray-100 font-medium">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="rounded-lg mt-4 px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}