import { db, getActiveUsuarioId, parsePrecio, formatPrecio } from './firebase';
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

    // Nuevos estados para hacer el inventario más intuitivo y fácil de entender
    const [busqueda, setBusqueda] = useState("");
    const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
    const [filtroEstado, setFiltroEstado] = useState<"todos" | "normal" | "bajo" | "agotado">("todos");
    const [orden, setOrden] = useState<"nombre" | "cantidad-asc" | "cantidad-desc" | "costo-desc">("nombre");
    const [vistaModo, setVistaModo] = useState<"tarjetas" | "tabla">("tarjetas");

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
        const costoNum = parsePrecio(nuevoCosto);
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
            setStatus(`¡Producto "${nuevoNombre}" guardado exitosamente!`);
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

    const ajustarCantidadRapida = async (item: InventarioItem, delta: number) => {
        const nuevaCant = Math.max(0, item.cantidad + delta);
        try {
            await updateDoc(doc(db, "inventario", item.id_doc), {
                cantidad: nuevaCant
            });
            setStatus(`Stock de "${item.nombre}" actualizado a ${nuevaCant} ${item.unidad}`);
            setTimeout(() => setStatus(""), 2500);
        } catch (error: any) {
            console.error(error);
            setStatus("Error al ajustar stock: " + error.message);
        }
    };

    const getStockStatus = (item: InventarioItem) => {
        if (item.cantidad === 0) return { clase: 'agotado', texto: 'Agotado' };
        if (item.stockMinimo > 0 && item.cantidad <= item.stockMinimo) return { clase: 'bajo', texto: 'Stock Bajo' };
        if (item.cantidad <= 10) return { clase: 'bajo', texto: 'Stock Bajo' };
        return { clase: 'normal', texto: 'En stock' };
    };

    // Cálculos y métricas financieras
    const valorTotalInventario = inventarioList.reduce((acc, item) => acc + (item.cantidad * item.costo), 0);
    const totalProductos = inventarioList.length;
    const stockBajoCount = inventarioList.filter(i => (i.stockMinimo > 0 && i.cantidad <= i.stockMinimo) || (i.cantidad <= 10 && i.cantidad > 0)).length;
    const agotadosCount = inventarioList.filter(i => i.cantidad === 0).length;

    const categorias = [...new Set(inventarioList.map(item => item.categoria))];

    // Filtrado y ordenamiento de items
    const itemsFiltrados = inventarioList.filter(item => {
        const matchBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                              item.categoria.toLowerCase().includes(busqueda.toLowerCase());
        const matchCategoria = categoriaActiva === "todas" || item.categoria === categoriaActiva;
        
        const estado = getStockStatus(item);
        let matchEstado = true;
        if (filtroEstado === "agotado") matchEstado = estado.clase === 'agotado';
        if (filtroEstado === "bajo") matchEstado = estado.clase === 'bajo';
        if (filtroEstado === "normal") matchEstado = estado.clase === 'normal';

        return matchBusqueda && matchCategoria && matchEstado;
    }).sort((a, b) => {
        if (orden === "nombre") return a.nombre.localeCompare(b.nombre);
        if (orden === "cantidad-asc") return a.cantidad - b.cantidad;
        if (orden === "cantidad-desc") return b.cantidad - a.cantidad;
        if (orden === "costo-desc") return (b.cantidad * b.costo) - (a.cantidad * a.costo);
        return 0;
    });

    return (
        <div className="inventario-container">
            <div className="inventario-header-section">
                <div>
                    <h2>Gestión de Inventario</h2>
                    <p>Controla el stock, valora tus activos y gestiona insumos de tu negocio con total claridad.</p>
                </div>
                <div className="inventario-header-actions">
                    <button className="inventario-button primary" onClick={() => document.getElementById('add-inventario-form')?.scrollIntoView({ behavior: 'smooth' })}>
                        + Agregar Producto
                    </button>
                </div>
            </div>

            {status && (
                <p className={`status-message ${status.includes('Error') || status.includes('Por favor') || status.includes('El costo') || status.includes('La cantidad') ? 'error' : 'success'}`}>
                    {status}
                </p>
            )}

            {/* Tarjetas de Estadísticas e Indicadores */}
            <div className="inventario-stats">
                <div className="stat-card total">
                    <span className="stat-label">Total Productos</span>
                    <span className="stat-value">{totalProductos}</span>
                </div>
                <div className="stat-card valor">
                    <span className="stat-label">Valor del Inventario</span>
                    <span className="stat-value">${valorTotalInventario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="stat-card bajo" onClick={() => setFiltroEstado(filtroEstado === 'bajo' ? 'todos' : 'bajo')} style={{ cursor: 'pointer' }} title="Clic para filtrar stock bajo">
                    <span className="stat-label">Stock Bajo ⚠️</span>
                    <span className="stat-value">{stockBajoCount}</span>
                </div>
                <div className="stat-card agotado" onClick={() => setFiltroEstado(filtroEstado === 'agotado' ? 'todos' : 'agotado')} style={{ cursor: 'pointer' }} title="Clic para filtrar agotados">
                    <span className="stat-label">Agotados ❌</span>
                    <span className="stat-value">{agotadosCount}</span>
                </div>
            </div>

            {/* Barra de Búsqueda, Filtros y Controles de Vista */}
            <div className="inventario-controls-bar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre o categoría..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    {busqueda && (
                        <button className="clear-search-btn" onClick={() => setBusqueda("")}>✕</button>
                    )}
                </div>

                <div className="controls-group">
                    <div className="filter-select-wrapper">
                        <label htmlFor="filtro-estado-select">Estado:</label>
                        <select
                            id="filtro-estado-select"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value as any)}
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="normal">En stock</option>
                            <option value="bajo">Stock bajo</option>
                            <option value="agotado">Agotados</option>
                        </select>
                    </div>

                    <div className="filter-select-wrapper">
                        <label htmlFor="orden-select">Ordenar por:</label>
                        <select
                            id="orden-select"
                            value={orden}
                            onChange={(e) => setOrden(e.target.value as any)}
                        >
                            <option value="nombre">Nombre (A-Z)</option>
                            <option value="cantidad-asc">Cantidad: Menor a Mayor</option>
                            <option value="cantidad-desc">Cantidad: Mayor a Menor</option>
                            <option value="costo-desc">Costo Total: Mayor</option>
                        </select>
                    </div>

                    <div className="view-mode-toggle">
                        <button
                            className={`view-btn ${vistaModo === 'tarjetas' ? 'active' : ''}`}
                            onClick={() => setVistaModo('tarjetas')}
                            title="Vista de Tarjetas"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        </button>
                        <button
                            className={`view-btn ${vistaModo === 'tabla' ? 'active' : ''}`}
                            onClick={() => setVistaModo('tabla')}
                            title="Vista de Tabla"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtros por Categoría */}
            {categorias.length > 0 && (
                <div className="categorias-filter">
                    <span className="categoria-label-title">Categorías:</span>
                    <button
                        className={`categoria-btn ${categoriaActiva === "todas" ? "activa" : ""}`}
                        onClick={() => setCategoriaActiva("todas")}
                    >
                        Todas ({inventarioList.length})
                    </button>
                    {categorias.map(cat => {
                        const countCat = inventarioList.filter(i => i.categoria === cat).length;
                        return (
                            <button
                                key={cat}
                                className={`categoria-btn ${categoriaActiva === cat ? "activa" : ""}`}
                                onClick={() => setCategoriaActiva(cat)}
                            >
                                {cat} ({countCat})
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Formulario para Agregar Producto */}
            <div className="add-inventario-container" id="add-inventario-form">
                <h3>📦 Agregar Nuevo Producto al Inventario</h3>
                <div className="inventario-add">
                    <div className="form-field-group">
                        <label>Nombre del producto</label>
                        <input
                            type="text"
                            placeholder="Ej. Tomates, Harina, Coca Cola..."
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                        />
                    </div>
                    <div className="form-field-group">
                        <label>Cantidad actual</label>
                        <input
                            type="number"
                            placeholder="Ej. 25"
                            value={nuevaCantidad}
                            onChange={(e) => setNuevaCantidad(e.target.value)}
                        />
                    </div>
                    <div className="form-field-group">
                        <label>Unidad de medida</label>
                        <input
                            type="text"
                            placeholder="Ej. kg, L, uds, porciones"
                            value={nuevaUnidad}
                            onChange={(e) => setNuevaUnidad(e.target.value)}
                        />
                    </div>
                    <div className="form-field-group">
                        <label>Costo unitario ($)</label>
                        <input
                            type="number"
                            placeholder="Ej. 1.50"
                            value={nuevoCosto}
                            onChange={(e) => setNuevoCosto(e.target.value)}
                        />
                    </div>
                    <div className="form-field-group">
                        <label>Categoría</label>
                        <input
                            type="text"
                            placeholder="Ej. Verduras, Bebidas, Lácteos"
                            value={nuevaCategoria}
                            onChange={(e) => setNuevaCategoria(e.target.value)}
                        />
                    </div>
                    <div className="form-field-group">
                        <label>Stock mínimo de alerta (opcional)</label>
                        <input
                            type="number"
                            placeholder="Ej. 5"
                            value={stockMinimo}
                            onChange={(e) => setStockMinimo(e.target.value)}
                        />
                    </div>
                </div>
                <button onClick={guardarProducto} className="inventario-add-button">
                    Guardar Producto en Inventario
                </button>
            </div>

            {/* Listado de Productos (Tarjetas o Tabla) */}
            {itemsFiltrados.length === 0 ? (
                <div className="empty-inventario">
                    <p>No se encontraron productos con los filtros seleccionados.</p>
                    {busqueda || categoriaActiva !== "todas" || filtroEstado !== "todos" ? (
                        <button className="reset-filters-btn" onClick={() => { setBusqueda(""); setCategoriaActiva("todas"); setFiltroEstado("todos"); }}>
                            Limpiar filtros
                        </button>
                    ) : null}
                </div>
            ) : vistaModo === 'tarjetas' ? (
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
                                        <span className="detail-label">Stock Actual</span>
                                        {editingItem === item.id_doc ? (
                                            <div className="edit-quantity-row">
                                                <input
                                                    type="number"
                                                    className="edit-quantity-input"
                                                    value={editCantidad}
                                                    onChange={(e) => setEditCantidad(e.target.value)}
                                                    autoFocus
                                                />
                                                <button className="edit-quantity-btn save" onClick={() => actualizarCantidad(item.id_doc)} title="Guardar">✓</button>
                                                <button className="edit-quantity-btn cancel" onClick={cancelarEdicion} title="Cancelar">✕</button>
                                            </div>
                                        ) : (
                                            <div className="stock-display-group">
                                                <span className={`detail-value ${item.cantidad <= 10 ? 'text-warning' : ''}`}>
                                                    {item.cantidad} {item.unidad}
                                                </span>
                                                <div className="quick-adjust-btns">
                                                    <button onClick={() => ajustarCantidadRapida(item, -1)} title="Restar 1">-</button>
                                                    <button onClick={() => ajustarCantidadRapida(item, 1)} title="Sumar 1">+</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Costo Unitario</span>
                                         <span className="detail-value">${formatPrecio(item.costo)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Costo Total en Stock</span>
                                         <span className="detail-value total">${formatPrecio(costoTotal)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Categoría</span>
                                        <span className="detail-category">{item.categoria}</span>
                                    </div>
                                    {item.stockMinimo > 0 && (
                                        <div className="detail-row">
                                            <span className="detail-label">Stock Mínimo</span>
                                            <span className="detail-value">{item.stockMinimo} {item.unidad}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="inventario-card-actions">
                                    <button className="inventario-card-btn actualizar" onClick={() => empezarEdicion(item)}>
                                        Editar Stock
                                    </button>
                                    <button className="inventario-card-btn eliminar" onClick={() => eliminarProducto(item.id_doc)}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="inventario-table-container">
                    <table className="inventario-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Stock Actual</th>
                                <th>Costo Unit.</th>
                                <th>Costo Total</th>
                                <th>Estado</th>
                                <th>Acciones Rápidas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsFiltrados.map((item) => {
                                const estado = getStockStatus(item);
                                const costoTotal = item.cantidad * item.costo;
                                return (
                                    <tr key={item.id_doc}>
                                        <td className="table-item-name">
                                            <strong>{item.nombre}</strong>
                                        </td>
                                        <td>
                                            <span className="table-category">{item.categoria}</span>
                                        </td>
                                        <td>
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
                                                <div className="table-stock-cell">
                                                    <span className={item.cantidad <= 10 ? 'text-warning' : ''}>
                                                        <strong>{item.cantidad}</strong> {item.unidad}
                                                    </span>
                                                    <div className="quick-adjust-btns inline">
                                                        <button onClick={() => ajustarCantidadRapida(item, -1)}>-</button>
                                                        <button onClick={() => ajustarCantidadRapida(item, 1)}>+</button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td>${formatPrecio(item.costo)}</td>
                                        <td><strong>${formatPrecio(costoTotal)}</strong></td>
                                        <td>
                                            <span className={`stock-badge ${estado.clase}`}>{estado.texto}</span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="table-action-btn edit" onClick={() => empezarEdicion(item)}>Editar</button>
                                                <button className="table-action-btn delete" onClick={() => eliminarProducto(item.id_doc)}>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Inventario;
