import './cuentaBloqueada.css';

interface Props {
    onBack: () => void;
}

export const ContactoPro = ({ onBack }: Props) => {
    const telefono = "+57 3046094249";
    const whatsappUrl = "https://wa.me/573046094249?text=Hola,%20deseo%20actualizar%20mi%20cuenta%20en%20Foodsoft%20a%20la%20versión%20Pro.";
    const instagramUrl = "https://www.instagram.com/clikea2026/";

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '1rem' }}>
            <div className="cuenta-bloqueada-card" style={{ maxWidth: '540px' }}>
                <div className="cuenta-bloqueada-icon">🚀</div>
                <h1>Actualizar a Versión Pro</h1>
                <p>
                    <strong>Lleva el control de tu negocio al siguiente nivel.</strong> Desbloquea funcionalidades exclusivas, accede a estadísticas avanzadas y gestiona tus pedidos sin límites con la versión Pro de Foodsoft.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Para procesar tu pago y activar todos los beneficios Pro de inmediato, comunícate con nosotros por WhatsApp al número <strong>{telefono}</strong> o escríbenos a nuestro Instagram. ¡Te esperamos!
                </p>
                
                <div className="cuenta-bloqueada-actions">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cuenta-bloqueada-btn whatsapp"
                    >
                        💬 Contactar por WhatsApp para Activar Pro
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
