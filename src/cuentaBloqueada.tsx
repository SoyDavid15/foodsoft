import './cuentaBloqueada.css';

interface Props {
    reason: string;
    onSignOut: () => void;
}

export const CuentaBloqueada = ({ reason, onSignOut }: Props) => {
    const telefono = "+57 3046094249";
    const whatsappUrl = "https://wa.me/573046094249?text=Hola,%20deseo%20regularizar%20mi%20situación%20y%20reactivar%20mi%20cuenta%20en%20Foodsoft.";
    const instagramUrl = "https://www.instagram.com/clikea2026/";

    return (
        <div className="cuenta-bloqueada-page">
            <div className="cuenta-bloqueada-card">
                <div className="cuenta-bloqueada-icon">⚠️</div>
                <h1>Cuenta Bloqueada</h1>
                <p>{reason}</p>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Para reactivar tu cuenta inmediatamente, comunícate con soporte al número <strong>{telefono}</strong> o escríbenos a nuestro Instagram.
                </p>
                
                <div className="cuenta-bloqueada-actions">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cuenta-bloqueada-btn whatsapp"
                    >
                        💬 Contactar por WhatsApp
                    </a>
                    <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cuenta-bloqueada-btn instagram"
                    >
                        📸 Contactar por Instagram
                    </a>
                    <button
                        onClick={onSignOut}
                        className="cuenta-bloqueada-btn secondary"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CuentaBloqueada;
