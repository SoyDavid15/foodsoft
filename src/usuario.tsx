import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./usuario.css";

interface Usuario {
    nombre: string;
    direccion?: string;
    telefono?: string;
    tipo?: string;
    estado?: string;
    plan?: string;
    fechaVencimiento?: string;
    fechaProximoPago?: string;
}

interface Props {
    setView?: (view: string) => void;
}

export const usuario = ({ setView }: Props) => {
    const [datosUsuario, setDatosUsuario] = useState<Usuario | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const docRef = doc(db, "usuarios", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setDatosUsuario(docSnap.data() as Usuario);
                    }
                } catch (error) {
                    console.error("Error al obtener datos del usuario:", error);
                }
            } else {
                setDatosUsuario(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const cambiarPlan = async (nuevoPlan: string) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const docRef = doc(db, "usuarios", user.uid);
            const today = new Date();
            const trialEndDate = new Date(today);
            trialEndDate.setDate(today.getDate() + 30);
            const formattedDate = trialEndDate.toISOString().split('T')[0];

            const updates: any = {
                plan: nuevoPlan,
                fechaVencimiento: nuevoPlan === 'pro' ? formattedDate : null
            };

            await updateDoc(docRef, updates);
            setDatosUsuario(prev => prev ? { ...prev, ...updates } : null);
            alert(`Has cambiado exitosamente a la ${nuevoPlan === 'pro' ? 'versión Pro 🚀' : 'versión Gratis 🌟'}`);
        } catch (error) {
            console.error("Error al cambiar de plan:", error);
            alert("Error al cambiar de plan");
        }
    };

    const cerrarSesion = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error(error);
        }
    }

    if (!datosUsuario) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                <p>Cargando información del usuario...</p>
            </div>
        );
    }

    const esPro = datosUsuario.plan === 'pro';

    return (
        <div className="usuario-container">
            <div className="usuario-header">
                <h2>Perfil del Usuario</h2>
            </div>
            
            <div className="usuario-grid">
                <div className="usuario-card-item">
                    <p className="usuario-card-label">Nombre del Negocio</p>
                    <p className="usuario-card-value">{datosUsuario.nombre}</p>
                </div>
                
                <div className="usuario-card-item">
                    <p className="usuario-card-label">Versión del Sistema</p>
                    <p className="usuario-card-value" style={{ color: esPro ? '#2563eb' : '#059669' }}>
                        {esPro ? '🚀 Versión Pro' : '🌟 Versión Gratis'}
                    </p>
                </div>

                <div className="usuario-card-item">
                    <p className="usuario-card-label">Estado de Cuenta</p>
                    <p className="usuario-card-value" style={{ color: datosUsuario.estado === 'activo' ? '#059669' : '#dc2626' }}>
                        {datosUsuario.estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                    </p>
                </div>

                <div className="usuario-card-item">
                    <p className="usuario-card-label">Dirección</p>
                    <p className="usuario-card-value">{datosUsuario.direccion || 'No especificada'}</p>
                </div>

                <div className="usuario-card-item">
                    <p className="usuario-card-label">Teléfono</p>
                    <p className="usuario-card-value">{datosUsuario.telefono || 'No especificado'}</p>
                </div>

                {esPro && (
                    <div className="usuario-card-item">
                        <p className="usuario-card-label">Vencimiento de Suscripción</p>
                        <p className="usuario-card-value">{datosUsuario.fechaVencimiento || 'N/A'}</p>
                    </div>
                )}
            </div>

            <div className="usuario-plan-actions" style={{ marginTop: '1.5rem' }}>
                {!esPro ? (
                    <button 
                        onClick={() => {
                            if (setView) {
                                setView('contacto-pro');
                            }
                        }}
                        className="usuario-plan-btn pro"
                    >
                        🚀 Cambiar a versión Pro
                    </button>
                ) : (
                    <button 
                        onClick={() => cambiarPlan('gratis')}
                        className="usuario-plan-btn gratis"
                    >
                        🌟 Cambiar a versión Gratis
                    </button>
                )}
            </div>

            <button 
                onClick={cerrarSesion}
                className="usuario-logout-btn"
            >
                Cerrar sesión
            </button>
        </div>
    )
}

export default usuario
