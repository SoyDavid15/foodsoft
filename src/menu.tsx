import { db, auth } from './firebase';
import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, where } from "firebase/firestore";
import './menu.css';

interface Producto {
    id_doc: string;
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
    imagen: string;
}

interface Props {
    setView: (view: string) => void;
}

export const Menu = ({ setView }: Props) => {

    const [status, setStatus] = useState("");
    const [menuList, setMenuList] = useState<Producto[]>([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [nuevoPrecio, setNuevoPrecio] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [imagen, setImagen] = useState("");
    const [imageFileName, setImageFileName] = useState("");

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, "menu"), where("usuarioId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const menuArray: Producto[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                menuArray.push({
                    id_doc: doc.id,
                    id: data.id,
                    nombre: data.nombre,
                    precio: data.precio,
                    descripcion: data.descripcion,
                    imagen: data.imagen || ""
                });
            });
            menuArray.sort((a, b) => a.id - b.id);
            setMenuList(menuArray);
        });

        return () => unsubscribe();
    }, []);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 600;
                    const MAX_HEIGHT = 600;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                    resolve(dataUrl);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFileName(file.name);
            try {
                setStatus("Comprimiendo imagen...");
                const compressedDataUrl = await compressImage(file);
                setImagen(compressedDataUrl);
                setStatus("");
            } catch (error) {
                console.error("Error compressing image:", error);
                setStatus("Error al procesar la imagen");
            }
        }
    };

    const guardarProducto = async () => {
        if (!nuevoNombre || !nuevoPrecio || !descripcion || !imagen) {
            setStatus("Por favor, complete todos los campos y sube una foto del producto");
            return;
        }

        const precioNum = parseFloat(nuevoPrecio);
        if (isNaN(precioNum) || precioNum <= 0) {
            setStatus("El precio debe ser un número válido y mayor a 0");
            return;
        }

        const descripcionValida = descripcion.trim();
        if (!descripcionValida) {
            setStatus("La descripción no puede estar vacía");
            return;
        }

        setStatus("Guardando...");
        try {
            const nextId = menuList.length > 0
                ? Math.max(...menuList.map(m => m.id)) + 1
                : 1;

            const user = auth.currentUser;
            if (!user) {
                setStatus("Error: Usuario no autenticado");
                return;
            }

            const collectionRef = collection(db, "menu");
            await addDoc(collectionRef, {
                nombre: nuevoNombre,
                precio: precioNum,
                descripcion: descripcionValida,
                imagen: imagen,
                id: nextId,
                usuarioId: user.uid
            });
            setStatus(`Producto "${nuevoNombre}" guardado exitosamente!`);
            alert(`Producto "${nuevoNombre}" guardado exitosamente`);
            setNuevoNombre("");
            setNuevoPrecio("");
            setDescripcion("");
            setImagen("");
            setImageFileName("");
        } catch (error: any) {
            console.error(error);
            setStatus("Error al guardar: " + error.message);
        }
    };

    const eliminarProducto = async (id_doc: string) => {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
        if (confirmar) {
            try {
                await deleteDoc(doc(db, "menu", id_doc));
                setStatus("Producto eliminado correctamente");
            } catch (error: any) {
                console.error(error);
                setStatus("Error al eliminar: " + error.message);
            }
        }
    };

    return (
        <div className="menu-container">
            <h2>Gestión del Menú</h2>

            <div className="add-product-container">
                <h3>Agregar Nuevo Producto</h3>
                <div className='menu-add'>
                    <input
                        type="text"
                        placeholder="Nombre del producto"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Precio"
                        value={nuevoPrecio}
                        onChange={(e) => setNuevoPrecio(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Descripción"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                    <div className="file-input-wrapper">
                        <label className="file-input-label">
                            {imageFileName ? `📁 ${imageFileName}` : "📷 Subir Foto del Producto *"}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                </div>
                {imagen && (
                    <div className="image-preview-container">
                        <img src={imagen} alt="Vista previa" className="image-preview" />
                    </div>
                )}
                <button onClick={guardarProducto} className='menu-add-button'>
                    Guardar Producto
                </button>
                {status && (
                    <p className={`status-message ${status.includes('Error') || status.includes('Por favor') || status.includes('El precio') || status.includes('La descripción') || status.includes('procesar') ? 'error' : 'success'}`}>
                        {status}
                    </p>
                )}
            </div>

            <div className='menu-list'>
                {menuList.map((producto) => (
                    <div className='menu-card' key={producto.id_doc}>
                        {producto.imagen && (
                            <div className="menu-card-image-wrapper">
                                <img src={producto.imagen} alt={producto.nombre} className="menu-card-image" />
                            </div>
                        )}
                        <h3 className='menu-card-title'>{producto.nombre}</h3>
                        <p className='menu-card-info'>ID: {producto.id}</p>
                        <p className='menu-card-price'>${producto.precio.toFixed(2)}</p>
                        <p className='menu-card-description'>{producto.descripcion}</p>
                        <div className="menu-card-actions">
                            <button className='menu-card-btn edit' onClick={() => setView("pedidos")}>Editar</button>
                            <button className='menu-card-btn delete' onClick={() => eliminarProducto(producto.id_doc)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Menu;
