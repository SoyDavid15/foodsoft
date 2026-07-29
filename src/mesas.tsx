import { db, auth } from './firebase';
import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, where } from "firebase/firestore";
import './mesas.css';

interface Mesa {
    id_doc: string;
    id: number;
    nombre: string;
}

interface Props {
    setView: (view: string) => void;
    setSelectedMesa: (mesa: Mesa) => void;
}

export const mesas = ({ setView, setSelectedMesa }: Props) => {

    const [status, setStatus] = useState("");
    const [mesasList, setMesasList] = useState<Mesa[]>([]);
    const [pedidosCount, setPedidosCount] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // Mesas listener
        const qMesas = query(collection(db, "mesas"), where("usuarioId", "==", user.uid));
        const unsubscribeMesas = onSnapshot(qMesas, (querySnapshot) => {
            const mesasArray: Mesa[] = [];
            querySnapshot.forEach((doc) => {
                mesasArray.push({ id_doc: doc.id, id: doc.data().id, nombre: doc.data().nombre });
            });
            mesasArray.sort((a, b) => a.id - b.id);
            setMesasList(mesasArray);
        });

        // Pedidos listener for counts
        const qPedidos = query(collection(db, "pedidos"), where("usuarioId", "==", user.uid));
        const unsubscribePedidos = onSnapshot(qPedidos, (querySnapshot) => {
            const counts: { [key: string]: number } = {};
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.mesaId && data.estado !== "pagado") {
                    counts[data.mesaId] = (counts[data.mesaId] || 0) + 1;
                }
            });
            setPedidosCount(counts);
        });

        return () => {
            unsubscribeMesas();
            unsubscribePedidos();
        };
    }, []);

    const guardarMesa = async () => {
        setStatus("Guardando...");
        try {
            const nextId = mesasList.length > 0
                ? Math.max(...mesasList.map(m => m.id)) + 1
                : 1;

            const user = auth.currentUser;
            if (!user) {
                setStatus("Error: Usuario no autenticado");
                return;
            }

            const collectionRef = collection(db, "mesas");
            await addDoc(collectionRef, {
                nombre: `Mesa ${nextId}`,
                id: nextId,
                usuarioId: user.uid
            })
            setStatus(`¡Mesa ${nextId} creada exitosamente!`);
            setTimeout(() => setStatus(""), 3000);
        } catch (error: any) {
            console.error(error);
            setStatus("Error al guardar: " + error.message);
        }
    }

    const eliminarMesa = async (id_doc: string) => {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar esta mesa?");
        if (confirmar) {
            try {
                await deleteDoc(doc(db, "mesas", id_doc));
                setStatus("Mesa eliminada correctamente");
                setTimeout(() => setStatus(""), 3000);
            } catch (error: any) {
                console.error(error);
                setStatus("Error al eliminar: " + error.message);
            }
        }
    };

    return (
        <div className="mesas-container">
            <div className="mesas-header-section">
                <div>
                    <h2>Mesas</h2>
                    <p className="mesas-subtitle">Administra las mesas de tu local y visualiza sus pedidos activos.</p>
                </div>
                <button className="mesa-button" onClick={guardarMesa} style={{ width: 'auto', padding: '12px 20px' }}>
                    + Nueva Mesa
                </button>
            </div>

            {status && (
                <p className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>
                    {status}
                </p>
            )}

            {mesasList.length === 0 ? (
                <div className="empty-mesas">
                    <p>No tienes mesas creadas aún.</p>
                    <button className="mesa-button" onClick={guardarMesa} style={{ width: 'auto', display: 'inline-block' }}>
                        Crear primera mesa
                    </button>
                </div>
            ) : (
                <div className="mesas-grid">
                    {mesasList.map((mesa) => {
                        const count = pedidosCount[mesa.id_doc] || 0;
                        return (
                            <div className={`mesa ${count > 0 ? 'con-pedidos' : ''}`} key={mesa.id_doc}>
                                <div className="mesa-header-info">
                                    <h3 className='mesa-title'>{mesa.nombre}</h3>
                                    {count > 0 ? (
                                        <div className="mesa-pedidos-count">
                                            <span>🔥 {count} {count === 1 ? 'pedido' : 'pedidos'}</span>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Disponible</span>
                                    )}
                                </div>
                                <div className="mesa-actions">
                                    <button className='mesa-button' onClick={() => { setSelectedMesa(mesa); setView("pedidos"); }}>
                                        Ver Pedidos
                                    </button>
                                    <button className='mesa-button eliminar' onClick={() => eliminarMesa(mesa.id_doc)} title="Eliminar mesa">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default mesas
