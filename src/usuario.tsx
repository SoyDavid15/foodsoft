import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

interface Usuario {
    nombre: string;
    direccion?: string;
    telefono?: string;
    tipo?: string;
    estado?: string;
    fechaVencimiento?: string;
    fechaProximoPago?: string;
}

export const usuario = () => {
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

    const cerrarSesion = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error(error);
        }
    }

    if (!datosUsuario) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Cargando información del usuario...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '20px' }}>Perfil del Usuario</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 'bold', color: '#4b5563', margin: '0 0 5px 0' }}>Nombre del Negocio</p>
                    <p style={{ fontSize: '1.1rem', margin: 0 }}>{datosUsuario.nombre}</p>
                </div>
                
                <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 'bold', color: '#4b5563', margin: '0 0 5px 0' }}>Estado de Cuenta</p>
                    <p style={{ 
                        fontSize: '1.1rem', 
                        margin: 0, 
                        color: datosUsuario.estado === 'activo' ? '#059669' : '#dc2626',
                        fontWeight: 'bold'
                    }}>
                        {datosUsuario.estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                    </p>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 'bold', color: '#4b5563', margin: '0 0 5px 0' }}>Dirección</p>
                    <p style={{ margin: 0 }}>{datosUsuario.direccion || 'No especificada'}</p>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 'bold', color: '#4b5563', margin: '0 0 5px 0' }}>Teléfono</p>
                    <p style={{ margin: 0 }}>{datosUsuario.telefono || 'No especificado'}</p>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 'bold', color: '#4b5563', margin: '0 0 5px 0' }}>Vencimiento de Suscripción</p>
                    <p style={{ margin: 0 }}>{datosUsuario.fechaVencimiento || 'N/A'}</p>
                </div>
            </div>

            <button 
                onClick={cerrarSesion}
                style={{
                    marginTop: '30px',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                }}
            >
                Cerrar sesión
            </button>
        </div>
    )
}

export default usuario
