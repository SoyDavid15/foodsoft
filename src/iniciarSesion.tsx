import { auth } from "./firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import "./iniciarSesion.css"


export const IniciarSesion = () => {

    const entrarConGooogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="iniciar-sesion-page">
            <div className="bienvenida">
                <h2>FOODSOFT</h2>
                <p>Software para gestion de pedidos de restaurantes y cafeterias</p>
            </div>
            <div className="iniciar-sesion-container">
                <div className="iniciar-sesion-content">
                    <p className="iniciar-sesion-text">Inicia sesión o regístrate para comenzar</p>
                    <div className="iniciar-sesion-buttons">
                        <button onClick={entrarConGooogle}>Registrarse/Iniciar sesión con Google</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IniciarSesion;