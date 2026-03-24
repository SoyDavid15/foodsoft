import { useState } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import "./crearUsuario.css";

interface Props {
    onCompletado?: () => void;
}

export const crearUsuario = ({ onCompletado }: Props) => {
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [tipo, setTipo] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (user) {
                // Calculate default dates (30 days from today)
                const today = new Date();
                const trialEndDate = new Date(today);
                trialEndDate.setDate(today.getDate() + 30);
                
                const formattedDate = trialEndDate.toISOString().split('T')[0];

                await setDoc(doc(db, "usuarios", user.uid), {
                    nombre,
                    direccion,
                    telefono,
                    tipo,
                    estado: 'activo', // Default status
                    fechaVencimiento: formattedDate, // 30 days trial
                    userEmail: user.email,
                    createdAt: new Date().toISOString()
                });
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
            <h2>Configuración inicial del negocio</h2>
            <form onSubmit={handleSubmit} className="crear-usuario-form">
                <label htmlFor="nombre">Nombre del negocio</label>
                <input id="nombre" type="text" placeholder="Ej: Mi Restaurante" value={nombre} onChange={e => setNombre(e.target.value)} required />
                
                <label htmlFor="direccion">Dirección</label>
                <input id="direccion" type="text" placeholder="Ej: Calle 123 #45-67" value={direccion} onChange={e => setDireccion(e.target.value)} required />
                
                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" type="text" placeholder="Ej: 3001234567" value={telefono} onChange={e => setTelefono(e.target.value)} required />
                
                <label htmlFor="tipo">Tipo de negocio</label>
                <input id="tipo" type="text" placeholder="Ej: Restaurante, Cafetería" value={tipo} onChange={e => setTipo(e.target.value)} required />

                <div className="form-buttons">
                    <button type="submit" className="btn-submit">
                        Guardar y Continuar
                    </button>
                    <button 
                        type="button" 
                        onClick={() => auth.signOut()} 
                        className="btn-back"
                    >
                        Volver
                    </button>
                </div>
            </form>
        </div>
    )
}
