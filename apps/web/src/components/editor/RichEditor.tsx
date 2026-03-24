'use client'

import { useEffect, useRef, useCallback } from 'react'
import styles from './RichEditor.module.css'

interface Props {
  value: string       // HTML
  onChange: (html: string) => void
  placeholder?: string
}

const TOOLS = [
  { cmd: 'bold',          icon: 'B',   title: 'Gras',         style: { fontWeight: 700 } },
  { cmd: 'italic',        icon: 'I',   title: 'Italique',     style: { fontStyle: 'italic' } },
  { cmd: 'underline',     icon: 'U',   title: 'Souligné',     style: { textDecoration: 'underline' } },
  { cmd: 'strikeThrough', icon: 'S̶',   title: 'Barré',        style: { textDecoration: 'line-through' } },
] as const

const HEADINGS = [
  { label: 'Titre 1',  tag: 'h1' },
  { label: 'Titre 2',  tag: 'h2' },
  { label: 'Titre 3',  tag: 'h3' },
  { label: 'Normale',  tag: 'p'  },
] as const

const LISTS = [
  { cmd: 'insertUnorderedList', icon: '≡', title: 'Liste à puces' },
  { cmd: 'insertOrderedList',   icon: '1.', title: 'Liste numérotée' },
] as const

const ALIGNS = [
  { cmd: 'justifyLeft',   icon: '⬅',  title: 'Gauche' },
  { cmd: 'justifyCenter', icon: '☰',  title: 'Centre' },
  { cmd: 'justifyRight',  icon: '➡', title: 'Droite' },
] as const

export default function RichEditor({ value, onChange, placeholder = 'Rédigez la description du produit…' }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)

  // Init content
  useEffect(() => {
    if (!editorRef.current) return
    if (editorRef.current.innerHTML !== value) {
      isInternalChange.current = true
      editorRef.current.innerHTML = value || ''
      isInternalChange.current = false
    }
  }, [value])

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }, [onChange])

  const handleInput = useCallback(() => {
    if (!editorRef.current || isInternalChange.current) return
    onChange(editorRef.current.innerHTML)
  }, [onChange])

  const applyHeading = useCallback((tag: string) => {
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, tag)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      exec('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;')
    }
    // Ctrl/Cmd shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); exec('bold') }
      if (e.key === 'i') { e.preventDefault(); exec('italic') }
      if (e.key === 'u') { e.preventDefault(); exec('underline') }
    }
  }, [exec])

  return (
    <div className={styles.wrap}>
      {/* Toolbar */}
      <div className={styles.toolbar}>

        {/* Heading selector */}
        <select
          className={styles.select}
          onChange={e => applyHeading(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Paragraphe</option>
          {HEADINGS.map(h => (
            <option key={h.tag} value={h.tag}>{h.label}</option>
          ))}
        </select>

        <div className={styles.sep} />

        {/* Format buttons */}
        {TOOLS.map(t => (
          <button
            key={t.cmd}
            type="button"
            title={t.title}
            className={styles.btn}
            style={t.style as React.CSSProperties}
            onMouseDown={e => { e.preventDefault(); exec(t.cmd) }}
          >
            {t.icon}
          </button>
        ))}

        <div className={styles.sep} />

        {/* Lists */}
        {LISTS.map(l => (
          <button
            key={l.cmd}
            type="button"
            title={l.title}
            className={styles.btn}
            onMouseDown={e => { e.preventDefault(); exec(l.cmd) }}
          >
            {l.icon}
          </button>
        ))}

        <div className={styles.sep} />

        {/* Alignment */}
        {ALIGNS.map(a => (
          <button
            key={a.cmd}
            type="button"
            title={a.title}
            className={styles.btn}
            onMouseDown={e => { e.preventDefault(); exec(a.cmd) }}
          >
            {a.icon}
          </button>
        ))}

        <div className={styles.sep} />

        {/* Link */}
        <button
          type="button"
          title="Insérer un lien"
          className={styles.btn}
          onMouseDown={e => {
            e.preventDefault()
            const url = prompt('URL du lien :')
            if (url) exec('createLink', url)
          }}
        >
          🔗
        </button>

        {/* Unlink */}
        <button
          type="button"
          title="Supprimer le lien"
          className={styles.btn}
          onMouseDown={e => { e.preventDefault(); exec('unlink') }}
        >
          ✂
        </button>

        <div className={styles.sep} />

        {/* Clear */}
        <button
          type="button"
          title="Effacer la mise en forme"
          className={`${styles.btn} ${styles.btnClear}`}
          onMouseDown={e => { e.preventDefault(); exec('removeFormat') }}
        >
          Tx
        </button>
      </div>

      {/* Editor area — fond blanc, texte noir */}
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        spellCheck
      />
    </div>
  )
}
