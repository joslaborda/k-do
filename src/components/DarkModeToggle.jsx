import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/components/hooks/useDarkMode';

/**
 * Kōdo DarkModeToggle — switch inline para Settings
 * Renderiza un toggle pill con Moon/Sun según el estado
 */
export default function DarkModeToggle() {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        width: 52,
        height: 28,
        borderRadius: 14,
        background: isDark ? '#c2410c' : '#e2ddd7',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px',
        justifyContent: isDark ? 'flex-end' : 'flex-start',
      }}
    >
      <span style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }}>
        {isDark
          ? <Moon size={11} strokeWidth={2} color="#c2410c" />
          : <Sun size={11} strokeWidth={2} color="#9a9490" />
        }
      </span>
    </button>
  );
}
