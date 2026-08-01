import './App.css'
import Mesas from './mesas'
import Pedidos from './pedidos'
import Menu from './menu'
import Inventario from './inventario'
import Usuario from './usuario'
import IniciarSesion from './iniciarSesion'

import { crearUsuario as CrearUsuario } from './crearUsuario'
import CuentaBloqueada from './cuentaBloqueada'
import HacerPedido from './hacerPedido'

import ContactoPro from './contactoPro'
import Estadisticas from './estadisticas'
import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged, type User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

function App() {
  const pathname = window.location.pathname;

  if (pathname === '/hacer-pedido') {
    return <HacerPedido />;
  }

  if (pathname === '/' || pathname === '/home') {
    return <IniciarSesion />;
  }

  const [view, setView] = useState("mesas");
  const [selectedMesa, setSelectedMesa] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfilCompletado, setPerfilCompletado] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const handleSignOut = () => {
    auth.signOut();
  };

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "usuarios", currentUser.uid);
          unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (!data.username || !data.nombre || !data.direccion) {
                setPerfilCompletado(false);
                setLoading(false);
                return;
              }
              setPerfilCompletado(true);

               // Blocking logic: 15 days free trial from creation date, or Pro subscription expiration
               const today = new Date();
               today.setHours(0, 0, 0, 0);

               const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
               createdAt.setHours(0, 0, 0, 0);

               const trialEndDate = new Date(createdAt);
               trialEndDate.setDate(trialEndDate.getDate() + 15);

               const fechaVencimiento = data.fechaVencimiento ? new Date(data.fechaVencimiento) : null;
               if (fechaVencimiento) fechaVencimiento.setHours(0, 0, 0, 0);

               if (data.estado === "inactivo") {
                 setIsBlocked(true);
                 setBlockReason("Tu cuenta ha sido desactivada por el administrador.");
               } else if (data.plan === 'pro') {
                 if (fechaVencimiento && today > fechaVencimiento) {
                   setIsBlocked(true);
                   setBlockReason("Tu suscripción Pro de 1 mes ha finalizado. Para continuar disfrutando de las ventajas Pro, debes realizar el pago de renovación.");
                 } else {
                   setIsBlocked(false);
                 }
               } else if (today > trialEndDate) {
                 setIsBlocked(true);
                 setBlockReason("Tu período de prueba gratuito de 15 días ha finalizado. Para continuar utilizando Foodsoft y mantener tu cuenta activa, debes realizar el pago de tu suscripción.");
               } else {
                 setIsBlocked(false);
               }
            } else {
              setPerfilCompletado(false);
            }
            setLoading(false);
          });
        } catch (error) {
          console.error("Error al cargar el perfil del usuario:", error);
          setPerfilCompletado(false);
          setLoading(false);
        }
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        setPerfilCompletado(false);
        setIsBlocked(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const entrarConGooogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="skeleton-screen">
        <nav className="skeleton-nav">
          <div className="skeleton" style={{ height: '30px', width: '150px', marginBottom: '1.5rem', borderRadius: '6px' }}></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '8px' }}></div>
          ))}
        </nav>
        <main className="skeleton-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div className="skeleton" style={{ height: '35px', width: '180px', borderRadius: '6px' }}></div>
            <div className="skeleton" style={{ height: '35px', width: '140px', borderRadius: '6px' }}></div>
          </div>
          <div className="skeleton" style={{ height: '16px', width: '350px', borderRadius: '6px', marginBottom: '0.5rem' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton" style={{ height: '150px', borderRadius: '12px' }}></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Panel Foodsoft</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Inicia sesión para acceder a tu panel de control</p>
          <button 
            onClick={entrarConGooogle}
            style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.85rem 1.5rem', fontSize: '0.95rem', fontWeight: '600', borderRadius: '12px', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            Iniciar sesión con Google
          </button>
          <div style={{ marginTop: '1.5rem' }}>
            <a href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>â† Volver a la página principal</a>
          </div>
        </div>
      </div>
    );
  }

  if (!perfilCompletado) {
    return <CrearUsuario onCompletado={() => setPerfilCompletado(true)} />;
  }

  if (isBlocked) {
    return <CuentaBloqueada reason={blockReason} onSignOut={handleSignOut} />;
  }

  return (
    <div className="app">
      <header>
        <nav className='nav'>
          <ul className='nav-list'>
            <li><h1 style={{ cursor: 'pointer' }} onClick={() => setView("mesas")} title="Ir al panel">Foodsoft</h1></li>
            <li><button className={`nav-button ${view === 'mesas' ? 'active' : ''}`} onClick={() => setView("mesas")}>Mesas</button></li>
            <li><button className={`nav-button ${view === 'menu' ? 'active' : ''}`} onClick={() => setView("menu")}>Menú</button></li>
            <li><button className={`nav-button ${view === 'inventario' ? 'active' : ''}`} onClick={() => setView("inventario")}>Inventario</button></li>
            <li><button className={`nav-button ${view === 'estadisticas' ? 'active' : ''}`} onClick={() => setView("estadisticas")}>Estadísticas</button></li>
            <li><button className={`nav-button ${view === 'usuario' ? 'active' : ''}`} onClick={() => setView("usuario")}>Usuario</button></li>
          </ul>
        </nav>
      </header>
      <main>
        <div className='main-container'>
          {view === "mesas" && <Mesas setView={setView} setSelectedMesa={setSelectedMesa} />}
          {view === "pedidos" && <Pedidos mesa={selectedMesa} />}
          {view === "inventario" && <Inventario />}
          {view === "menu" && <Menu />}
          {view === "estadisticas" && <Estadisticas />}
          {view === "usuario" && <Usuario setView={setView} />}
          {view === "contacto-pro" && <ContactoPro onBack={() => setView("usuario")} />}
        </div>
      </main>
    </div>
  )
}

export default App

