importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');



firebase.initializeApp(
    {
        apiKey: "AIzaSyCFhuwGzzza5VbrXCJ_5_l8EisCkZKzoow",
        authDomain: "nxt-1-de054.firebaseapp.com",
        projectId: "nxt-1-de054",
        storageBucket: "nxt-1-de054.appspot.com",
        messagingSenderId: "574223545656",
        appId: "1:574223545656:web:35d717a721f4b84a45bdcd",
        measurementId: "G-SNZ2T18P5G"
    }
);

const messaging = firebase.messaging();