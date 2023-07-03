
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSTrf1mu83MFziyPsx78Alfaf_BwclmLU",
  authDomain: "board-tarefas-1b74b.firebaseapp.com",
  projectId: "board-tarefas-1b74b",
  storageBucket: "board-tarefas-1b74b.appspot.com",
  messagingSenderId: "916147542867",
  appId: "1:916147542867:web:60dae71ed992082b4f5fa6"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

//Inicializar a config do banco de dados
const db = getFirestore(firebaseApp);

//exportando o banco de dados para podermos utilizar-lo
export { db };
