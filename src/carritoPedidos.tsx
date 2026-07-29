import React, { useState } from "react";

interface Producto {
    id_doc: string;
    nombre: string;
    precio: number;
}

interface CarritoProps {
    cart: Producto[];
    onClose: () => void;
    onRemove: (index: number) => void;
    onComplete: (nota: string) => void;
}

const CarritoPedidos: React.FC<CarritoProps> = ({ cart, onClose, onRemove, onComplete }) => {
    const [nota, setNota] = useState("");
    const total = cart.reduce((sum, item) => sum + item.precio, 0);

    return (
        <div className="cart-overlay">
            <div className="cart-modal">
                <header className="cart-header">
                    <h3>Tu Pedido</h3>
                    <button className="close-cart" onClick={onClose}>✕</button>
                </header>

                {cart.length === 0 ? (
                    <div className="empty-cart-container">
                        <p className="empty-cart-msg">Tu carrito está vacío.</p>
                        <button className="back-btn" onClick={onClose}>Volver al menú</button>
                    </div>
                ) : (
                    <>
                        <ul className="cart-items">
                            {cart.map((item, index) => (
                                <li key={`${item.id_doc}-${index}`} className="cart-item">
                                    <div className="cart-item-info">
                                        <strong>{item.nombre}</strong>
                                        <span>${item.precio.toFixed(2)}</span>
                                    </div>
                                    <button
                                        className="remove-item"
                                        onClick={() => onRemove(index)}
                                    >
                                        Eliminar
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total:</span>
                                <strong>${total.toFixed(2)}</strong>
                            </div>
                            <div className="note-input-container">
                                <input
                                    type="text"
                                    className="cart-note-input"
                                    placeholder="Añada una nota para el chef (opcional)"
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                    maxLength={100}
                                />
                                <span className="char-counter">{nota.length}/100</span>
                            </div>
                            <button className="complete-order-btn" onClick={() => onComplete(nota)}>
                                Confirmar Pedido
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CarritoPedidos;