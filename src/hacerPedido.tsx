import { useState, useEffect } from "react";
import { db, formatPrecio } from "./firebase";
import { collection, onSnapshot, query, where, addDoc } from "firebase/firestore";
import CarritoPedidos, { type CartItem } from "./carritoPedidos";
import "./hacerPedido.css";

interface Producto {
    id_doc: string;
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
    imagen?: string;
}

export const HacerPedido = () => {
    const [menuList, setMenuList] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const params = new URLSearchParams(window.location.search);
    const usuarioId = params.get("usuario");
    const mesaId = params.get("mesa");

    const storageKey = `foodsoft_cart_${usuarioId}_${mesaId}`;

    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(cart));
        } catch (e) {
            console.error("Error saving cart to localStorage:", e);
        }
    }, [cart, storageKey]);

    useEffect(() => {
        if (!usuarioId) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, "menu"), where("usuarioId", "==", usuarioId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Producto[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                items.push({
                    id_doc: doc.id,
                    id: data.id,
                    nombre: data.nombre,
                    precio: data.precio,
                    descripcion: data.descripcion,
                    imagen: data.imagen || "",
                });
            });
            items.sort((a, b) => a.id - b.id);
            setMenuList(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [usuarioId]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const addToCart = (producto: Producto) => {
        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex(item => item.product.id_doc === producto.id_doc);
            if (existingIndex > -1) {
                const updated = [...prevCart];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + 1
                };
                return updated;
            } else {
                return [...prevCart, { product: producto, quantity: 1 }];
            }
        });
        showToast(`Añadido: ${producto.nombre}`);
    };

    const updateQuantity = (id_doc: string, delta: number) => {
        setCart((prevCart) => {
            return prevCart.map(item => {
                if (item.product.id_doc === id_doc) {
                    const newQty = item.quantity + delta;
                    return newQty > 0 ? { ...item, quantity: newQty } : null;
                }
                return item;
            }).filter(Boolean) as CartItem[];
        });
    };

    const completeOrder = async (nota: string) => {
        if (cart.length === 0) return;

        try {
            const totalAmount = cart.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);
            await addDoc(collection(db, "pedidos"), {
                usuarioId,
                mesaId,
                items: cart.map(item => ({
                    id_doc: item.product.id_doc,
                    nombre: item.product.nombre,
                    precio: item.product.precio,
                    cantidad: item.quantity
                })),
                total: totalAmount,
                estado: "pendiente",
                nota: nota,
                fecha: new Date().toISOString(),
            });

            setCart([]);
            localStorage.removeItem(storageKey);
            setIsCartOpen(false);
            showToast("¡Pedido realizado con éxito!");
        } catch (error) {
            console.error("Error al realizar el pedido:", error);
            showToast("Hubo un error al procesar tu pedido. Inténtalo de nuevo.");
        }
    };

    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (!usuarioId || !mesaId) {
        return (
            <div className="error-screen">
                <div className="error-card">
                    <h2>Enlace Inválido</h2>
                    <p>Por favor, escanee nuevamente el código QR ubicado en su mesa.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <ul className="menu-list" style={{ width: '100%', maxWidth: '900px' }}>
                    {[1, 2, 3, 4].map((i) => (
                        <li key={i} className="skeleton-item">
                            <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
                            <div className="skeleton" style={{ height: '20px', width: '80%' }}></div>
                            <div className="skeleton" style={{ height: '40px', width: '100%', marginTop: 'auto' }}></div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className="app">
            <header className="menu-header">
                <div className="header-brand">
                    <h1>Foodsoft<span>.</span></h1>
                    <span className="table-badge">Mesa {mesaId}</span>
                </div>
                <button className="cart-toggle" onClick={() => setIsCartOpen(true)}>
                    <span>Ver Pedido</span>
                    <span className="cart-badge">{totalItemsCount}</span>
                </button>
            </header>

            <section className="menu-section">
                <h2>Nuestra Carta</h2>
                {menuList.length === 0 ? (
                    <p className="no-items">El menú se está actualizando. Por favor, consulte con su camarero.</p>
                ) : (
                    <ul className="menu-list">
                        {menuList.map((producto) => (
                            <li key={producto.id_doc} className="menu-item">
                                {producto.imagen && (
                                    <div className="menu-item-image-wrapper">
                                        <img src={producto.imagen} alt={producto.nombre} className="menu-item-image" />
                                    </div>
                                )}
                                <div className="menu-item-content">
                                    <div className="menu-item-header">
                                        <strong>{producto.nombre}</strong>
                                         <span className="menu-item-price">${formatPrecio(producto.precio)}</span>
                                    </div>
                                    <span className="menu-item-description">{producto.descripcion}</span>
                                </div>
                                <button
                                    className="add-button"
                                    onClick={() => addToCart(producto)}
                                >
                                    Añadir al Pedido
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {isCartOpen && (
                <CarritoPedidos
                    cart={cart}
                    onClose={() => setIsCartOpen(false)}
                    onUpdateQuantity={updateQuantity}
                    onComplete={completeOrder}
                />
            )}

            {toastMessage && (
                <div className="toast-notification">
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
};

export default HacerPedido;
