import { useTranslation } from "../../hooks/useTranslationHook"
import { AVAILABLE_LANGUAGES, useLocaleStore, type LocaleTypes } from "../../stores/store"

const LanguageSwitcher = () => {
  const { lang, setLang } = useLocaleStore()
  const t = useTranslation()

  const handleChange: React.ChangeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.value) {
      setLang(e.target.value as LocaleTypes)
    }
  }

  return (
    <div role="radiogroup" className='flex cursor-pointer border-border border rounded-lg overflow-hidden w-18'>
      {AVAILABLE_LANGUAGES.map((availableLang, idx) => (
        <div key={`${availableLang}-option-${idx}`} className={`font-semibold text-sm w-full border border-transparent hover:border-secondary has-focus:border-secondary ${availableLang === lang ? 'text-theme-radio-text-active bg-theme-radio-bg hover:text-accent has-focus:text-accent' : 'text-theme-radio-text-inactive'} ${idx === 0 ? 'rounded-l-lg' : 'rounded-r-lg'}`}>
          <label htmlFor={`${availableLang}-lang-option`} className='cursor-pointer py-1 text-center block'>{t(`header.settings.lang.${availableLang}`)}</label>
          <input type="radio" checked={availableLang === lang} onChange={handleChange} id={`${availableLang}-lang-option`} name={"language"} value={availableLang} className="sr-only" />
        </div>
      ))}
    </div>
  )
}

export default LanguageSwitcher