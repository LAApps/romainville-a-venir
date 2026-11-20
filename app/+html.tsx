import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Document HTML racine pour l'export web — sans ça, Safari iOS n'a ni titre
// ni icône "apple-touch-icon" et génère une icône par défaut (une lettre sur
// fond uni) quand on fait "Sur l'écran d'accueil" au lieu du vrai logo.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Romainville à Venir</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-v3.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1B4965" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Romainville à Venir" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
