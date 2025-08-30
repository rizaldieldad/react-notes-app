import { useState, useEffect } from 'react'
import './App.css'
import { v4 as uuidv4 } from 'uuid'
import { FaTrash, FaHamburger } from 'react-icons/fa'

function App () {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notes, setNotes] = useState(() => {
    const storedNotes = localStorage.getItem('notes')
    let sortedNotes
    if (storedNotes) {
      sortedNotes = JSON.parse(storedNotes).sort((a, b) =>
        b.lastModified.localeCompare(a.lastModified)
      )
    }
    return sortedNotes ?? []
  })
  const [currentNote, setCurrentNote] = useState(null)
  const recentNotes = notes.slice(0, 5)

  useEffect(() => {
    const sortedNotes = notes.sort((a, b) =>
      b.lastModified.localeCompare(a.lastModified)
    )
    localStorage.setItem('notes', JSON.stringify(sortedNotes))
  }, [notes])

  // Auto resize textarea when the currentNote changes
  useEffect(() => {
    const textarea = document.querySelector('textarea')
    if (textarea) {
      // Reset the textarea height to its natural height
      textarea.style.height = 'auto'

      // Set the textarea height to its scroll height => scroll height is total height of the content
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [currentNote])

  const handleNewNote = () => {
    const newNote = {
      id: uuidv4(),
      title: 'Untitled',
      content: '',
      lastModified: new Date().toISOString()
    }

    setCurrentNote(newNote.id)
    setNotes([newNote, ...notes])
    setIsSidebarOpen(false)
  }

  const getCurrentNote = () => {
    const note = notes.find(note => note.id === currentNote)
    return note
  }

  const handleDeleteNote = () => {
    if (window.confirm('Are you sure you want to create a new note?')) {
      // Filter out the note with the current id
      const newNotes = notes.filter(note => note.id !== currentNote)
      setCurrentNote(null)
      setNotes(newNotes)
    }
  }

  const currentNoteObject = getCurrentNote()

  return (
    <main className='flex min-h-screen'>
      {/* sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform bg-white w-64 p-8 space-y-5 transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button (mobile only) */}
        <div className='md:hidden flex justify-end'>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className='p-2 rounded-full bg-transparent border-1 border-black'
          >
            X
          </button>
        </div>
        <h1 onClick={() => setCurrentNote(null)} className='text-2xl font-bold'>
          Not Notion
        </h1>
        <p className='text-sm'>You have {notes.length} notes</p>
        <ul className='sidebar flex flex-col space-y-5 overflow-y-auto max-h-[80vh] pr-2'>
          {notes.length === 0 && (
            <p className='text-zinc-800'>You have no notes</p>
          )}
          {notes.map(note => (
            <li
              onClick={() => {
                setCurrentNote(note.id)
                setIsSidebarOpen(false) // auto close on mobile
              }}
              key={note.id}
              className={`cursor-pointer border-1 border-sky-500 hover:bg-sky-500 hover:text-white p-2 rounded ${
                currentNote === note.id ? 'bg-sky-500 text-white' : ''
              }`}
            >
              {note.title || 'Untitled'}
            </li>
          ))}
        </ul>
      </div>

      {/* editor */}
      <div className='flex flex-col w-full min-h-screen bg-sky-700 p-4 md:p-8'>
        {/* Mobile top bar with hamburger */}
        <div className='md:hidden flex justify-between items-center mb-4'>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className='p-2 bg-sky-500 text-white rounded'
          >
            <FaHamburger size={18} />
          </button>
        </div>

        {/* Note Editor */}
        {currentNote ? (
          <div className='flex flex-col flex-grow bg-gray-100 rounded-md shadow-sm'>
            {/* Header */}
            <div className='flex justify-between items-center p-3 md:p-6 border-b border-gray-200'>
              <input
                className='w-full text-2xl md:text-3xl font-bold focus:outline-none bg-transparent'
                placeholder='Untitled'
                value={currentNoteObject.title}
                onChange={e => {
                  setNotes(
                    notes.map(note =>
                      note.id === currentNote
                        ? {
                            ...note,
                            title: e.target.value,
                            lastModified: new Date().toISOString()
                          }
                        : note
                    )
                  )
                }}
                maxLength={25}
              />

              <button
                onClick={handleDeleteNote}
                className='ml-4 bg-red-700 hover:bg-red-800 text-white font-bold p-2 rounded'
              >
                <FaTrash size={16} />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              className='flex-grow w-full p-4 md:p-6 text-base md:text-lg bg-gray-100 focus:outline-none resize-none overflow-hidden'
              placeholder='Start writing your note...'
              value={currentNoteObject.content}
              onChange={e => {
                setNotes(
                  notes.map(note =>
                    note.id === currentNote
                      ? {
                          ...note,
                          content: e.target.value,
                          lastModified: new Date().toISOString()
                        }
                      : note
                  )
                )

                // Auto resize
                e.target.style.height = 'auto'
                e.target.style.height = `${e.target.scrollHeight}px`
              }}
            />

            {/* Footer */}
            <div className='flex justify-between items-center p-3'>
              <p className='text-slate-600 text-sm md:text-base'>
                Characters count: {currentNoteObject.content.length}
              </p>

              <span className='text-slate-600 text-sm md:text-base'>
                Last modified: {currentNoteObject.lastModified.split('T')[0]}
              </span>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className='flex flex-col flex-grow justify-center items-center space-y-10'>
            <div className='flex flex-col items-center text-center text-white'>
              <h1 className='text-2xl md:text-3xl font-bold'>
                Welcome to Not Notion !
              </h1>
              <p className='mt-2'>
                On this app you can create and manage notes.
              </p>
              <button
                onClick={handleNewNote}
                className='mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              >
                New Note
              </button>
            </div>

            {recentNotes.length > 0 && (
              <div className='flex flex-col w-full max-w-sm text-white text-center'>
                <h2 className='text-lg md:text-xl font-semibold mb-3'>
                  Recent Notes
                </h2>
                <div className='flex flex-col gap-3'>
                  {recentNotes.map(note => (
                    <div
                      key={note.id}
                      className='border-2 border-sky-500 hover:bg-sky-500 hover:text-white p-2 rounded cursor-pointer'
                      onClick={() => setCurrentNote(note.id)}
                    >
                      {note.title || 'Untitled'}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <footer className='absolute bottom-0 text-center py-4 text-white'>
              &copy; 2025 Not Notion App by Eldad R. All rights reserved.
            </footer>
          </div>
        )}
      </div>
    </main>
  )
}

export default App
