import { db, getActiveUsuarioId } from './firebase';
import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, where, updateDoc } from "firebase/firestore";
import './inventario.css';

interface InventarioItem {
    id_doc: string;
    id: number;
    nombre: string;
    cantidad: number;
    unidad: string;
    costo: number;
    categoria: string;
    stockMinimo: number;
}

interface Props {
    setView?: (view: string) => void;
}

export const Inventario = ({}: Props) => {

    const [status, setStatus] = useState("");
    const [inventarioList, setInventarioList] = useState<InventarioItem[]>([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [nuevaCantidad, setNuevaCantidad] = useState("");
    const [nuevaUnidad, setNuevaUnidad] = useState("");
    const [nuevoCosto, setNuevoCosto] = useState("");
    const [nuevaCategoria, setNuevaCategoria] = useState("");
    const [stockMinimo, setStockMinimo] = useState("");
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editCantidad, setEditCantidad] = useState("");

    useEffect(() => {
        const usuarioId = getActiveUsuarioId();
        if (!usuarioId) return;

        const q = query(collection(db, "inventario"), where("usuarioId", "==", usuarioId));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const inventarioArray: InventarioItem[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                inventarioArray.push({
                    id_doc: doc.id,
                    id: data.id,
                    nombre: data.nombre,
                    cantidad: data.cantidad,
                    unidad: data.unidad,
                    costo: data.costo,
                    categoria: data.categoria,
                    stockMinimo: data.stockMinimo || 0
                });
            });
            inventarioArray.sort((a, b) => a.id - b.id);
            setInventarioList(inventarioArray);
        });

        return () => unsubscribe();
    }, []);

    const guardarProducto = async () => {
        if (!nuevoNombre || !nuevaCantidad || !nuevaUnidad || !nuevoCosto || !nuevaCategoria) {
            setStatus("Por favor, complete todos los campos");
            return;
        }

        const cantidadNum = parseFloat(nuevaCantidad);
        const costoNum = parseFloat(nuevoCosto);
        const stockMinimoNum = stockMinimo ? parseFloat(stockMinimo) : 0;

        if (isNaN(cantidadNum) || cantidadNum < 0) {
            setStatus("La cantidad debe ser un número válido");
            return;
        }

        if (isNaN(costoNum) || costoNum < 0) {
            setStatus("El costo debe ser un número válido");
            return;
        }

        setStatus("Guardando...");
        try {
            const nextId = inventarioList.length > 0
                ? Math.max(...inventarioList.map(m => m.id)) + 1
                : 1;

            const usuarioId = getActiveUsuarioId();
            if (!usuarioId) {
                setStatus("Error: Usuario no autenticado");
                return;
            }

            const collectionRef = collection(db, "inventario");
            await addDoc(collectionRef, {
                nombre: nuevoNombre,
                cantidad: cantidadNum,
                unidad: nuevaUnidad,
                costo: costoNum,
                categoria: nuevaCategoria,
                stockMinimo: stockMinimoNum,
                id: nextId,
                usuarioId: usuarioId
            });
            setStatus(`Producto "${nuevoNombre}" guardado exitosamente!`);
            setNuevoNombre("");
            setNuevaCantidad("");
            setNuevaUnidad("");
            setNuevoCosto("");
            setNuevaCategoria("");
            setStockMinimo("");
            setTimeout(() => setStatus(""), 3000);
        } catch (error: any) {
            console.error(error);
            setStatus("Error al guardar: " + error.message);
        }
    };

    const eliminarProducto = async (id_doc: string) => {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este producto del inventario?");
        if (confirmar) {
            try {
                await deleteDoc(doc(db, "inventario", id_doc));
                setStatus("Producto eliminado correctamente");
                setTimeout(() => setStatus(""), 3000);
            } catch (error: any) {
                console.error(error);
                setStatus("Error al eliminar: " + error.message);
            }
        }
    };

    const empezarEdicion = (item: InventarioItem) => {
        setEditingItem(item.id_doc);
        setEditCantidad(item.cantidad.toString());
    };

    const cancelarEdicion = () => {
        setEditingItem(null);
        setEditCantidad("");
    };

    const actualizarCantidad = async (id_doc: string) => {
        const cantidadNum = parseFloat(editCantidad);
        if (isNaN(cantidadNum) || cantidadNum < 0) {
            setStatus("La cantidad debe ser un número válido");
            return;
        }

        try {
            await updateDoc(doc(db, "inventario", id_doc), {
                cantidad: cantidadNum
            });
            setStatus("Cantidad actualizada correctamente");
            setTimeout(() => setStatus(""), 3000);
            cancelarEdicion();
        } catch (error: any) {
            console.error(error);
            setStatus("Error al actualizar: " + error.message);
        }
    };

    const getStockStatus = (item: InventarioItem) => {
        if (item.cantidad === 0) return { clase: 'agotado', texto: 'Agotado' };
        if (item.stockMinimo > 0 && item.cantidad <= item.stockMinimo) return { clase: 'bajo', texto: 'Bajo' };
        if (item.cantidad <= 10) return { clase: 'bajo', texto: 'Bajo' };
        return { clase: 'normal', texto: 'En stock' };
    };

    const categorias = [...new Set(inventarioList.map(item => item.categoria))];
    const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");

    const itemsFiltrados = categoriaActiva === "todas"
        ? inventarioList
        : inventarioList.filter(item => item.categoria === categoriaActiva);

    return (
        <div className="inventario-container">
            <div className="inventario-header-section">
                <div>
                    <h2>Gestión de Inventario</h2>
                    <p>Administra el stock, costos y productos de tu negocio.</p>
                </div>
                <div className="inventario-header-actions">
                    <button className="inventario-button" onClick={() => document.getElementById('add-inventario-form')?.scrollIntoView({ behavior: 'smooth' })}>
                        + Agregar Producto
                    </button>
                </div>
            </div>

            {status && (
                <p className={`status-message ${status.includes('Error') || status.includes('Por favor') || status.includes('El costo') || status.includes('La cantidad') ? 'error' : 'success'}`}>
                    {status}
                </p>
            )}

            <div className="inventario-stats">
                <div className="stat-card total">
                    <span className="stat-label">Total Productos</span>
                    <span className="stat-value">{inventarioList.length}</span>
                </div>
                <div className="stat-card bajo">
                    <span className="stat-label">Stock Bajo</span>
                    <span className="stat-value">{inventarioList.filter(i => (i.stockMinimo > 0 && i.cantidad <= i.stockMinimo) || (i.cantidad <= 10 && i.cantidad > 0)).length}</span>
                </div>
                <div className="stat-card agotado">
                    <span className="stat-label">Agotados</span>
                    <span className="stat-value">{inventarioList.filter(i => i.cantidad === 0).length}</span>
                </div>
            </div>

            <div className="add-inventario-container" id="add-inventario-form">
                <h3>Agregar Producto al Inventario</h3>
                <div className="inventario-add">
                    <input
                        type="text"
                        placeholder="Nombre del producto"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Cantidad (Stock)"
                        value={nuevaCantidad}
                        onChange={(e) => setNuevaCantidad(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Unidad (kg, L, uds...)"
                        value={nuevaUnidad}
                        onChange={(e) => setNuevaUnidad(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Costo unitario ($)"
                        value={nuevoCosto}
                        onChange={(e) => setNuevoCosto(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Categoría"
                        value={nuevaCategoria}
                        onChange={(e) => setNuevaCategoria(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Stock mínimo (opcional)"
                        value={stockMinimo}
                        onChange={(e) => setStockMinimo(e.target.value)}
                    />
                </div>
                <button onClick={guardarProducto} className="inventario-add-button">
                    Guardar Producto
                </button>
            </div>

            {categorias.length > 1 && (
                <div className="categorias-filter">
                    <button
                        className={`categoria-btn ${categoriaActiva === "todas" ? "activa" : ""}`}
                        onClick={() => setCategoriaActiva("todas")}
                    >
                        Todas
                    </button>
                    {categorias.map(cat => (
                        <button
                            key={cat}
                            className={`categoria-btn ${categoriaActiva === cat ? "activa" : ""}`}
                            onClick={() => setCategoriaActiva(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {itemsFiltrados.length === 0 ? (
                <div className="empty-inventario">
                    <p>No tienes productos en el inventario aún.</p>
                </div>
            ) : (
                <div className="inventario-list">
                    {itemsFiltrados.map((item) => {
                        const estado = getStockStatus(item);
                        const costoTotal = item.cantidad * item.costo;
                        return (
                            <div className={`inventario-card ${editingItem === item.id_doc ? 'editing' : ''}`} key={item.id_doc}>
                                <div className="inventario-card-header">
                                    <h3 className="inventario-card-title">{item.nombre}</h3>
                                    <span className={`stock-badge ${estado.clase}`}>{estado.texto}</span>
                                </div>
                                <div className="inventario-card-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Cantidad</span>
                                        {editingItem === item.id_doc ? (
                                            <div className="edit-quantity-row">
                                                <input
                                                    type="number"
                                                    className="edit-quantity-input"
                                                    value={editCantidad}
                                                    onChange={(e) => setEditCantidad(e.target.value)}
                                                    autoFocus
                                                />
                                                <button className="edit-quantity-btn save" onClick={() => actualizarCantidad(item.id_doc)}>✓</button>
                                                <button className="edit-quantity-btn cancel" onClick={cancelarEdicion}>✕</button>
                                            </div>
                                        ) : (
                                            <span className={`detail-value ${item.cantidad <= 10 ? 'text-warning' : ''}`}>
                                                {item.cantidad} {item.unidad}
                                            </span>
                                        )}
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Costo Unitario</span>
                                        <span className="detail-value">${item.costo.toFixed(2)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Costo Total</span>
                                        <span className="detail-value total">${costoTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Categoría</span>
                                        <span className="detail-category">{item.categoria}</span>
                                    </div>
                                </div>
                                <div className="inventario-card-actions">
                                    <button className="inventario-card-btn actualizar" onClick={() => empezarEdicion(item)}>
                                        Actualizar Stock
                                    </button>
                                    <button className="inventario-card-btn eliminar" onClick={() => eliminarProducto(item.id_doc)}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Inventario;