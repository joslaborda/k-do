import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/hooks/useDarkMode';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-24 right-4 md:bottom-4 md:right-4 z-40 rounded-full shadow-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-500" />
      ) : (
        <Moon className="h-5 w-5 text-stone-600" />
      )}
    </Button>
  );
}