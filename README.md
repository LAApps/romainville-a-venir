# Romainville à Venir — application mobile

Application de l'association **Romainville à Venir**, qui porte l'action de ses 4 élus
d'opposition au conseil municipal (Daouda Gory, Sarah Abada, Amel Bennacef, Franck
Benghanem) et anime la vie de l'association auprès des Romainvillois.

Construite avec [Expo](https://expo.dev) (React Native + TypeScript) : un seul code
source pour iOS, Android **et** le web (page "ajouter à l'écran d'accueil").

## Démarrage rapide (mode démo)

Sans aucune configuration, l'application fonctionne déjà avec du contenu de
démonstration stocké localement (ateliers, actions éducatives, FAQ, articles,
galerie photo...). C'est utile pour visualiser et tester l'app avant de brancher le
vrai backend.

```bash
npm install
npx expo start
```

Scannez le QR code avec l'app **Expo Go** (iOS/Android), ou appuyez sur `w` pour
ouvrir la version web dans le navigateur.

**Mode admin de démonstration** : dans Menu → Espace membre, connectez-vous avec
n'importe quel e-mail et le mot de passe `romainville2026`. Les boutons d'ajout/
modification/suppression apparaissent alors sur chaque rubrique (les changements
restent en mémoire, perdus au rechargement — c'est normal, ils ne sont pas encore
envoyés à un vrai backend).

## Brancher le vrai backend (Firebase)

Pour que les données persistent réellement et que les e-mails (adhésions, questions
citoyennes) partent vraiment à rom1ville.a.venir@gmail.com, il faut configurer un
projet Firebase gratuit. Ces étapes sont à faire une seule fois, par une personne de
l'association (10-15 minutes) :

### 1. Créer le projet Firebase

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com) et
   créez un nouveau projet (ex : `romainville-a-venir`).
2. Dans **Compilation > Authentication**, activez la méthode de connexion
   **E-mail/Mot de passe**, puis créez un compte pour chaque personne qui doit avoir
   accès au mode admin (onglet "Users" → "Add user").
3. Dans **Compilation > Firestore Database**, créez une base (mode production).
4. Dans **Compilation > Storage**, activez le stockage (pour les photos/vidéos).
5. Dans **Paramètres du projet > Vos applications**, ajoutez une application
   **Web** (icône `</>`). Copiez la configuration affichée.

### 2. Configurer l'application

Copiez `.env.example` vers `.env` et collez les valeurs récupérées à l'étape
précédente :

```bash
cp .env.example .env
```

Relancez `npx expo start` — l'app bascule automatiquement en mode réel (plus de
bannière "mode démo").

### 3. Déployer les règles et les Cloud Functions (envoi d'e-mail)

> ⚠️ Les Cloud Functions nécessitent de passer le projet Firebase au forfait
> **Blaze** (paiement à l'usage). Cela reste gratuit pour l'usage d'une petite
> association (le forfait gratuit Spark est largement suffisant en volume, Blaze
> est juste requis techniquement pour pouvoir déployer des fonctions) — une carte
> bancaire est seulement demandée en garantie. C'est à faire dans
> **Paramètres du projet > Forfaits** avant l'étape ci-dessous.

Installez l'outil Firebase CLI si besoin (`npm install -g firebase-tools`), puis :

```bash
firebase login
firebase use --add   # sélectionnez votre projet Firebase
```

**Mot de passe d'application Gmail** (pour que les Cloud Functions puissent envoyer
des e-mails depuis rom1ville.a.venir@gmail.com) :

1. Connectez-vous à ce compte Gmail → [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   (la validation en 2 étapes doit être activée).
2. Créez un mot de passe d'application (nom libre, ex. "Appli Romainville").
3. Enregistrez les secrets dans Firebase :

```bash
firebase functions:secrets:set GMAIL_USER
# → entrez : rom1ville.a.venir@gmail.com
firebase functions:secrets:set GMAIL_APP_PASSWORD
# → entrez le mot de passe d'application généré (16 caractères)
```

Puis déployez tout :

```bash
firebase deploy --only firestore:rules,storage:rules,functions
```

À partir de là, chaque adhésion et chaque question citoyenne envoyée depuis l'app
est à la fois enregistrée dans Firestore (onglets `adhesions` et
`questionsCitoyens`, consultables dans la console Firebase) et envoyée par e-mail à
l'association.

## Mode admin en production

Une fois Firebase configuré, le mode démo disparaît : la connexion dans
Menu → Espace membre utilise les vrais comptes créés à l'étape 1 (Authentication).
Toute personne connectée peut alors ajouter/modifier/supprimer le contenu des
rubriques (Hors les murs, Ateliers participatifs, Actions éducatives, Le coin des
élus, FAQ).

## Les 4 élus (Le coin des élus)

Les noms, rôles et photos des 4 élus sont codés en dur dans
[`lib/content/elus.ts`](lib/content/elus.ts) et les images dans
[`assets/elus/`](assets/elus) — ce sont des informations qui changent rarement.
Pour mettre à jour une photo ou un intitulé, modifiez directement ces fichiers (ou
demandez la modification). Les **articles** publiés dans cette rubrique (actions,
interpellations...), eux, sont entièrement gérables depuis l'app en mode admin.

## Publier l'application sur les stores (plus tard)

Ce projet est prêt pour une publication native via
[EAS Build](https://docs.expo.dev/eas/index.md), qui compile l'app dans le cloud
(pas besoin de Mac ni d'Xcode) :

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform all
```

Il faudra alors un compte développeur Apple (99 $/an) et un compte développeur
Google Play (25 $, paiement unique) — à créer au nom de l'association.

## Structure du projet

```
app/                  Écrans (expo-router : un fichier = une page)
  (tabs)/             Les 5 onglets principaux (Accueil, Programme, Adhésion, Élus, Menu)
  admin/login.tsx     Connexion de l'espace membre
  live.tsx, hors-les-murs.tsx, ateliers.tsx, actions-educatives.tsx, une-question.tsx
components/           Composants réutilisables (UI, formulaires, admin)
lib/
  firebase.ts         Connexion au projet Firebase (via .env)
  theme.ts            Charte graphique (couleurs, typographies)
  auth/               Contexte du mode admin
  data/               Lecture/écriture Firestore avec repli démo automatique
  content/            Contenu éditorial fixe (programme, élus, démo)
  api/submissions.ts  Envoi des formulaires (adhésion, question citoyenne)
functions/            Cloud Functions (envoi d'e-mail via Gmail)
```

## Commandes utiles

```bash
npx expo start           # démarrer l'app (iOS/Android/web)
npx expo start --web     # uniquement le web
npx tsc --noEmit         # vérification des types
npx expo lint            # lint
```
