import './cuentaBloqueada.css';
import { useState, useEffect } from 'react';
import { auth } from './firebase';

declare global {
    interface Window {
        WidgetCheckout: any;
    }
}

interface Props {
    reason: string;
    onSignOut: () => void;
}

export const CuentaBloqueada = ({ reason, onSignOut }: Props) => {
    const whatsappUrl = "https://wa.me/573046094249?text=Hola,%20deseo%20regularizar%20mi%20situación%20y%20reactivar%20mi%20cuenta%20en%20Foodsoft.";
    const instagramUrl = "https://www.instagram.com/clikea2026/";
    const [loadingPayment, setLoadingPayment] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    const handlePagarPro = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert("Debes iniciar sesión para realizar el pago.");
            return;
        }

        setLoadingPayment(true);
        try {
            const reference = `PRO-${currentUser.uid}-${Date.now()}`;
            const amount = 50000; // $50,000 COP
            const currency = "COP";
            const customerEmail = currentUser.email || "cliente@foodsoft.co";

            const response = await fetch("http://localhost:8000/api/v1/payments/create-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount,
                    reference,
                    currency,
                    customer_email: customerEmail,
                }),
            });

            if (!response.ok) {
                throw new Error("No se pudo conectar con el servidor de pagos.");
            }

            const data = await response.json();

            if (window.WidgetCheckout) {
                const checkout = new window.WidgetCheckout({
                    currency: data.currency,
                    amountInCents: data.amount_in_cents,
                    reference: data.reference,
                    publicKey: data.pub_key,
                    signature: {
                        integrity: data.signature,
                    },
                    customerData: {
                        email: data.customer_email,
                    }
                });

                checkout.open(function (result: any) {
                    const transaction = result.transaction;
                    if (transaction && transaction.status === "APPROVED") {
                        alert("¡Pago aprobado con éxito! Tu cuenta ha sido desbloqueada y actualizada a la versión Pro por 1 mes 🚀");
                        window.location.reload();
                    } else if (transaction && transaction.status === "PENDING") {
                        alert("Tu pago se encuentra pendiente de confirmación.");
                    } else {
                        alert("El pago no pudo completarse o fue rechazado.");
                    }
                });
            } else {
                alert("El widget de pagos de Wompi no cargó correctamente.");
            }
        } catch (error) {
            console.error("Error al procesar pago:", error);
            alert("Error al procesar el pago con Wompi. Verifique que el backend esté activo.");
        } finally {
            setLoadingPayment(false);
        }
    };

    return (
        <div className="cuenta-bloqueada-page">
            <div className="cuenta-bloqueada-card" style={{ maxWidth: '520px' }}>
                <div className="cuenta-bloqueada-icon">⚠️</div>
                <h1>Cuenta Bloqueada</h1>
                <p>{reason}</p>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.25rem' }}>
                    Realiza el pago de tu suscripción de 1 mes ($50.000 COP) para desbloquear inmediatamente tu cuenta y todas las funciones Pro.
                </p>
                
                <div className="cuenta-bloqueada-actions">
                    <button
                        onClick={handlePagarPro}
                        disabled={loadingPayment}
                        className="cuenta-bloqueada-btn"
                        style={{ background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, padding: '14px', fontSize: '0.95rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                        {loadingPayment ? 'Conectando con Wompi...' : '💳 Pagar Suscripción 1 Mes ($50.000 COP)'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cuenta-bloqueada-btn whatsapp"
                            style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                        >
                            💬 WhatsApp
                        </a>
                        <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cuenta-bloqueada-btn instagram"
                            style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                        >
                            📸 Instagram
                        </a>
                    </div>
                    <button
                        onClick={onSignOut}
                        className="cuenta-bloqueada-btn secondary"
                        style={{ padding: '10px' }}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CuentaBloqueada;
