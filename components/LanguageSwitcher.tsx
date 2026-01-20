'use client'

import { useStore } from '@/store/useStore'
import { LANGUAGES, type Language } from '@/types'

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useStore()

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Language:
      </span>
      <div className="flex items-center gap-1">
        {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
              ${
                currentLanguage === lang
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }
            `}
            aria-label={`Switch to ${LANGUAGES[lang]}`}
            aria-pressed={currentLanguage === lang}
          >
            {LANGUAGES[lang]}
          </button>
        ))}
      </div>
    </div>
  )
}
