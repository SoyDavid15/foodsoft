import { useState } from "react";
import { auth } from "./firebase";
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from "firebase/auth";
import "./iniciarSesion.css";

export const IniciarSesion = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const entrarConGooogle = async () => {
        try {
            setLoading(true);
            setError(null);
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            window.location.href = '/panel';
        } catch (err: unknown) {
            console.error(err);
            setError("Error al iniciar sesión con Google.");
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            window.location.href = '/panel';
        } catch (err: unknown) {
            console.error(err);
            const errorObj = err as { code?: string };
            let msg = "Ocurrió un error en la autenticación.";
            if (errorObj.code === 'auth/invalid-credential' || errorObj.code === 'auth/wrong-password' || errorObj.code === 'auth/user-not-found') {
                msg = "Correo o contraseña incorrectos.";
            } else if (errorObj.code === 'auth/email-already-in-use') {
                msg = "Este correo electrónico ya está registrado.";
            } else if (errorObj.code === 'auth/weak-password') {
                msg = "La contraseña debe tener al menos 6 caracteres.";
            } else if (errorObj.code === 'auth/invalid-email') {
                msg = "El formato del correo electrónico no es válido.";
            }
            setError(msg);
            setLoading(false);
        }
    };

    const scrollToAuth = () => {
        document.querySelector('.hero-cta-box')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="landing-page">
            {/* Header Sticky */}
            <header className="landing-nav">
                <div className="landing-logo" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
                    <h1>Foodsoft<span>.</span></h1>
                </div>
                <nav className="landing-nav-links">
                    <a href="#beneficios">Beneficios</a>
                    <a href="#comparativa">Comparativa</a>
                    <a href="#funciones">Módulos</a>
                    <a href="https://www.instagram.com/clikea2026/" target="_blank" rel="noopener noreferrer" className="nav-social-link instagram">Instagram</a>
                    <a href="https://clikea.vercel.app" target="_blank" rel="noopener noreferrer" className="nav-social-link web">Visitar Clikea</a>
                </nav>
                <div className="landing-nav-actions">
                    <button className="landing-login-btn" onClick={scrollToAuth}>
                        Acceso Profesional
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <div className="landing-badge">
                        PLATAFORMA INTEGRAL PARA HOSTELERÍA
                    </div>
                    <h1 className="landing-title">
                        Control total de mesas, cocina y ventas en tiempo real.
                    </h1>
                    <p className="landing-subtitle">
                        Sustituye procesos manuales por un flujo digital rápido y sin errores: códigos QR en cada mesa, comandas instantáneas en cocina y control de caja automático sin complicaciones.
                    </p>
                    
                    <div className="hero-cta-box">
                        <div className="auth-mode-tabs">
                            <button 
                                type="button" 
                                className={`auth-tab ${!isRegistering ? 'active' : ''}`}
                                onClick={() => { setIsRegistering(false); setError(null); }}
                            >
                                Iniciar Sesión
                            </button>
                            <button 
                                type="button" 
                                className={`auth-tab ${isRegistering ? 'active' : ''}`}
                                onClick={() => { setIsRegistering(true); setError(null); }}
                            >
                                Crear Cuenta
                            </button>
                        </div>

                        <form onSubmit={handleEmailAuth} className="email-auth-form">
                            {error && <div className="auth-error-banner">{error}</div>}
                            <div className="form-group">
                                <input 
                                    type="email" 
                                    placeholder="Correo electrónico" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="form-group password-group">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Contraseña (mín. 6 caracteres)" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                                <button 
                                    type="button" 
                                    className="toggle-password-btn" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <button type="submit" className="email-submit-btn" disabled={loading}>
                                {loading ? 'Procesando...' : (isRegistering ? 'Registrarse con Email' : 'Iniciar Sesión con Email')}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>o</span>
                        </div>

                        <button className="google-signin-btn" onClick={entrarConGooogle} disabled={loading}>
                            <svg className="google-icon" viewBox="0 0 24 24" width="22" height="22">
                                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.32 7.23 24 12 24z"/>
                                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.11 0 9.81 0 12s.43 3.89 1.19 5.42l4.09-3.15z"/>
                                <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                            </svg>
                            {isRegistering ? 'Registrarse con Google' : 'Acceder con Cuenta Google'}
                        </button>

                        <div className="hero-guarantees">
                            <span>Sin costes ocultos</span>
                            <span>Alta instantánea en 2 minutos</span>
                            <span>Funciona en cualquier móvil o tablet</span>
                        </div>
                    </div>
                </div>

                {/* Interactive Dashboard Mockup Preview */}
                <div className="landing-hero-mockup">
                    <div className="mockup-header">
                        <div className="mockup-dots">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                        </div>
                        <span className="mockup-title">Panel de Control — En Vivo</span>
                    </div>
                    <div className="mockup-body">
                        <div className="mockup-stat-card">
                            <span className="stat-label">Ventas Totales del Turno</span>
                            <span className="stat-value">€1,480.00</span>
                            <span className="stat-trend positive">+24% frente al promedio histórico</span>
                        </div>
                        <div className="mockup-grid">
                            <div className="mockup-item">
                                <span className="item-index">M-04</span>
                                <div className="mockup-details">
                                    <h4>Mesa 04 · Salón Principal</h4>
                                    <p>3 ítems en preparación activa</p>
                                </div>
                                <span className="badge-live active">En cocina</span>
                            </div>
                            <div className="mockup-item">
                                <span className="item-index">M-08</span>
                                <div className="mockup-details">
                                    <h4>Mesa 08 · Terraza</h4>
                                    <p>Cierre de cuenta pendiente</p>
                                </div>
                                <span className="badge-live ready">Por cobrar</span>
                            </div>
                        </div>
                        <div className="mockup-banner-mini">
                            <span>Sincronización en tiempo real con cocina · Cero retrasos</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why You Need It / Business Benefits */}
            <section id="beneficios" className="landing-benefits">
                <div className="section-header">
                    <h2>Diseñado para maximizar tus beneficios y simplificar la operación</h2>
                    <p>Cada herramienta está creada para eliminar errores, agilizar el servicio y aumentar la rentabilidad de tu negocio.</p>
                </div>
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <div className="benefit-number">01</div>
                        <h3>Mayor Ticket Promedio</h3>
                        <p>Los clientes piden cómodamente desde su móvil con fotos y descripciones detalladas, aumentando la venta de postres y extras sin esfuerzo.</p>
                        <div className="benefit-metric">Impacto estimado: +25% por comensal</div>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-number">02</div>
                        <h3>Cero Esperas Innecesarias</h3>
                        <p>Los pedidos de mesa llegan instantáneamente a cocina, reduciendo drásticamente los tiempos de espera y mejorando la rotación de mesas.</p>
                        <div className="benefit-metric">Reducción de espera: -40% en primer tiempo</div>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-number">03</div>
                        <h3>Control Total de Caja</h3>
                        <p>Adiós a las cuentas descuadradas. Cada pedido queda registrado digitalmente con su importe y estado de cobro exacto.</p>
                        <div className="benefit-metric">Auditoría: 100% trazabilidad</div>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-number">04</div>
                        <h3>Sin Inversión en Hardware</h3>
                        <p>Funciona directamente en los smartphones y tablets que ya tienes. Sin instalaciones complejas ni costosos equipos propietarios.</p>
                        <div className="benefit-metric">Inversión inicial: €0</div>
                    </div>
                </div>
            </section>

            {/* Before vs After Comparison */}
            <section id="comparativa" className="landing-comparison">
                <div className="section-header">
                    <h2>La diferencia de trabajar con Foodsoft</h2>
                    <p>Compara el método tradicional con la gestión digital moderna.</p>
                </div>
                <div className="comparison-table">
                    <div className="comparison-col bad">
                        <div className="col-header">
                            <h3>Gestión Tradicional</h3>
                        </div>
                        <ul>
                            <li><span>Comandas en papel propensas a pérdida, extravío y errores de lectura.</span></li>
                            <li><span>Cartas impresas costosas de actualizar cada vez que cambias un precio.</span></li>
                            <li><span>Caos y retrasos en cocina durante las horas de mayor afluencia.</span></li>
                            <li><span>Cuadres de caja manuales largos y propensos a discrepancias.</span></li>
                        </ul>
                    </div>
                    <div className="comparison-col good">
                        <div className="col-header">
                            <h3>Ecosistema Foodsoft</h3>
                        </div>
                        <ul>
                            <li><span>Pedidos digitales directos y sincronizados en tiempo real.</span></li>
                            <li><span>Carta y precios actualizables al instante desde cualquier lugar.</span></li>
                            <li><span>Flujo de cocina ordenado, claro y transparente.</span></li>
                            <li><span>Cierre de caja y estadísticas financieras automáticas.</span></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Core Features */}
            <section id="funciones" className="landing-features">
                <div className="section-header">
                    <h2>Módulos Principales</h2>
                    <p>Herramientas potentes y fáciles de usar para la gestión integral de tu restaurante.</p>
                </div>
                <div className="landing-features-grid">
                    <div className="landing-feature-card">
                        <div className="feature-code">MOD-01</div>
                        <h3>Mesas y Códigos QR</h3>
                        <p>Genera e imprime códigos QR únicos para cada mesa listos para que tus clientes escaneen y pidan.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="feature-code">MOD-02</div>
                        <h3>Catálogo Interactivo</h3>
                        <p>Sube fotos, categorías y precios de tus platos con una interfaz atractiva y optimizada para móvil.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="feature-code">MOD-03</div>
                        <h3>Estadísticas y Reportes</h3>
                        <p>Visualiza tus ventas totales, productos más vendidos y rendimiento por franja horaria.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="feature-code">MOD-04</div>
                        <h3>Monitor de Cocina (KDS)</h3>
                        <p>Pantalla en vivo para la cocina con estado de cada comanda en tiempo real.</p>
                    </div>
                </div>
            </section>

            {/* Final CTA Banner */}
            <section className="landing-final-cta">
                <div className="final-cta-container">
                    <h2>Empieza a digitalizar tu negocio hoy mismo</h2>
                    <p>Mejora la experiencia de tus clientes y optimiza el trabajo de tu equipo en pocos minutos.</p>
                    <button className="google-signin-btn large" onClick={entrarConGooogle}>
                        <svg className="google-icon" viewBox="0 0 24 24" width="22" height="22">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.32 7.23 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.11 0 9.81 0 12s.43 3.89 1.19 5.42l4.09-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        Acceder con Cuenta Google
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <h3>Foodsoft<span>.</span></h3>
                        <p>Infraestructura de control y automatización gastronómica.</p>
                    </div>
                    <div className="footer-social-section">
                        <h4>¡Síguenos y conoce más!</h4>
                        <div className="footer-social-links">
                            <a href="https://www.instagram.com/clikea2026/" target="_blank" rel="noopener noreferrer" className="social-badge instagram">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                Instagram (@clikea2026)
                            </a>
                            <a href="https://clikea.vercel.app" target="_blank" rel="noopener noreferrer" className="social-badge web">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                Sitio Web (clikea.vercel.app)
                            </a>
                        </div>
                    </div>
                    <div className="footer-copyright">
                        <p>&copy; {new Date().getFullYear()} Foodsoft. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default IniciarSesion;
