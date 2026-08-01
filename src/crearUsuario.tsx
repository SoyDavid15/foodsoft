import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import "./crearUsuario.css";

declare global {
    interface Window {
        WidgetCheckout: any;
    }
}

interface Props {
    onCompletado?: () => void;
}

export const crearUsuario = ({ onCompletado }: Props) => {
    const [username, setUsername] = useState('');
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [tipo, setTipo] = useState('');
    const [plan, setPlan] = useState('gratis');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !nombre || !direccion || !telefono || !tipo) {
            alert("Por favor, completa todos los campos del usuario y del negocio.");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            alert("No hay un usuario autenticado");
            return;
        }

        if (plan === 'pro') {
            setLoadingPayment(true);
            try {
                const reference = `PRO-${user.uid}-${Date.now()}`;
                const amount = 69000;
                const currency = "COP";
                const customerEmail = user.email || "cliente@foodsoft.co";

                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
                const response = await fetch(`${apiUrl}/api/v1/payments/create-intent`, {
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

                    checkout.open(async function (result: any) {
                        const transaction = result.transaction;
                        if (transaction && transaction.status === "APPROVED") {
                            try {
                                const today = new Date();
                                const trialEndDate = new Date(today);
                                trialEndDate.setDate(today.getDate() + 30);
                                const formattedDate = trialEndDate.toISOString().split('T')[0];

                                await setDoc(doc(db, "usuarios", user.uid), {
                                    username,
                                    nombre,
                                    direccion,
                                    telefono,
                                    tipo,
                                    plan: 'pro',
                                    estado: 'activo',
                                    fechaVencimiento: formattedDate,
                                    userEmail: user.email,
                                    createdAt: new Date().toISOString()
                                }, { merge: true });

                                alert("¡Pago aprobado y cuenta Pro activada con éxito 🚀!");
                                if (onCompletado) onCompletado();
                            } catch (err) {
                                console.error("Error al guardar datos tras pago Pro:", err);
                                alert("Pago aprobado, pero hubo un error al guardar la cuenta en la base de datos.");
                            }
                        } else if (transaction && transaction.status === "PENDING") {
                            alert("Tu pago se encuentra pendiente de confirmación.");
                        } else {
                            alert("El pago no pudo completarse o fue rechazado.");
                        }
                        setLoadingPayment(false);
                    });
                } else {
                    alert("El widget de pagos de Wompi no cargó correctamente.");
                    setLoadingPayment(false);
                }
            } catch (error) {
                console.error("Error al procesar pago:", error);
                alert("Error al procesar el pago con Wompi. Verifique que el backend esté activo.");
                setLoadingPayment(false);
            }
        } else {
            try {
                await setDoc(doc(db, "usuarios", user.uid), {
                    username,
                    nombre,
                    direccion,
                    telefono,
                    tipo,
                    plan: 'gratis',
                    estado: 'activo',
                    fechaVencimiento: null,
                    userEmail: user.email,
                    createdAt: new Date().toISOString()
                }, { merge: true });

                if (onCompletado) {
                    onCompletado();
                }
            } catch (error) {
                console.error("Error al guardar los datos:", error);
                alert("Error al guardar los datos");
            }
        }
    };

    return (
        <div className="crear-usuario-container">
            <h2>Configuración del Negocio</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                Es tu primera vez aquí. Configura los datos de tu negocio y usuario para comenzar.
            </p>
            <form onSubmit={handleSubmit} className="crear-usuario-form">
                <label htmlFor="username">Nombre de usuario</label>
                <input id="username" type="text" placeholder="Ej: admin_local" value={username} onChange={e => setUsername(e.target.value)} required />

                <label htmlFor="nombre">Nombre del negocio</label>
                <input id="nombre" type="text" placeholder="Ej: Mi Restaurante" value={nombre} onChange={e => setNombre(e.target.value)} required />
                
                <label htmlFor="direccion">Dirección</label>
                <input id="direccion" type="text" placeholder="Ej: Calle 123 #45-67" value={direccion} onChange={e => setDireccion(e.target.value)} required />
                
                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" type="text" placeholder="Ej: 3001234567" value={telefono} onChange={e => setTelefono(e.target.value)} required />
                
                <label htmlFor="tipo">Tipo de negocio</label>
                <input id="tipo" type="text" placeholder="Ej: Restaurante, Cafetería" value={tipo} onChange={e => setTipo(e.target.value)} required />

                <label>Versión del sistema</label>
                <div className="plan-selector">
                    <div 
                        className={`plan-option ${plan === 'gratis' ? 'selected' : ''}`}
                        onClick={() => setPlan('gratis')}
                    >
                        <div className="plan-title">🌟 Versión Gratis</div>
                        <div className="plan-desc">Funcionalidades básicas sin costo.</div>
                    </div>
                    <div 
                        className={`plan-option ${plan === 'pro' ? 'selected' : ''}`}
                        onClick={() => setPlan('pro')}
                    >
                        <div className="plan-title">🚀 Versión Pro ($69.000 COP)</div>
                        <div className="plan-desc">Acceso ilimitado a través de pasarela Wompi.</div>
                    </div>
                </div>

                <div className="form-buttons">
                    <button type="submit" className="btn-submit" disabled={loadingPayment}>
                        {loadingPayment ? 'Conectando con Wompi...' : (plan === 'pro' ? '💳 Pagar y Activar Versión Pro' : 'Guardar y Continuar')}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => auth.signOut()} 
                        className="btn-back"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </form>
        </div>
    );
};

export default crearUsuario;
