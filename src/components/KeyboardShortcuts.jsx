import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function KeyboardShortcuts({ onNewNote }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+N - Nueva nota rápida
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        onNewNote?.();
      }

      // Cmd/Ctrl+K - Búsqueda (ir al home)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate(createPageUrl('Home'));
        // Focus en el search input del home
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="Buscar"]');
          searchInput?.focus();
        }, 100);
      }

      // Alt+1 a Alt+8 - Navegación rápida
      if (e.altKey && e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const pages = ['Home', 'Cities', 'Calendar', 'Restaurants', 'Expenses', 'Diary', 'Packing', 'Utilities'];
        const pageIndex = parseInt(e.key) - 1;
        navigate(createPageUrl(pages[pageIndex]));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onNewNote]);

  return null;
}