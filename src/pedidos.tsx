import { useState, useEffect, useRef } from "react";
import { db, getActiveUsuarioId, formatPrecio } from "./firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, writeBatch, getDocs } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
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
    nota?: string;
    fecha: string;
}

const NoteDisplay = ({ text }: { text: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 60; // Truncate at 60 chars

    if (text.length <= maxLength) {
        return (
            <div className="order-note-display">
                <strong>Nota:</strong> {text}
            </div>
        );
    }

    return (
        <div className={`order-note-display ${isExpanded ? 'expanded' : ''}`}>
            <div className="note-content">
                <strong>Nota:</strong> {isExpanded ? text : `${text.slice(0, maxLength)}...`}
            </div>
            <button 
                className="show-more-btn" 
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? "Ver menos ▲" : "Ver más ▼"}
            </button>
        </div>
    );
};

export const Pedidos = ({ mesa }: { mesa: Mesa | null }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [showPaidHistory, setShowPaidHistory] = useState(true);
    const usuarioId = getActiveUsuarioId();
    const qrRef = useRef<HTMLCanvasElement>(null);

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

    const deducirInventarioPorPedido = async (order: Order) => {
        if (!usuarioId) return;
        try {
            const invQuery = query(collection(db, "inventario"), where("usuarioId", "==", usuarioId));
            const invSnapshot = await getDocs(invQuery);
            const batch = writeBatch(db);

            invSnapshot.forEach((invDoc) => {
                const invData = invDoc.data();
                const invNombre = (invData.nombre || "").trim().toLowerCase();

                const matchingOrderItem = order.items.find(
                    (oi) => (oi.nombre || "").trim().toLowerCase() === invNombre
                );

                if (matchingOrderItem) {
                    const qtySold = (matchingOrderItem as any).cantidad || 1;
                    const currentStock = invData.cantidad || 0;
                    const newStock = Math.max(0, currentStock - qtySold);
                    batch.update(invDoc.ref, { cantidad: newStock });
                }
            });

            await batch.commit();
        } catch (error) {
            console.error("Error al deducir inventario:", error);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const orderRef = doc(db, "pedidos", orderId);
            await updateDoc(orderRef, { estado: newStatus });

            if (newStatus === "pagado") {
                const targetOrder = orders.find(o => o.id === orderId);
                if (targetOrder) {
                    await deducirInventarioPorPedido(targetOrder);
                }
            }
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const imprimirTicket = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
                <head>
                    <title>Ticket - Mesa ${mesa?.nombre}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; font-size: 14px; width: 300px; margin: 0 auto; padding: 20px; color: #000; }
                        h2 { text-align: center; margin-bottom: 5px; }
                        p { text-align: center; margin-top: 0; font-size: 12px; }
                        .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
                        .item-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                        .total-row { display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; font-size: 16px; }
                        .footer { text-align: center; margin-top: 20px; font-size: 11px; }
                    </style>
                </head>
                <body>
                    <h2>FOODSOFT</h2>
                    <p>Comanda / Ticket de Venta</p>
                    <div class="divider"></div>
                    <p><strong>Mesa:</strong> ${mesa?.nombre}</p>
                    <p><strong>Fecha:</strong> ${new Date(order.fecha).toLocaleString()}</p>
                    <div class="divider"></div>
                    <div>
                        ${order.items.map(i => `
                            <div class="item-row">
                                <span>${(i as any).cantidad || 1}x ${i.nombre}</span>
                                 <span>$${formatPrecio((i.precio) * ((i as any).cantidad || 1))}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="divider"></div>
                    <div class="total-row">
                        <span>TOTAL:</span>
                        <span>$${formatPrecio(order.total)}</span>
                    </div>
                    ${order.nota ? `<p><strong>Nota:</strong> ${order.nota}</p>` : ''}
                    <div class="divider"></div>
                    <div class="footer">
                        ¡Gracias por su visita!<br/>
                        Powered by Foodsoft
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
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

    const downloadQRCode = () => {
        const canvas = qrRef.current;
        if (!canvas) return;

        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
        
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_Mesa_${mesa?.nombre || "Mesa"}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    if (!mesa || !usuarioId) {
        return <div><p>No se ha seleccionado ninguna mesa.</p></div>;
    }

    const url = `${window.location.origin}/hacer-pedido?mesa=${mesa.id_doc}&usuario=${usuarioId}`;

    const activeOrders = orders.filter(o => o.estado !== "pagado");
    const paidOrders = orders.filter(o => o.estado === "pagado");

    const groupedPaidOrders: { [dateStr: string]: Order[] } = {};
    paidOrders.forEach(order => {
        if (!order.fecha) return;
        const d = new Date(order.fecha);
        const dateStr = d.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        if (!groupedPaidOrders[formattedDate]) {
            groupedPaidOrders[formattedDate] = [];
        }
        groupedPaidOrders[formattedDate].push(order);
    });

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

                {/* Active Orders Section */}
                <div className="orders-subsection">
                    <h4 className="subsection-title">Pedidos Activos ({activeOrders.length})</h4>
                    {activeOrders.length === 0 ? (
                        <p className="no-orders">No hay pedidos activos para esta mesa.</p>
                    ) : (
                        <div className="orders-list">
                            {activeOrders.map((order) => (
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
                                                    <span>{(item as any).cantidad || 1}x {item.nombre}</span>
                                                    <span>${(item.precio * ((item as any).cantidad || 1)).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="order-total">
                                            <strong>Total: ${order.total.toFixed(2)}</strong>
                                            <span className={`status-badge ${order.estado}`}>
                                                {order.estado.toUpperCase()}
                                            </span>
                                        </div>
                                        {order.nota && <NoteDisplay text={order.nota} />}
                                    </div>
                                    <div className="order-actions">
                                        <button 
                                            className="action-btn print"
                                            onClick={() => imprimirTicket(order)}
                                            title="Imprimir Ticket / Comanda"
                                        >
                                            🖨️
                                        </button>
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

                {/* Paid Orders History Section */}
                {paidOrders.length > 0 && (
                    <div className="history-section">
                        <div className="history-header" onClick={() => setShowPaidHistory(!showPaidHistory)}>
                            <h4 className="subsection-title">Historial de Pedidos Pagados ({paidOrders.length})</h4>
                            <button className="show-more-btn">
                                {showPaidHistory ? "Ocultar ▲" : "Mostrar ▼"}
                            </button>
                        </div>
                        {showPaidHistory && (
                            <div className="history-groups">
                                {Object.entries(groupedPaidOrders).map(([dateLabel, dateOrders]) => (
                                    <div key={dateLabel} className="history-date-group">
                                        <h5 className="history-date-title">
                                            📅 {dateLabel} <span className="date-count">({dateOrders.length} {dateOrders.length === 1 ? 'pedido' : 'pedidos'})</span>
                                        </h5>
                                        <div className="orders-list">
                                            {dateOrders.map((order) => (
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
                                                                     <span>{(item as any).cantidad || 1}x {item.nombre}</span>
                                                                     <span>${formatPrecio(item.precio * ((item as any).cantidad || 1))}</span>
                                                                 </div>
                                                             ))}
                                                        </div>
                                                        <div className="order-total">
                                                            <strong>Total: ${formatPrecio(order.total)}</strong>
                                                            <span className={`status-badge ${order.estado}`}>
                                                                {order.estado.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        {order.nota && <NoteDisplay text={order.nota} />}
                                                    </div>
                                                    <div className="order-actions">
                                                        <button 
                                                            className="action-btn print"
                                                            onClick={() => imprimirTicket(order)}
                                                            title="Imprimir Ticket"
                                                        >
                                                            🖨️
                                                        </button>
                                                        <button 
                                                            className="action-btn delete-single"
                                                            onClick={() => deleteOrder(order.id)}
                                                            title="Eliminar del historial"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="qr-section">
                <h3>QR Menú</h3>
                <p>Escanea para pedir:</p>
                <div className="qr-box">
                    <QRCodeCanvas 
                        ref={qrRef} 
                        value={url} 
                        size={180} 
                        level="H" 
                        includeMargin={true}
                    />
                </div>
                <button 
                    className="download-qr-btn" 
                    onClick={downloadQRCode}
                    title="Descargar código QR"
                >
                    <span className="btn-icon">📥</span>
                    Descargar QR
                </button>
                <p className="url-text">{url}</p>
            </div>
        </div>
    );
};

export default Pedidos;
