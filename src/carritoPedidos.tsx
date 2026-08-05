import React, { useState } from "react";
import { formatPrecio } from "./firebase";

interface Producto {
    id_doc: string;
    nombre: string;
    precio: number;
    descripcion?: string;
    imagen?: string;
}

export interface CartItem {
    product: Producto;
    quantity: number;
}

interface CarritoProps {
    cart: CartItem[];
    onClose: () => void;
    onUpdateQuantity: (id_doc: string, delta: number) => void;
    onComplete: (nota: string) => void;
}

const CarritoPedidos: React.FC<CarritoProps> = ({ cart, onClose, onUpdateQuantity, onComplete }) => {
    const [nota, setNota] = useState("");
    const total = cart.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);

    return (
        <div className="cart-overlay">
            <div className="cart-modal">
                <header className="cart-header">
                    <h3>Tu Pedido Actual</h3>
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
                            {cart.map((item) => (
                                <li key={item.product.id_doc} className="cart-item">
                                    <div className="cart-item-info">
                                        <strong>{item.product.nombre}</strong>
                                         <span className="cart-item-unit-price">${formatPrecio(item.product.precio)} c/u</span>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="quantity-controls">
                                            <button 
                                                className="qty-btn" 
                                                onClick={() => onUpdateQuantity(item.product.id_doc, -1)}
                                            >
                                                -
                                            </button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button 
                                                className="qty-btn" 
                                                onClick={() => onUpdateQuantity(item.product.id_doc, 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                         <span className="cart-item-subtotal">
                                             ${formatPrecio(item.product.precio * item.quantity)}
                                         </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total a pagar:</span>
                                 <strong>${formatPrecio(total)}</strong>
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
                                Confirmar y Enviar Pedido
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CarritoPedidos;
