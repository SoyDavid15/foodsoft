import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import "./pedidos.css";

interface Mesa {
    id_doc: string;
    id: number;
    nombre: string;
}

interface OrderItem {
    id_doc: string;
    nombre: string;
    precio: number;
}

interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    estado: string;
    fecha: string;
}

export const Pedidos = ({ mesa }: { mesa: Mesa | null }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const usuarioId = auth.currentUser?.uid;

    useEffect(() => {
        if (!mesa || !usuarioId) return;

        const q = query(
            collection(db, "pedidos"),
            where("mesaId", "==", mesa.id_doc),
            where("usuarioId", "==", usuarioId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Order[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as Order);
            });
            // Sort by date descending
            items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            setOrders(items);
        });

        return () => unsubscribe();
    }, [mesa, usuarioId]);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const orderRef = doc(db, "pedidos", orderId);
            await updateDoc(orderRef, { estado: newStatus });
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const deleteOrder = async (orderId: string) => {
        if (!window.confirm("¿Estás seguro de que deseas borrar este pedido?")) return;
        try {
            await deleteDoc(doc(db, "pedidos", orderId));
            setSelectedOrders(prev => prev.filter(id => id !== orderId));
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    };

    const bulkUpdateStatus = async (newStatus: string) => {
        if (selectedOrders.length === 0) return;
        try {
            const batch = writeBatch(db);
            selectedOrders.forEach((id) => {
                const ref = doc(db, "pedidos", id);
                batch.update(ref, { estado: newStatus });
            });
            await batch.commit();
            setSelectedOrders([]);
        } catch (error) {
            console.error("Error in bulk update:", error);
        }
    };

    const bulkDelete = async () => {
        if (selectedOrders.length === 0) return;
        if (!window.confirm(`¿Estás seguro de que deseas borrar ${selectedOrders.length} pedidos?`)) return;
        try {
            const batch = writeBatch(db);
            selectedOrders.forEach((id) => {
                const ref = doc(db, "pedidos", id);
                batch.delete(ref);
            });
            await batch.commit();
            setSelectedOrders([]);
        } catch (error) {
            console.error("Error in bulk delete:", error);
        }
    };

    const toggleSelection = (orderId: string) => {
        setSelectedOrders(prev => 
            prev.includes(orderId) 
                ? prev.filter(id => id !== orderId) 
                : [...prev, orderId]
        );
    };

    if (!mesa || !usuarioId) {
        return <div><p>No se ha seleccionado ninguna mesa.</p></div>;
    }

    const url = `${window.location.origin}/hacer-pedido?mesa=${mesa.id_doc}&usuario=${usuarioId}`;

    return (
        <div className="pedidos-container">
            <div className="orders-section">
                <div className="orders-header">
                    <h3>Pedidos: {mesa.nombre}</h3>
                    {selectedOrders.length > 0 && (
                        <div className="bulk-actions">
                            <span>{selectedOrders.length} seleccionados</span>
                            <button onClick={() => bulkUpdateStatus("listo")} className="bulk-btn listo">Listo</button>
                            <button onClick={() => bulkUpdateStatus("pagado")} className="bulk-btn pagado">Pagado</button>
                            <button onClick={bulkDelete} className="bulk-btn delete">Borrar</button>
                        </div>
                    )}
                </div>

                {orders.length === 0 ? (
                    <p className="no-orders">No hay pedidos registrados para esta mesa.</p>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.id} className={`order-card status-${order.estado} ${selectedOrders.includes(order.id) ? "selected" : ""}`}>
                                <div className="order-selection">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedOrders.includes(order.id)}
                                        onChange={() => toggleSelection(order.id)}
                                    />
                                </div>
                                <div className="order-info">
                                    <div className="order-items-list">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item-row">
                                                <span>{item.nombre}</span>
                                                <span>${item.precio.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-total">
                                        <strong>Total: ${order.total.toFixed(2)}</strong>
                                        <span className={`status-badge ${order.estado}`}>
                                            {order.estado.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="order-actions">
                                    {order.estado === "pendiente" && (
                                        <button 
                                            className="action-btn complete"
                                            onClick={() => updateOrderStatus(order.id, "listo")}
                                        >
                                            Listo
                                        </button>
                                    )}
                                    {order.estado === "listo" && (
                                        <button 
                                            className="action-btn pay"
                                            onClick={() => updateOrderStatus(order.id, "pagado")}
                                        >
                                            Pagado
                                        </button>
                                    )}
                                    <button 
                                        className="action-btn delete-single"
                                        onClick={() => deleteOrder(order.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="qr-section">
                <h3>QR Menú</h3>
                <p>Escanea para pedir:</p>
                <div className="qr-box">
                    <QRCodeSVG value={url} size={180} />
                </div>
                <p className="url-text">{url}</p>
            </div>
        </div>
    );
};

export default Pedidos;

