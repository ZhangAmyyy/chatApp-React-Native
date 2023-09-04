
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

export const getFirebaseApp = () => {
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDV570qV5IHFk5FpOnZsUBI24nqoZGGuoQ",
        authDomain: "whatsapp-475da.firebaseapp.com",
        projectId: "whatsapp-475da",
        storageBucket: "whatsapp-475da.appspot.com",
        messagingSenderId: "987354448636",
        appId: "1:987354448636:web:0a903d7a77f7af5cffcd79"
    };

    // Initialize Firebase
    return initializeApp(firebaseConfig);

}