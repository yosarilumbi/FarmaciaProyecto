// firebaseConfig.js o Conexion/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCsKtJ71d8BgT73hleroVc9UmcQE0C3SM",
  authDomain: "farmaciaproyecto2024.firebaseapp.com",
  projectId: "farmaciaproyecto2024",
  storageBucket: "farmaciaproyecto2024.firebasestorage.app",
  messagingSenderId: "844832569112",
  appId: "1:844832569112:web:e30d9fb7cea40ee579106d"
};
// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
