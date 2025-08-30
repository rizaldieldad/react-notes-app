import { useState, useEffect } from 'react'
import './App.css'
import { v4 as uuidv4 } from 'uuid'
import { FaTrash } from 'react-icons/fa'

function App () {
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
      <div className='w-64 p-8 space-y-5'>
        <h1 onClick={() => setCurrentNote(null)} className='text-2xl font-bold'>
          Not Notion
        </h1>
        <p className='text-sm'>You have {notes.length} notes</p>
        <ul className='flex flex-col space-y-5'>
          {notes.length === 0 && (
            <p className='text-zinc-800'>You have no notes</p>
          )}
          {notes.map(note => (
            <li
              onClick={() => setCurrentNote(note.id)}
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
      <div className='flex flex-grow justify-center items-center bg-sky-700 p-8'>
        {currentNote && (
          <div className='flex flex-col w-full h-full bg-gray-100 '>
            <div className='flex justify-between items-center p-6'>
              <input
                className='text-3xl font-bold focus:outline-none'
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
                className='bg-red-800 hover:bg-red-900 text-white font-bold p-2 rounded'
              >
                <FaTrash size={16} />
              </button>
            </div>

            <textarea
              className='h-full flex-grow p-6 text-lg bg-gray-100 focus:outline-none mb-4 resize-none overflow-hidden'
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

                e.target.style.height = 'auto'
                e.target.style.height = `${e.target.scrollHeight}px`
              }}
            />

            <p className='text-slate-600 p-3'>
              Characters count: {currentNoteObject.content.length}
            </p>
          </div>
        )}

        {!currentNote && (
          <div className='flex flex-col space-y-10'>
            <div className='text-center text-white '>
              <h1 className='text-3xl font-bold'>Main Content</h1>
              <p>This is the main content of the page.</p>
              <button
                onClick={handleNewNote}
                className='mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              >
                New Note
              </button>
            </div>

            <div className='flex flex-col text-center text-white'>
              <h2 className='text-xl font-semibold mb-3'>Recent Notes</h2>
              <div className='flex flex-col gap-4'>
                {recentNotes.map(note => (
                  <div
                    key={note.id}
                    className='border-2 border-sky-500 hover:bg-sky-500 hover:text-white p-2 rounded'
                    onClick={() => setCurrentNote(note.id)}
                  >
                    {note.title || 'Untitled'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default App
