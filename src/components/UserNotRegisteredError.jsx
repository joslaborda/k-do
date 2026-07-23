import React from 'react';
import { useTranslation } from 'react-i18next';

// Antes: componente entero en inglés fijo (sin useTranslation) y fondo
// bg-gradient-to-b from-white to-slate-50 hardcodeado — se veía siempre en
// inglés sin importar el idioma de la app, y el gradiente claro fijo rompía
// en dark mode. Pantalla real y alcanzable (App.jsx la muestra cuando el
// login funciona pero el usuario no está registrado) — auditoría v2, 1.5/1.6.
const UserNotRegisteredError = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg border border-border">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-100 dark:bg-orange-950/30">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">{t('notRegistered.title')}</h1>
          <p className="text-foreground mb-8">
            {t('notRegistered.body')}
          </p>
          <div className="p-4 bg-secondary rounded-md text-sm text-foreground">
            <p>{t('notRegistered.helpTitle')}</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{t('notRegistered.help1')}</li>
              <li>{t('notRegistered.help2')}</li>
              <li>{t('notRegistered.help3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;
