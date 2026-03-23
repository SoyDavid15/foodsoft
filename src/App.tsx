import './App.css'
import Mesas from './mesas'
import Pedidos from './pedidos'
import Menu from './menu'
import Usuario from './usuario'
import IniciarSesion from './iniciarSesion'
import { crearUsuario as CrearUsuario } from './crearUsuario'
import HacerPedido from './hacerPedido'
import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

function App() {
  if (window.location.pathname === '/hacer-pedido') {
    return <HacerPedido />;
  }

  const [view, setView] = useState("mesas");
  const [selectedMesa, setSelectedMesa] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfilCompletado, setPerfilCompletado] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "usuarios", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPerfilCompletado(true);
          } else {
            setPerfilCompletado(false);
          }
        } catch (error) {
          console.error("Error al cargar el perfil del usuario:", error);
          setPerfilCompletado(false);
        }
      } else {
        setPerfilCompletado(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <IniciarSesion />;
  }

  if (!perfilCompletado) {
    return <CrearUsuario onCompletado={() => setPerfilCompletado(true)} />;
  }

  return (
    <div className="app">
      <header>
        <nav className='nav'>
          <ul className='nav-list'>
            <li><h1>Foodsoft</h1></li>
            <li><button className='nav-button' onClick={() => setView("mesas")}>Mesas</button></li>
            <li><button className='nav-button' onClick={() => setView("menu")}>Menú</button></li>
            <li><button className='nav-button' onClick={() => setView("usuario")}>Usuario</button></li>
          </ul>
        </nav>
      </header>
      <main>
        <div className='main-container'>
          {view === "mesas" && <Mesas setView={setView} setSelectedMesa={setSelectedMesa} />}
          {view === "pedidos" && <Pedidos mesa={selectedMesa} />}
          {view === "menu" && <Menu setView={setView} />}
          {view === "usuario" && <Usuario />}
        </div>
      </main>
    </div>
  )
}

export default App
