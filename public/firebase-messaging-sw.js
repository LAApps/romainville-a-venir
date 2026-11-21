// Service worker Firebase Cloud Messaging : reçoit et affiche les
// notifications quand l'application n'est pas au premier plan. Doit être
// servi depuis la racine du site pour pouvoir intercepter les notifications
// de toute l'application (portée du service worker).
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBVrwfJcOf7rWHDHu_EolAQNdJL-dTZPA8',
  authDomain: 'romainville-a-venir.firebaseapp.com',
  projectId: 'romainville-a-venir',
  storageBucket: 'romainville-a-venir.firebasestorage.app',
  messagingSenderId: '761900560234',
  appId: '1:761900560234:web:d99666829458a1e657bf13',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Romainville à Venir', {
    body: body || '',
    icon: '/icon-192-v3.png',
    badge: '/icon-192-v3.png',
  });
});
