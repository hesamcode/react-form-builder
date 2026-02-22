import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container) {
  if (!container) {
    return []
  }

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
}

export default function DrawerOrSheet({ isOpen, onClose, title, children }) {
  const panelRef = useRef(null)
  const previousFocusedElementRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const frame = window.requestAnimationFrame(() => {
      const focusableElements = getFocusableElements(panelRef.current)

      if (focusableElements.length) {
        focusableElements[0].focus()
      } else {
        panelRef.current?.focus()
      }
    })

    return () => {
      window.cancelAnimationFrame(frame)

      if (previousFocusedElementRef.current) {
        previousFocusedElementRef.current.focus()
      }
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusableElements = getFocusableElements(panelRef.current)

    if (!focusableElements.length) {
      event.preventDefault()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
      return
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-slate-300 bg-white p-4 shadow-2xl outline-none dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <Button
            variant="ghost"
            className="min-h-11 min-w-11"
            aria-label={`Close ${title}`}
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  )
}
