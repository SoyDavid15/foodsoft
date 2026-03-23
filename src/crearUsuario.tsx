import { useState } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

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
                await setDoc(doc(db, "usuarios", user.uid), {
                    nombre,
                    direccion,
                    telefono,
                    tipo
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
        <div>
            <h2>Crear usuario</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Nombre del negocio" value={nombre} onChange={e => setNombre(e.target.value)} required />
                <input type="text" placeholder="Direccion del negocio" value={direccion} onChange={e => setDireccion(e.target.value)} required />
                <input type="text" placeholder="Telefono del negocio" value={telefono} onChange={e => setTelefono(e.target.value)} required />
                <input type="text" placeholder="Tipo de negocio" value={tipo} onChange={e => setTipo(e.target.value)} required />
                <button type="submit">Crear usuario</button>
            </form>
        </div>
    )
}
