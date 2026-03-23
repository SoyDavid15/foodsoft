import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

interface Usuario {
    nombre: string;
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

    return (
        <div>
            <h2>Usuario</h2>
            <p>nombre: {datosUsuario ? datosUsuario.nombre : 'Cargando...'}</p>
            <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
    )
}

export default usuario
