import './home.css';

export const Home = () => {
    return (
        <div className="home-container">
            <header className="home-nav">
                <div className="home-logo">
                    <h1>Foodsoft</h1>
                </div>
                <div className="home-nav-actions">
                    <button className="home-btn-secondary" onClick={() => window.location.href = '/panel'}>
                        Iniciar Sesión
                    </button>
                    <button className="home-btn-primary" onClick={() => window.location.href = '/panel'}>
                        Probar Gratis 🚀
                    </button>
                </div>
            </header>

            <section className="hero-section">
                <div className="hero-badge">✨ El sistema definitivo para tu local</div>
                <h1 className="hero-title">
                    Gestiona tu restaurante y cafetería de forma <span>inteligente</span>
                </h1>
                <p className="hero-subtitle">
                    Foodsoft automatiza tus mesas, menú digital con QR, pedidos en tiempo real y estadísticas financieras avanzadas en una sola plataforma.
                </p>
                <div className="hero-cta-group">
                    <button className="hero-btn-main" onClick={() => window.location.href = '/panel'}>
                        Comenzar Ahora 🚀
                    </button>
                </div>
            </section>

            <section className="features-section">
                <h2>Todo lo que tu negocio necesita</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🍽️</div>
                        <h3>Mesas y Códigos QR</h3>
                        <p>Crea mesas ilimitadas y genera códigos QR automáticos para que tus clientes ordenen desde sus teléfonos al instante.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🍔</div>
                        <h3>Menú Digital con Fotos</h3>
                        <p>Sube fotos de tus platos con compresión automática integrada y actualiza tu carta en tiempo real.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Estadísticas y Gráficos</h3>
                        <p>Visualiza ingresos diarios, semanales, mensuales y descubre cuáles son los días de mayor demanda de tu local.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Pedidos en Vivo</h3>
                        <p>Gestiona estados de pedidos (Pendiente, Listo, Pagado) con actualizaciones en tiempo real para cocina y salón.</p>
                    </div>
                </div>
            </section>

            <footer className="home-footer">
                <p>&copy; {new Date().getFullYear()} Foodsoft. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default Home;
