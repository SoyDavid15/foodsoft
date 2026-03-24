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
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "usuarios", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPerfilCompletado(true);

            // Blocking logic
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalized to start of day

            if (data.estado === "inactivo") {
              setIsBlocked(true);
              setBlockReason("Tu cuenta ha sido desactivada por el administrador.");
            } else if (data.fechaProximoPago && new Date(data.fechaProximoPago) < today) {
              setIsBlocked(true);
              setBlockReason("La fecha límite de pago ha vencido. Por favor, regulariza tu situación.");
            } else if (data.fechaVencimiento && new Date(data.fechaVencimiento) < today) {
              setIsBlocked(true);
              setBlockReason("Tu suscripción ha vencido.");
            } else {
              setIsBlocked(false);
            }
          } else {
            setPerfilCompletado(false);
          }
        } catch (error) {
          console.error("Error al cargar el perfil del usuario:", error);
          setPerfilCompletado(false);
        }
      } else {
        setPerfilCompletado(false);
        setIsBlocked(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa' }}>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  if (!user) {
    return <IniciarSesion />;
  }

  if (!perfilCompletado) {
    return <CrearUsuario onCompletado={() => setPerfilCompletado(true)} />;
  }

  if (isBlocked) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#fff5f5',
        color: '#c53030'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Cuenta Bloqueada</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '500px' }}>{blockReason}</p>
        <p style={{ marginTop: '20px', color: '#718096' }}>Por favor, contacta a soporte para reactivar tu cuenta.</p>
        <button
          onClick={() => auth.signOut()}
          style={{
            marginTop: '30px',
            padding: '10px 20px',
            backgroundColor: '#c53030',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Cerrar sesión
        </button>
      </div>
    );
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
