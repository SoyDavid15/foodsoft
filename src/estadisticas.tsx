import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./estadisticas.css";

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

export const Estadisticas = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const usuarioId = auth.currentUser?.uid;

    useEffect(() => {
        if (!usuarioId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "pedidos"),
            where("usuarioId", "==", usuarioId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Order[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as Order);
            });
            setOrders(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [usuarioId]);

    if (loading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                <p>Cargando estadísticas y datos de ventas...</p>
            </div>
        );
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Calculations
    let ingresosDiarios = 0;
    let ingresosSemanales = 0;
    let ingresosMensuales = 0;
    let ingresosTotales = 0;

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);

    // Last 7 days revenue mapping
    const dailyRevenueMap: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(sevenDaysAgo.getDate() + i);
        const key = d.toISOString().split("T")[0];
        dailyRevenueMap[key] = 0;
    }

    // Orders by day of week mapping (Lunes to Domingo)
    const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const ordersByDayMap: { [key: string]: number } = {
        "Lunes": 0,
        "Martes": 0,
        "Miércoles": 0,
        "Jueves": 0,
        "Viernes": 0,
        "Sábado": 0,
        "Domingo": 0
    };

    orders.forEach(order => {
        if (!order.fecha) return;
        const orderDate = new Date(order.fecha);
        const orderDayStart = new Date(orderDate);
        orderDayStart.setHours(0, 0, 0, 0);

        const amount = order.total || 0;
        ingresosTotales += amount;

        // Ingresos diarios (Today)
        if (orderDayStart.getTime() === now.getTime()) {
            ingresosDiarios += amount;
        }

        // Ingresos semanales (Last 7 days)
        if (orderDayStart >= sevenDaysAgo && orderDayStart <= new Date()) {
            ingresosSemanales += amount;
        }

        // Ingresos mensuales (Current month)
        if (
            orderDate.getMonth() === new Date().getMonth() &&
            orderDate.getFullYear() === new Date().getFullYear()
        ) {
            ingresosMensuales += amount;
        }

        // Daily revenue for last 7 days chart
        const dateKey = orderDate.toISOString().split("T")[0];
        if (dailyRevenueMap[dateKey] !== undefined) {
            dailyRevenueMap[dateKey] += amount;
        }

        // Orders by day of week
        // getDay(): 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const jsDay = orderDate.getDay();
        const dayNamesMap: { [key: number]: string } = {
            1: "Lunes",
            2: "Martes",
            3: "Miércoles",
            4: "Jueves",
            5: "Viernes",
            6: "Sábado",
            0: "Domingo"
        };
        const dayName = dayNamesMap[jsDay];
        if (dayName && ordersByDayMap[dayName] !== undefined) {
            ordersByDayMap[dayName] += 1;
        }
    });

    // Format last 7 days for chart
    const dailyChartData = Object.keys(dailyRevenueMap).map(dateStr => {
        const [, month, day] = dateStr.split("-");
        return {
            dateKey: dateStr,
            label: `${day}/${month}`,
            value: dailyRevenueMap[dateStr]
        };
    });

    const maxDailyRevenue = Math.max(...dailyChartData.map(d => d.value), 1);

    // Format orders by day of week for chart
    const ordersByDayChartData = daysOfWeek.map(day => ({
        label: day,
        value: ordersByDayMap[day]
    }));

    const maxOrdersByDay = Math.max(...ordersByDayChartData.map(d => d.value), 1);

    return (
        <div className="estadisticas-container">
            <div className="estadisticas-header">
                <h2>Panel de Estadísticas</h2>
                <p className="estadisticas-subtitle">Visualiza el rendimiento financiero y los días de mayor demanda de tu negocio en tiempo real.</p>
            </div>

            {/* Stat Cards */}
            <div className="stats-cards-grid">
                <div className="stat-card">
                    <span className="stat-card-title">Ingresos de Hoy</span>
                    <span className="stat-card-value">${ingresosDiarios.toFixed(2)}</span>
                    <span className="stat-card-footer">Actualizado hoy</span>
                </div>

                <div className="stat-card">
                    <span className="stat-card-title">Ingresos Semanales</span>
                    <span className="stat-card-value">${ingresosSemanales.toFixed(2)}</span>
                    <span className="stat-card-footer">Últimos 7 días</span>
                </div>

                <div className="stat-card">
                    <span className="stat-card-title">Ingresos Mensuales</span>
                    <span className="stat-card-value">${ingresosMensuales.toFixed(2)}</span>
                    <span className="stat-card-footer">Mes actual</span>
                </div>

                <div className="stat-card">
                    <span className="stat-card-title">Ingresos Totales</span>
                    <span className="stat-card-value">${ingresosTotales.toFixed(2)}</span>
                    <span className="stat-card-footer">Histórico acumulado</span>
                </div>

                <div className="stat-card">
                    <span className="stat-card-title">Total de Pedidos</span>
                    <span className="stat-card-value">{orders.length}</span>
                    <span className="stat-card-footer">Pedidos registrados</span>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                {/* Chart 1: Daily Revenue (Last 7 Days) */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h3 className="chart-title">Ingresos de los Últimos 7 Días</h3>
                            <p className="chart-subtitle">Evolución diaria de ventas en tu local</p>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="no-data-chart">No hay datos de pedidos registrados aún.</div>
                    ) : (
                        <div className="bar-chart-container">
                            {dailyChartData.map((item, index) => {
                                const heightPercent = Math.round((item.value / maxDailyRevenue) * 100);
                                return (
                                    <div key={index} className="bar-column">
                                        <div className="bar-tooltip">${item.value.toFixed(2)}</div>
                                        <div className="bar-wrapper">
                                            <div 
                                                className="bar-fill" 
                                                style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                            ></div>
                                        </div>
                                        <span className="bar-label">{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Chart 2: Orders by Day of Week (Días que más usuarios piden) */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h3 className="chart-title">Días con Mayor Demanda de Pedidos</h3>
                            <p className="chart-subtitle">Frecuencia de pedidos por día de la semana</p>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="no-data-chart">No hay datos de pedidos registrados aún.</div>
                    ) : (
                        <div className="bar-chart-container">
                            {ordersByDayChartData.map((item, index) => {
                                const heightPercent = Math.round((item.value / maxOrdersByDay) * 100);
                                return (
                                    <div key={index} className="bar-column">
                                        <div className="bar-tooltip">{item.value} {item.value === 1 ? 'pedido' : 'pedidos'}</div>
                                        <div className="bar-wrapper">
                                            <div 
                                                className="bar-fill" 
                                                style={{ 
                                                    height: `${Math.max(heightPercent, 4)}%`,
                                                    background: 'linear-gradient(180deg, #10b981 0%, #047857 100%)' 
                                                }}
                                            ></div>
                                        </div>
                                        <span className="bar-label">{item.label.slice(0, 3)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Estadisticas;
