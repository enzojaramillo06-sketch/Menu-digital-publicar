import { useState } from 'react'

function PanelPedido() {
  const [pedido, setPedido] = useState({
    numero: 1,
    nombre: 'Cliente de prueba',
    telefono: '3884775834',
    ubicacion: 'Mesa 6',
    medioPago: 'Efectivo',
    productos: [
      {
        nombre: 'Hamburguesa clásica',
        cantidad: 1,
        precio: 6500
      },
      {
        nombre: 'Sándwich clásico',
        cantidad: 1,
        precio: 6500
      },
      {
        nombre: 'Hamburguesa completa',
        cantidad: 1,
        precio: 7500
      }
    ],
    total: 20500
  })

  const [estado, setEstado] = useState('nuevo')

  const aceptarPedido = () => {
    setEstado('confirmado')
  }

  const rechazarPedido = () => {
    setEstado('rechazado')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto'
        }}
      >
        <h1 style={{ textAlign: 'center' }}>
          📥 Recepción de pedidos
        </h1>

        <div
          style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            marginTop: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
          }}
        >
          <h2>
            🔴 Pedido #{pedido.numero}
          </h2>

          <p>
            <strong>Cliente:</strong> {pedido.nombre}
          </p>

          <p>
            <strong>Teléfono:</strong> {pedido.telefono}
          </p>

          <p>
            <strong>Ubicación:</strong> {pedido.ubicacion}
          </p>

          <p>
            <strong>Medio de pago:</strong> {pedido.medioPago}
          </p>

          <div
            style={{
              background: '#f5f5f5',
              borderRadius: '10px',
              padding: '15px',
              marginTop: '20px'
            }}
          >
            <h3>🧾 Pedido</h3>

            {pedido.productos.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}
              >
                <span>
                  {item.nombre} × {item.cantidad}
                </span>

                <strong>
                  ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                </strong>
              </div>
            ))}

            <hr />

            <h2 style={{ textAlign: 'right' }}>
              Total: ${pedido.total.toLocaleString('es-AR')}
            </h2>
          </div>

          {estado === 'nuevo' && (
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={aceptarPedido}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#168a3a',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}
              >
                ✅ Aceptar pedido
              </button>

              <button
                onClick={rechazarPedido}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#c62828',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                ❌ Rechazar pedido
              </button>
            </div>
          )}

          {estado === 'confirmado' && (
            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                background: '#e8f5e9',
                borderRadius: '10px',
                textAlign: 'center'
              }}
            >
              <h3>🟢 Pedido confirmado</h3>
              <p>El pedido fue aceptado y puede comenzar a prepararse.</p>
            </div>
          )}

          {estado === 'rechazado' && (
            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                background: '#ffebee',
                borderRadius: '10px',
                textAlign: 'center'
              }}
            >
              <h3>🔴 Pedido rechazado</h3>
              <p>El pedido fue rechazado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PanelPedido
