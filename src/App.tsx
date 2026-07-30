import './App.css'
import Mesas from './mesas'
import Pedidos from './pedidos'
import Menu from './menu'
import Usuario from './usuario'
import IniciarSesion from './iniciarSesion'
import { crearUsuario as CrearUsuario } from './crearUsuario'
import CuentaBloqueada from './cuentaBloqueada'
import HacerPedido from './hacerPedido'
import AdSenseBanner from './AdSenseBanner'
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
  const [userPlan, setUserPlan] = useState("gratis");

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
              setPerfilCompletado(true);

              const plan = data.plan || 'gratis';
              setUserPlan(plan);

              // Blocking logic
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Normalized to start of day

              if (data.estado === "inactivo") {
                setIsBlocked(true);
                setBlockReason("Tu cuenta ha sido desactivada por el administrador.");
              } else if (plan === "gratis") {
                setIsBlocked(false);
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
        setUserPlan("gratis");
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa' }}>
        <p>Cargando aplicación...</p>
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
            <a href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>← Volver a la página principal</a>
          </div>
        </div>
      </div>
    );
  }

  if (!perfilCompletado) {
    return <CrearUsuario onCompletado={() => setPerfilCompletado(true)} />;
  }

  if (isBlocked) {
    return <CuentaBloqueada reason={blockReason} onSignOut={() => auth.signOut()} />;
  }

  return (
    <div className="app">
      <header>
        <nav className='nav'>
          <ul className='nav-list'>
            <li><h1 style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'} title="Ir a la página principal">Foodsoft</h1></li>
            <li><button className={`nav-button ${view === 'mesas' ? 'active' : ''}`} onClick={() => setView("mesas")}>Mesas</button></li>
            <li><button className={`nav-button ${view === 'menu' ? 'active' : ''}`} onClick={() => setView("menu")}>Menú</button></li>
            <li><button className={`nav-button ${view === 'estadisticas' ? 'active' : ''}`} onClick={() => setView("estadisticas")}>Estadísticas</button></li>
            <li><button className={`nav-button ${view === 'usuario' ? 'active' : ''}`} onClick={() => setView("usuario")}>Usuario</button></li>
          </ul>
        </nav>
      </header>
       <main>
        <div className='main-container'>
          {userPlan === 'gratis' && <AdSenseBanner />}
          {view === "mesas" && <Mesas setView={setView} setSelectedMesa={setSelectedMesa} />}
          {view === "pedidos" && <Pedidos mesa={selectedMesa} />}
          {view === "menu" && <Menu setView={setView} />}
          {view === "estadisticas" && <Estadisticas />}
          {view === "usuario" && <Usuario setView={setView} />}
          {view === "contacto-pro" && <ContactoPro onBack={() => setView("usuario")} />}
        </div>
      </main>
    </div>
  )
}

export default App
