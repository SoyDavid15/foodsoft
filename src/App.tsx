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
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

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
    return <CuentaBloqueada reason={blockReason} onSignOut={() => auth.signOut()} />;
  }

  return (
    <div className="app">
      <header>
        <nav className='nav'>
          <ul className='nav-list'>
            <li><h1>Foodsoft</h1></li>
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
