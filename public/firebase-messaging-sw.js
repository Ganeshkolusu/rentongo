/* eslint-disable no-restricted-globals */
/* global firebase, self */
/* eslint-env serviceworker */
// // firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB_32kh2o6DdBVVvLFFBUdMnTbPWWYp4z8",
  authDomain: "rentongovehicle-7e6c0.firebaseapp.com",
  projectId: "rentongovehicle-7e6c0",
  storageBucket: "rentongovehicle-7e6c0.firebasestorage.app",
  messagingSenderId: "406882720905",
  appId: "1:406882720905:web:e7a2a367658a2cf1b03a58",
  measurementId: "G-BC3ZM7VJ9C"

});

const messaging = firebase.messaging();

// Handle background messages for push notifications
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Notification';

  // Determine sound based on payload or default to new booking sound
  // Note: Custom sounds in SW are not supported in all browsers/OS
  const soundPath = '/sounds/new-booking.mp3';

  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/logo.png', // Change to your app icon if needed
    data: payload.data || {},
    sound: soundPath,
    renotify: true,
    tag: payload.data?.bookingId || 'general-notification'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});






// // firebase-messaging-sw.js (MUST be in /public folder)

// // Import Firebase scripts
// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// // Initialise Firebase App (same config as your frontend)
// firebase.initializeApp({
//   apiKey: "AIzaSyB_32kh2o6DdBVVvLFFBUdMnTbPWWYp4z8",
//   authDomain: "rentongovehicle-7e6c0.firebaseapp.com",
//   projectId: "rentongovehicle-7e6c0",
//   storageBucket: "rentongovehicle-7e6c0.firebasestorage.app",
//   messagingSenderId: "406882720905",
//   appId: "1:406882720905:web:e7a2a367658a2cf1b03a58",
//   measurementId: "G-BC3ZM7VJ9C"
// });

// // Messaging instance
// const messaging = firebase.messaging();

// // Background notifications (when app is closed)
// messaging.onBackgroundMessage((payload) => {
//   console.log(
//     "[firebase-messaging-sw.js] Received background message",
//     payload
//   );

//   const notificationTitle =
//     payload.notification?.title || "New Notification";

//   const notificationOptions = {
//     body: payload.notification?.body || "",
//     icon: "/logo.png", // path from public folder
//     badge: "/logo.png",
//     data: payload.data || {},
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

// // Notification click handler
// self.addEventListener("notificationclick", function (event) {
//   event.notification.close();

//   const clickAction = event.notification.data?.click_action;

//   // Open URL from notification payload
//   if (clickAction) {
//     event.waitUntil(clients.openWindow(clickAction));
//   }
// });
