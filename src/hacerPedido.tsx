import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, query, where, addDoc } from "firebase/firestore";
import CarritoPedidos from "./carritoPedidos";

interface Producto {
    id_doc: string;
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
}

export const HacerPedido = () => {
    const [menuList, setMenuList] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<Producto[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const params = new URLSearchParams(window.location.search);
    const usuarioId = params.get("usuario");
    const mesaId = params.get("mesa");

    useEffect(() => {
        if (!usuarioId) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, "menu"), where("usuarioId", "==", usuarioId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Producto[] = [];
            snapshot.forEach((doc) => {
                items.push({
                    id_doc: doc.id,
                    id: doc.data().id,
                    nombre: doc.data().nombre,
                    precio: doc.data().precio,
                    descripcion: doc.data().descripcion,
                });
            });
            items.sort((a, b) => a.id - b.id);
            setMenuList(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [usuarioId]);

    const addToCart = (producto: Producto) => {
        setCart([...cart, producto]);
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const completeOrder = async () => {
        if (cart.length === 0) return;

        try {
            await addDoc(collection(db, "pedidos"), {
                usuarioId,
                mesaId,
                items: cart.map(item => ({
                    id_doc: item.id_doc,
                    nombre: item.nombre,
                    precio: item.precio
                })),
                total: cart.reduce((sum, item) => sum + item.precio, 0),
                estado: "pendiente",
                fecha: new Date().toISOString(),
            });

            setCart([]);
            setIsCartOpen(false);
            alert("Pedido realizado con éxito!");
        } catch (error) {
            console.error("Error al realizar el pedido:", error);
            alert("Hubo un error al procesar tu pedido.");
        }
    };

    if (!usuarioId || !mesaId) {
        return <div><p>Enlace inválido. Escanea el QR de tu mesa.</p></div>;
    }

    if (loading) {
        return <div><p>Cargando menú...</p></div>;
    }

    return (
        <div className="app">
            <header className="menu-header">
                <h1>Foodsoft</h1>
                <button className="cart-toggle" onClick={() => setIsCartOpen(true)}>
                    🛒 <span>{cart.length}</span>
                </button>
            </header>
            
            <h2>Menú</h2>
            {menuList.length === 0 ? (
                <p>No hay productos en el menú.</p>
            ) : (
                <ul className="menu-list">
                    {menuList.map((producto) => (
                        <li key={producto.id_doc} className="menu-item">
                            <strong>{producto.nombre}</strong> — ${producto.precio.toFixed(2)}
                            <br />
                            <span>{producto.descripcion}</span>
                            <button 
                                className="add-button" 
                                onClick={() => addToCart(producto)}
                            >
                                Pedir
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {isCartOpen && (
                <CarritoPedidos 
                    cart={cart} 
                    onClose={() => setIsCartOpen(false)} 
                    onRemove={removeFromCart}
                    onComplete={completeOrder}
                />
            )}
        </div>
    );
};

export default HacerPedido;
