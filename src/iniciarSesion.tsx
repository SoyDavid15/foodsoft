import { auth } from "./firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import "./iniciarSesion.css"

export const IniciarSesion = () => {
    const entrarConGooogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            window.location.href = '/panel';
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="landing-page">
            <header className="landing-nav">
                <div className="landing-logo" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
                    <h1>Foodsoft</h1>
                </div>
                <div className="landing-nav-actions">
                    <button className="landing-login-btn" onClick={() => window.location.href = '/panel'}>
                        Acceder al Panel
                    </button>
                </div>
            </header>

            <section className="landing-hero">
                <div className="landing-hero-content">
                    <div className="landing-badge">✨ El software definitivo para hostelería</div>
                    <h1 className="landing-title">
                        Gestiona tu restaurante y cafetería de forma <span>inteligente</span>
                    </h1>
                    <p className="landing-subtitle">
                        Foodsoft automatiza tus mesas con códigos QR, menú digital con fotos y compresión integrada, pedidos en tiempo real y estadísticas financieras avanzadas.
                    </p>
                    <div className="landing-cta-box">
                        <p className="landing-cta-text">Comienza ahora a administrar tu local</p>
                        <button className="google-signin-btn" onClick={entrarConGooogle}>
                            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.32 7.23 24 12 24z"/>
                                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.11 0 9.81 0 12s.43 3.89 1.19 5.42l4.09-3.15z"/>
                                <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                            </svg>
                            Acceder al Panel con Google
                        </button>
                    </div>
                </div>
            </section>

            <section className="landing-features">
                <h2>Todo lo que tu negocio necesita</h2>
                <div className="landing-features-grid">
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">🍽️</div>
                        <h3>Mesas y Códigos QR</h3>
                        <p>Crea mesas ilimitadas y genera códigos QR automáticos para que tus clientes ordenen desde sus teléfonos al instante.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">🍔</div>
                        <h3>Menú Digital con Fotos</h3>
                        <p>Sube fotos de tus platos con compresión automática integrada y actualiza tu carta en tiempo real.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">📊</div>
                        <h3>Estadísticas y Gráficos</h3>
                        <p>Visualiza ingresos diarios, semanales, mensuales y descubre cuáles son los días de mayor demanda de tu local.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">⚡</div>
                        <h3>Pedidos en Vivo</h3>
                        <p>Gestiona estados de pedidos (Pendiente, Listo, Pagado) con actualizaciones en tiempo real para cocina y salón.</p>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} Foodsoft. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default IniciarSesion;
