import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'

const pesos = (valor) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(valor) || 0)

const mismoDia = (fecha, referencia = new Date()) => {
  const a = new Date(fecha)
  const b = new Date(referencia)

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [medioPago, setMedioPago] = useState([])

  const cargarPedidos = async () => {
    setCargando(true)
    setError('')

    const { data, error: errorPedidos } = await supabase
      .from('pedidos')
      .select('*')
      .order('fecha_creado', { ascending: false })

    if (errorPedidos) {
      console.error('Error al cargar Dashboard:', errorPedidos)
      setError(errorPedidos.message)
      setCargando(false)
      return
    }

    setPedidos(data || [])

    const resumenPago = (data || []).reduce((acumulado, pedido) => {
      if (pedido.estado === 'rechazado') return acumulado

      const medio = pedido.medio_pago || 'Sin especificar'

      if (!acumulado[medio]) {
        acumulado[medio] = {
          cantidad: 0,
          total: 0
        }
      }

      acumulado[medio].cantidad += 1
      acumulado[medio].total += Number(pedido.total || 0)

      return acumulado
    }, {})

    setMedioPago(
      Object.entries(resumenPago)
        .map(([medio, datos]) => ({
          medio,
          cantidad: datos.cantidad,
          total: datos.total
        }))
        .sort((a, b) => b.total - a.total)
    )

    setCargando(false)
  }

  useEffect(() => {
    cargarPedidos()
  }, [])

  const estadisticas = useMemo(() => {
    const pedidosValidos = pedidos.filter(
      (pedido) => pedido.estado !== 'rechazado'
    )

    const pedidosHoy = pedidos.filter((pedido) =>
      mismoDia(pedido.fecha_creado)
    )

    const pedidosHoyValidos = pedidosHoy.filter(
      (pedido) => pedido.estado !== 'rechazado'
    )

    const ventasHoy = pedidosHoyValidos.reduce(
      (total, pedido) => total + Number(pedido.total || 0),
      0
    )

    const ticketPromedio =
      pedidosHoyValidos.length > 0
        ? ventasHoy / pedidosHoyValidos.length
        : 0

    const estados = {
      pendiente: pedidos.filter((pedido) => pedido.estado === 'pendiente').length,
      en_preparacion: pedidos.filter((pedido) => pedido.estado === 'en_preparacion').length,
      aceptado: pedidos.filter((pedido) => pedido.estado === 'aceptado').length,
      listo: pedidos.filter((pedido) => pedido.estado === 'listo').length,
      entregado: pedidos.filter((pedido) => pedido.estado === 'entregado').length,
      rechazado: pedidos.filter((pedido) => pedido.estado === 'rechazado').length
    }

    const productosVendidosMap = {}

  pedidosValidos.forEach((pedido) => {
    let productosPedido = pedido.productos

    if (typeof productosPedido === 'string') {
      try {
        productosPedido = JSON.parse(productosPedido)
      } catch {
        productosPedido = []
      }
    }

    if (!Array.isArray(productosPedido)) return

    productosPedido.forEach((producto) => {
      const nombre = String(producto?.nombre || '').trim()
      const cantidad = Number(producto?.cantidad || 0)

      if (!nombre || !Number.isFinite(cantidad) || cantidad <= 0) return

      productosVendidosMap[nombre] =
        (productosVendidosMap[nombre] || 0) + cantidad
    })
  })

  const productosMasVendidos = Object.entries(productosVendidosMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const fechaLimite7Dias = new Date()
    fechaLimite7Dias.setDate(fechaLimite7Dias.getDate() - 7)

    const ultimos7Dias = pedidos.filter((pedido) => {
      if (!pedido.fecha_creado) return false
      return new Date(pedido.fecha_creado) >= fechaLimite7Dias
    }).length

    const ventasUltimos7Dias = Array.from({ length: 7 }, (_, indice) => {
      const fecha = new Date()
      fecha.setHours(0, 0, 0, 0)
      fecha.setDate(fecha.getDate() - (6 - indice))

      const ventas = pedidosValidos
        .filter((pedido) => mismoDia(pedido.fecha_creado, fecha))
        .reduce(
          (total, pedido) => total + Number(pedido.total || 0),
          0
        )

      return {
        fecha,
        ventas
      }
    })

    return {
      ventasHoy,
      pedidosHoy: pedidosHoyValidos.length,
      ticketPromedio,
      totalPedidos: pedidos.length,
      pedidosValidos: pedidosValidos.length,
      ultimos7Dias,
      ventasUltimos7Dias,
      estados,
      productosMasVendidos
    }
  }, [pedidos])

  if (cargando) {
    return (
      <div style={{
        padding: '30px',
        color: '#666'
      }}>
        Cargando Dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '30px' }}>
        <div style={{
          padding: '16px',
          borderRadius: '10px',
          background: '#fff1f0',
          border: '1px solid #ffccc7',
          color: '#b42318'
        }}>
          No se pudo cargar el Dashboard: {error}
        </div>

        <button
          onClick={cargarPedidos}
          style={{
            marginTop: '12px',
            padding: '10px 16px',
            border: 0,
            borderRadius: '8px',
            background: '#1677ff',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: '700'
          }}
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      paddingBottom: '40px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px'
      }}>
        <div style={{
          background: 'white',
          padding: '14px 18px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: '800',
            color: '#222'
          }}>
            Dashboard
          </h1>

          <p style={{
            margin: '7px 0 0',
            color: '#777'
          }}>
            Resumen de actividad y ventas.
          </p>
        </div>

        <button
          onClick={cargarPedidos}
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#fff',
            cursor: 'pointer',
            fontWeight: '700'
          }}
        >
          Actualizar
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '15px'
      }}>
        {[
          ['Ventas de hoy', pesos(estadisticas.ventasHoy)],
          ['Pedidos de hoy', estadisticas.pedidosHoy],
          ['Ticket promedio', pesos(estadisticas.ticketPromedio)],
          ['Total de pedidos', estadisticas.totalPedidos]
                ].map(([titulo, valor]) => (
          <div
            key={titulo}
            style={{
              padding: '20px',
              background: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '12px'
            }}
          >
            <div style={{
              color: '#777',
              fontSize: '13px'
            }}>
              {titulo}
            </div>

            <strong style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '25px',
              color: '#222'
            }}>
              {valor}
            </strong>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '20px',
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '12px'
      }}>
        <h2 style={{
          margin: '0 0 16px',
          fontSize: '20px',
          color: '#222'
        }}>
          Estado de los pedidos
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: '12px'
        }}>
          {[
            ['Pendientes', estadisticas.estados.pendiente],
            ['En preparación', estadisticas.estados.en_preparacion],
            ['Aceptados', estadisticas.estados.aceptado],
            ['Listos', estadisticas.estados.listo],
            ['Entregados', estadisticas.estados.entregado],
            ['Rechazados', estadisticas.estados.rechazado]
          ].map(([titulo, cantidad]) => (
            <div
              key={titulo}
              style={{
                padding: '15px',
                background: '#f7f7f7',
                borderRadius: '9px'
              }}
            >
              <div style={{
                color: '#777',
                fontSize: '13px'
              }}>
                {titulo}
              </div>

              <strong style={{
                display: 'block',
                marginTop: '6px',
                fontSize: '23px',
                color: '#222'
              }}>
                {cantidad}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '20px',
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '12px'
      }}>
        <h2 style={{
          margin: '0 0 16px',
          fontSize: '20px',
          color: '#222'
        }}>
          Ventas por medio de pago
        </h2>

        {medioPago.length === 0 ? (
          <p style={{
            margin: 0,
            color: '#777'
          }}>
            No hay datos de medios de pago.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gap: '10px'
          }}>
            {medioPago.map((item) => (
              <div
                key={item.medio}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '13px 15px',
                  background: '#f7f7f7',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <strong style={{ color: '#222' }}>
                    {item.medio}
                  </strong>

                  <div style={{
                    marginTop: '3px',
                    fontSize: '12px',
                    color: '#777'
                  }}>
                    {item.cantidad} pedido{item.cantidad === 1 ? '' : 's'}
                  </div>
                </div>

                <strong style={{ color: '#222' }}>
                  {pesos(item.total)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '20px',
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '12px'
      }}>
        <h2 style={{
          margin: '0 0 16px',
          fontSize: '20px',
          color: '#222'
        }}>
          Ventas de los últimos 7 días
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '8px',
          alignItems: 'end',
          minHeight: '220px'
        }}>
          {estadisticas.ventasUltimos7Dias.map((item, index) => {
            const maxVentas = Math.max(
              ...estadisticas.ventasUltimos7Dias.map((dato) => dato.ventas),
              1
            )

            const altura = item.ventas > 0
              ? Math.max((item.ventas / maxVentas) * 150, 8)
              : 4

            return (
              <div
                key={`${item.fecha.toISOString()}-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '200px'
                }}
              >
                <div style={{
                  fontSize: '11px',
                  color: '#555',
                  marginBottom: '6px',
                  textAlign: 'center'
                }}>
                  {pesos(item.ventas)}
                </div>

                <div style={{
                  width: '100%',
                  maxWidth: '55px',
                  height: `${altura}px`,
                  background: '#e53935',
                  borderRadius: '6px 6px 2px 2px'
                }} />

                <div style={{
                  marginTop: '8px',
                  fontSize: '11px',
                  color: '#777',
                  textAlign: 'center'
                }}>
                  {item.fecha.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short'
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '20px',
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '12px'
      }}>
        <h2 style={{
          margin: '0 0 16px',
          fontSize: '20px',
          color: '#222'
        }}>
          Productos más vendidos
        </h2>

        {estadisticas.productosMasVendidos.length === 0 ? (
          <p style={{
            margin: 0,
            color: '#777'
          }}>
            No hay datos de productos vendidos.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gap: '10px'
          }}>
            {estadisticas.productosMasVendidos.map(([nombre, cantidad], index) => (
              <div
                key={`${nombre}-${index}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '13px 15px',
                  background: '#f7f7f7',
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <strong style={{
                    width: '24px',
                    color: '#777'
                  }}>
                    {index + 1}
                  </strong>

                  <span style={{
                    color: '#222',
                    fontWeight: '600'
                  }}>
                    {nombre}
                  </span>
                </div>

                <strong style={{
                  color: '#222'
                }}>
                  {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        borderRadius: '10px',
        background: '#f7f7f7',
        color: '#666',
        fontSize: '13px'
      }}>
        Pedidos válidos registrados: {estadisticas.pedidosValidos}
      </div>
    </div>
  )
}
