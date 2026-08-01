import './cuentaBloqueada.css';
import { useState, useEffect } from 'react';
import { auth } from './firebase';

declare global {
    interface Window {
        WidgetCheckout: any;
    }
}

interface Props {
    onBack: () => void;
}

export const ContactoPro = ({ onBack }: Props) => {
    const telefono = "+57 3046094249";
    const whatsappUrl = "https://wa.me/573046094249?text=Hola,%20deseo%20actualizar%20mi%20cuenta%20en%20Foodsoft%20a%20la%20versión%20Pro.";
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
                        alert("¡Pago aprobado con éxito! Tu cuenta ha sido actualizada a la versión Pro 🚀");
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1.5rem', boxSizing: 'border-box' }}>
            <div className="cuenta-bloqueada-card" style={{ maxWidth: '580px', padding: '2.5rem', textAlign: 'left', alignItems: 'stretch' }}>
                
                {/* Header Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2.5rem', background: '#eff6ff', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        🚀
                    </div>
                    <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.05em' }}>
                            Suscripción Oficial
                        </span>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                            Foodsoft Pro
                        </h1>
                    </div>
                </div>

                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Lleva la gestión de tu restaurante al siguiente nivel. Desbloquea control de inventario en tiempo real, estadísticas financieras avanzadas y mesas ilimitadas.
                </p>

                {/* Pricing Box */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Plan Mensual</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>$50.000 <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>COP / mes</span></div>
                    </div>
                    <div style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                        ✨ Activación Inmediata
                    </div>
                </div>

                {/* Features List */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> Mesas ilimitadas
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> Inventario automático
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> Reportes y Estadísticas
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> Soporte prioritario
                    </div>
                </div>

                {/* Actions */}
                <div className="cuenta-bloqueada-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={handlePagarPro}
                        disabled={loadingPayment}
                        className="cuenta-bloqueada-btn"
                        style={{ background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, padding: '14px', fontSize: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                    >
                        {loadingPayment ? 'Conectando con Wompi...' : '💳 Pagar Seguro con Wompi (Tarjetas, PSE, Nequi)'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cuenta-bloqueada-btn whatsapp"
                            style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }}
                        >
                            💬 WhatsApp ({telefono})
                        </a>
                        <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cuenta-bloqueada-btn instagram"
                            style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }}
                        >
                            📸 Instagram
                        </a>
                    </div>

                    <button
                        onClick={onBack}
                        className="cuenta-bloqueada-btn secondary"
                        style={{ marginTop: '0.5rem', padding: '12px' }}
                    >
                        ← Volver al Perfil
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ContactoPro;
