import { createContext, useCallback, useContext } from 'react';
import { dict } from '../i18n/dict.js';
import { useAuth } from './AuthContext.jsx';

const I18n = createContext({ t: (k) => k, lang: 'en' });
export const useT = () => useContext(I18n);

export function I18nProvider({ children }) {
  const { user } = useAuth();
  const lang = user?.language === 'sw' ? 'sw' : 'en';
  const t = useCallback((k) => dict[lang][k] ?? dict.en[k] ?? k, [lang]);
  return <I18n.Provider value={{ t, lang }}>{children}</I18n.Provider>;
}
