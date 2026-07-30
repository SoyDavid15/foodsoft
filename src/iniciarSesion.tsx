import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "./iniciarSesion.css";

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
            {/* Header Sticky */}
            <header className="landing-nav">
                <div className="landing-logo" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
                    <h1>Foodsoft<span>.</span></h1>
                </div>
                <nav className="landing-nav-links">
                    <a href="#beneficios">Arquitectura</a>
                    <a href="#comparativa">Eficiencia Operativa</a>
                    <a href="#funciones">Módulos</a>
                    <a href="https://www.instagram.com/clikea2026/" target="_blank" rel="noopener noreferrer" className="nav-social-link instagram">Instagram</a>
                    <a href="https://clikea.vercel.app" target="_blank" rel="noopener noreferrer" className="nav-social-link web">Visitar Clikea</a>
                </nav>
                <div className="landing-nav-actions">
                    <button className="landing-login-btn" onClick={entrarConGooogle}>
                        Acceso Profesional
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <div className="landing-badge">
                        INFRAESTRUCTURA OPERATIVA PARA HOSTELERÍA
                    </div>
                    <h1 className="landing-title">
                        Control total de salón, cocina y finanzas en una sola plataforma.
                    </h1>
                    <p className="landing-subtitle">
                        Sustituya procesos manuales frágiles por un flujo digital robusto: códigos QR nativos para mesas, sincronización en tiempo real con cocina y auditoría financiera automatizada sin fricción.
                    </p>
                    
                    <div className="hero-cta-box">
                        <button className="google-signin-btn" onClick={entrarConGooogle}>
                            <svg className="google-icon" viewBox="0 0 24 24" width="22" height="22">
                                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.32 7.23 24 12 24z"/>
                                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.11 0 9.81 0 12s.43 3.89 1.19 5.42l4.09-3.15z"/>
                                <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                            </svg>
                            Acceder con Cuenta Google
                        </button>
                        <div className="hero-guarantees">
                            <span>Sin costos de instalación</span>
                            <span>Alta instantánea en 2 minutos</span>
                            <span>Compatible con cualquier terminal móvil</span>
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
                        <span className="mockup-title">Terminal Principal — Telemetría en Vivo</span>
                    </div>
                    <div className="mockup-body">
                        <div className="mockup-stat-card">
                            <span className="stat-label">Facturación Acumulada del Turno</span>
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
                            <span>Sincronización activa con estación de comandas · Latencia &lt; 100ms</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why You Need It / Business Benefits */}
            <section id="beneficios" className="landing-benefits">
                <div className="section-header">
                    <h2>Ingeniería orientada al rendimiento financiero</h2>
                    <p>Cada componente del sistema está calibrado para eliminar fricción operativa y maximizar el margen por cubierto.</p>
                </div>
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <div className="benefit-number">01</div>
                        <h3>Optimización del Ticket Medio</h3>
                        <p>La presentación visual de alta fidelidad en dispositivos móviles estimula la selección de adicionales y postres sin saturar al personal de sala.</p>
                        <div className="benefit-metric">Impacto estimado: +25% en consumo por comensal</div>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-number">02</div>
                        <h3>Reducción del Tiempo de Ciclo</h3>
                        <p>El autoservicio mediante códigos QR en mesa desacopla la toma de pedidos de la disponibilidad del camarero en horas punta.</p>
                        <div className="benefit-metric">Reducción de espera: -40% en primer tiempo</div>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-number">03</div>
                        <h3>Eliminación de Mermas de Comanda</h3>
                        <p>La transmisión directa y sin intermediarios de papel asegura que ningún plato quede sin registrar ni cobrar en la caja diaria.</p>
                        <div className="benefit-metric">Auditoría: 100% trazabilidad de pedidos</div>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-number">04</div>
                        <h3>Independencia Tecnológica</h3>
                        <p>Arquitectura cloud-native optimizada para ejecutarse en smartphones, tablets o terminales existentes sin hardware propietario.</p>
                        <div className="benefit-metric">Inversión inicial en equipos: €0</div>
                    </div>
                </div>
            </section>

            {/* Before vs After Comparison */}
            <section id="comparativa" className="landing-comparison">
                <div className="section-header">
                    <h2>Evaluación de modelos operativos</h2>
                    <p>Contraste empírico entre la operativa tradicional analógica y la automatización estructurada.</p>
                </div>
                <div className="comparison-table">
                    <div className="comparison-col bad">
                        <div className="col-header">
                            <h3>Operativa Tradicional</h3>
                        </div>
                        <ul>
                            <li><span>Dependencia de papel impreso y libretas propensas a extravíos y errores de lectura.</span></li>
                            <li><span>Cartas físicas rígidas con costes elevados de reimpresión por cada modificación de carta o tarifa.</span></li>
                            <li><span>Cuellos de botella severos en cocina durante las franjas horarias de máxima ocupación.</span></li>
                            <li><span>Conciliaciones de caja manuales al cierre de turno con discrepancias recurrentes.</span></li>
                        </ul>
                    </div>
                    <div className="comparison-col good">
                        <div className="col-header">
                            <h3>Ecosistema Foodsoft</h3>
                        </div>
                        <ul>
                            <li><span>Toma de comanda digital con validación de inventario en tiempo real.</span></li>
                            <li><span>Actualización instantánea del catálogo de productos y precios desde el panel central.</span></li>
                            <li><span>Gestión de flujo de sala automatizada con estados de cocina transparentes.</span></li>
                            <li><span>Cierre financiero automatizado y analítica de rendimiento por franja horaria.</span></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Core Features */}
            <section id="funciones" className="landing-features">
                <div className="section-header">
                    <h2>Módulos del Sistema</h2>
                    <p>Herramientas de precisión diseñadas con rigor técnico para la gestión integral de establecimientos gastronómicos.</p>
                </div>
                <div className="landing-features-grid">
                    <div className="landing-feature-card">
                        <div className="feature-code">MOD-01</div>
                        <h3>Gestión de Mesas y Códigos QR</h3>
                        <p>Generación automatizada de identificadores únicos por mesa con códigos de alta resolución listos para producción y despliegue físico.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="feature-code">MOD-02</div>
                        <h3>Catálogo Multimedia y Compresión</h3>
                        <p>Gestor de activos visuales con motor de compresión integrado que garantiza tiempos de carga inferiores a 0.5 segundos en cualquier red móvil.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="feature-code">MOD-03</div>
                        <h3>Inteligencia Financiera y Analítica</h3>
                        <p>Cuadros de mando analíticos con desglose de ventas por franja horaria, identificación de productos de alta rotación y métricas de rendimiento.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="feature-code">MOD-04</div>
                        <h3>Monitor de Estado en Vivo</h3>
                        <p>Consola central de cocina y sala con sincronización WebSocket que elimina la necesidad de intercomunicadores o impresoras térmicas adicionales.</p>
                    </div>
                </div>
            </section>

            {/* Final CTA Banner */}
            <section className="landing-final-cta">
                <div className="final-cta-container">
                    <h2>Inicie la transición operativa de su establecimiento</h2>
                    <p>Incorpore control financiero automatizado y excelencia en el servicio en menos de cinco minutos.</p>
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
