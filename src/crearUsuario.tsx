import { useState } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import "./crearUsuario.css";

interface Props {
    onCompletado?: () => void;
}

export const crearUsuario = ({ onCompletado }: Props) => {
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [tipo, setTipo] = useState('');
    const [plan, setPlan] = useState('gratis');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !pin) {
            alert("Por favor, ingresa un nombre de usuario y un PIN.");
            return;
        }

        if (pin.length < 4) {
            alert("El PIN debe tener al menos 4 dígitos.");
            return;
        }

        try {
            const user = auth.currentUser;
            if (user) {
                const today = new Date();
                const trialEndDate = new Date(today);
                trialEndDate.setDate(today.getDate() + 30);
                
                const formattedDate = trialEndDate.toISOString().split('T')[0];

                await setDoc(doc(db, "usuarios", user.uid), {
                    username,
                    pin,
                    nombre,
                    direccion,
                    telefono,
                    tipo,
                    plan,
                    estado: 'activo',
                    fechaVencimiento: plan === 'pro' ? formattedDate : null,
                    userEmail: user.email,
                    createdAt: new Date().toISOString()
                }, { merge: true });

                if (onCompletado) {
                    onCompletado();
                }
            } else {
                alert("No hay un usuario autenticado");
            }
        } catch (error) {
            console.error("Error al guardar los datos:", error);
            alert("Error al guardar los datos");
        }
    };

    return (
        <div className="crear-usuario-container">
            <h2>Crear Usuario Administrador</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                Es tu primera vez aquí. Configura tu usuario administrador y los datos de tu negocio para comenzar.
            </p>
            <form onSubmit={handleSubmit} className="crear-usuario-form">
                <label htmlFor="username">Nombre de usuario</label>
                <input id="username" type="text" placeholder="Ej: admin_local" value={username} onChange={e => setUsername(e.target.value)} required />

                <label htmlFor="pin">PIN de acceso (4 a 6 dígitos)</label>
                <input id="pin" type="password" placeholder="Ej: 1234" value={pin} onChange={e => setPin(e.target.value)} maxLength={6} required />

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
                        <div className="plan-desc">Por defecto. Sin bloqueos por vencimiento.</div>
                    </div>
                    <div 
                        className={`plan-option ${plan === 'pro' ? 'selected' : ''}`}
                        onClick={() => setPlan('pro')}
                    >
                        <div className="plan-title">🚀 Versión Pro</div>
                        <div className="plan-desc">Funcionalidades avanzadas (30 días de prueba).</div>
                    </div>
                </div>

                <div className="form-buttons">
                    <button type="submit" className="btn-submit">
                        Crear Usuario Administrador
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
    )
}

export default crearUsuario;