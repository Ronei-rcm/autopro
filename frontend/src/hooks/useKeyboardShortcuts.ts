import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          // Não executar se estiver digitando em um input, textarea ou contenteditable
          const target = event.target as HTMLElement;
          if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
          ) {
            return;
          }

          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Hook para atalhos globais comuns
export const useGlobalShortcuts = () => {
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      action: () => {
        // Focar na busca global
        const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: 'Focar na busca',
    },
    {
      key: 'n',
      ctrl: true,
      action: () => {
        // Encontrar botão "Novo" na página atual
        const newButton = Array.from(document.querySelectorAll('button')).find(
          (btn) => btn.textContent?.includes('Novo') || btn.textContent?.includes('Criar')
        );
        if (newButton) {
          newButton.click();
        }
      },
      description: 'Criar novo item',
    },
  ]);
};
