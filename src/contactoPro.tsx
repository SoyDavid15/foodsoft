import './cuentaBloqueada.css';

interface Props {
    onBack: () => void;
}

export const ContactoPro = ({ onBack }: Props) => {
    const telefono = "+57 3046094249";
    const whatsappUrl = "https://wa.me/573046094249?text=Hola,%20deseo%20actualizar%20mi%20cuenta%20en%20Foodsoft%20a%20la%20versión%20Pro.";

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '1rem' }}>
            <div className="cuenta-bloqueada-card" style={{ maxWidth: '540px' }}>
                <div className="cuenta-bloqueada-icon">🚀</div>
                <h1>Actualizar a Versión Pro</h1>
                <p>
                    Disfruta de todas las funcionalidades avanzadas y elimina los anuncios de publicidad pasando a nuestra versión Pro.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Para procesar tu pago y activar tu cuenta Pro inmediatamente, comunícate con nosotros por WhatsApp al número <strong>{telefono}</strong>.
                </p>
                
                <div className="cuenta-bloqueada-actions">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cuenta-bloqueada-btn"
                    >
                        💬 Contactar por WhatsApp para Activar Pro
                    </a>
                    <button
                        onClick={onBack}
                        className="cuenta-bloqueada-btn secondary"
                    >
                        Volver al perfil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactoPro;
