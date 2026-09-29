import PanelRestaurante from "./PanelRestaurante.jsx"
import { useState, useEffect } from 'react'
import { supabase } from "./lib/supabase.js"
import restaurante from './config/restaurante'
const rutaActual = window.location.pathname

const desarrollos = {
  '/menu-digital': {
    nombre: 'Menú Digital',
  },

  '/menu-prueba': {
    nombre: 'Menú de Prueba',
  },
}

const categorias = [  'Todos',  'Hamburguesas',  'Porciones de papas',  'Bebidas',  'Combos',  'Promos',  'Extras',  'Sándwiches',  'Napolitanas',  'Charles',  'Pizzas']

const productos = [
{
id: 1,
nombre: 'Hamburguesa clásica',
precio: 6500,
categoria: 'Hamburguesas',
descripcion: 'Hamburguesa con lechuga, tomate y aderezos', imagen_url: '/hamburguesa-clasica.webp'
},
{
id: 2,
nombre: 'Hamburguesa completa',
precio: 7500,
categoria: 'Hamburguesas',
descripcion: 'Hamburguesa completa con queso, jamón, huevo y verduras'
},

{
id: 3,
nombre: 'Sándwich clásico',
precio: 6500,
categoria: 'Sándwiches',
descripcion: 'Sándwich preparado con ingredientes frescos'
},
{
id: 4,
nombre: 'Sándwich completo',
precio: 7500,
categoria: 'Sándwiches',
descripcion: 'Sándwich completo con queso, jamón y huevo'
},

{
id: 5,
nombre: 'Napolitana de pollo',
precio: 8500,
categoria: 'Napolitanas',
descripcion: 'Pollo, salsa, jamón y queso'
},
{
id: 6,
nombre: 'Napolitana de carne',
precio: 9000,
categoria: 'Napolitanas',
descripcion: 'Carne, salsa, jamón y queso'
},

{
id: 7,
nombre: 'Charles clásico',
precio: 7500,
categoria: 'Charles',
descripcion: 'Preparación de la casa'
},
{
id: 8,
nombre: 'Charles completo',
precio: 8500,
categoria: 'Charles',
descripcion: 'Preparación completa de la casa'
},

{
id: 9,
nombre: 'Pizza muzzarella',
precio: 8000,
categoria: 'Pizzas',
descripcion: 'Pizza con muzzarella y salsa de tomate'
},
{
id: 10,
nombre: 'Pizza especial',
precio: 10000,
categoria: 'Pizzas',
descripcion: 'Pizza especial de la casa'
},

{
id: 11,
nombre: 'Porción de papas',
precio: 3000,
categoria: 'Porciones de papas',
descripcion: 'Porción de papas fritas'
},
{
id: 12,
nombre: 'Papas con cheddar',
precio: 4500,
categoria: 'Porciones de papas',
descripcion: 'Papas fritas con cheddar'
},

{
id: 13,
nombre: 'Gaseosa',
precio: 2000,
categoria: 'Bebidas',
descripcion: 'Gaseosa'
},
{
id: 14,
nombre: 'Agua',
precio: 1500,
categoria: 'Bebidas',
descripcion: 'Agua mineral'
}
]

const normalizarTexto = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

function App() {
  const [categoriasMenu, setCategoriasMenu] = useState(categorias);
  const [productosMenu, setProductosMenu] = useState(productos);
  const [categoriasIdsMenu, setCategoriasIdsMenu] = useState(["TODOS"]);

  useEffect(() => {
    let cancelado = false;

    const cargarMenuDesdeSupabase = async () => {
      try {
        const [
          { data: categoriasData, error: categoriasError },
          { data: productosData, error: productosError }
        ] = await Promise.all([
          supabase
            .from("categorias")
            .select("id, nombre, orden, activo")
            .eq("activo", true)
            .order("orden", { ascending: true }),

          supabase
            .from("productos")
            .select("id, nombre, precio, descripcion, categoria_id, imagen_url, orden, activo")
            .eq("activo", true)
            .order("orden", { ascending: true })
        ]);

        if (categoriasError || productosError) {
          throw categoriasError || productosError;
        }

        if (cancelado) return;

                const categoriasActivas = [
          "Todos",
          ...(categoriasData || []).map((categoria) => categoria.nombre)
        ];

        const categoriasIdsActivas = [
          "TODOS",
          ...(categoriasData || []).map((categoria) => categoria.id)
        ];

const nombresCategorias = new Map(
          (categoriasData || []).map((categoria) => [
            categoria.id,
            categoria.nombre
          ])
        );

        const productosActivos = (productosData || []).map((producto) => ({
          id: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          categoria: nombresCategorias.get(producto.categoria_id) || "",
          categoria_id: producto.categoria_id,
          descripcion: producto.descripcion || "",
          imagen_url: producto.imagen_url || "",
          orden: producto.orden ?? 0
        }));

        setCategoriasMenu(categoriasActivas);
        setCategoriasIdsMenu(categoriasIdsActivas);
        setProductosMenu(productosActivos);
      } catch (error) {
        console.error("Error al cargar menú desde Supabase. Se mantienen los datos locales:", error);
      }
    };

    cargarMenuDesdeSupabase();

    return () => {
      cancelado = true;
    };
  }, []);
const [categoria, setCategoria] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
const [carrito, setCarrito] = useState([])
const [mostrarPedido, setMostrarPedido] = useState(false)
const [confirmandoPedido, setConfirmandoPedido] = useState(false)
const [nombre, setNombre] = useState('')
const [telefono, setTelefono] = useState('')
const [email, setEmail] = useState("")
const [direccion, setDireccion] = useState('')
const [tipoLugar, setTipoLugar] = useState('')
const [mesa, setMesa] = useState('')
const [medioPago, setMedioPago] = useState('')
const [comentario, setComentario] = useState('')
const [modificaciones, setModificaciones] = useState({})
const [formularioPedido, setFormularioPedido] = useState(false)
  const [pedidoEnviado, setPedidoEnviado] = useState(() =>
    sessionStorage.getItem("pedidoEnviadoActivo") === "true" ||
    sessionStorage.getItem("pantallaActual") === "pedidoEnviado"
  )
  const [numeroPedido, setNumeroPedido] = useState(() => {
    if (sessionStorage.getItem("pedidoEnviadoActivo") !== "true") return ""
    try {
      const pedido = JSON.parse(sessionStorage.getItem("ultimoPedido") || "null")
      return pedido?.numero || ""
    } catch {
      return ""
    }
  })
const [procesandoPedido, setProcesandoPedido] = useState(false)
const [estadoPedido, setEstadoPedido] = useState("pendiente")
  const [estadoPago, setEstadoPago] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get("status")

    if (status === "approved") {
      setEstadoPago("approved")
    } else if (status === "pending") {
      setEstadoPago("pending")
    } else if (status === "rejected") {
      setEstadoPago("rejected")
    }
  }, [])
  useEffect(() => {
    const pedidoActivo =
      sessionStorage.getItem("pedidoEnviadoActivo") === "true"

    if (!pedidoActivo) {
      localStorage.removeItem("ultimoPedido")
      localStorage.removeItem("pedidoEnviadoActivo")
      return
    }

    const guardado = sessionStorage.getItem("ultimoPedido")
    if (!guardado) return

    try {
      const pedido = JSON.parse(guardado)
      setNombre(pedido.cliente || "")
      setTelefono(pedido.telefono || "")
      setDireccion(pedido.direccion || "")
      setTipoLugar(pedido.tipo_lugar || pedido.tipoLugar || "")
      setMesa(pedido.mesa || "")
      setMedioPago(pedido.medio_pago || pedido.medioPago || "")
      setComentario("")
      setModificaciones({})
      setCarrito(pedido.productos || [])
    } catch (e) {
      console.error("Error al recuperar ultimoPedido:", e)
    }
  }, [])


useEffect(() => {
  if (!pedidoEnviado || !numeroPedido) return

  const consultarEstado = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("estado")
      .eq("numero_pedido", numeroPedido)
      .maybeSingle()

    if (error) {
      console.error("Error al consultar estado:", error)
      return
    }

    if (data) {
      setEstadoPedido(data.estado)
    }
  }

  consultarEstado()

  const intervalo = setInterval(consultarEstado, 5000)

  return () => clearInterval(intervalo)
}, [pedidoEnviado, numeroPedido])

  const procesarPedido = async () => {  if (!nombre.trim() || !telefono.trim() || !medioPago) {
    alert("Completá todos los datos del pedido.")
    return
  }

  if (
    medioPago === "Tarjeta" &&
    (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
  ) {
    alert("Ingresá un correo electrónico válido para pagar con tarjeta.")
    return
  }

  if (procesandoPedido) return
  setProcesandoPedido(true)

    const nuevoNumero = "PED-" + (globalThis.crypto?.randomUUID?.()?.replaceAll("-", "") || Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, "0")).slice(0, 8).toUpperCase()

    const subtotal = total;
    const recargoTarjeta =
      medioPago === "Tarjeta"
        ? Math.round(subtotal * 0.15 * 100) / 100
        : 0;
    const totalFinal = subtotal + recargoTarjeta;

    const pedido = {
      numero: nuevoNumero,
      cliente: nombre,
      telefono: telefono,
      tipoLugar: tipoLugar,
      mesa: mesa,
      direccion: direccion,
      medioPago: medioPago,
      comentario: comentario,
      productos: carrito.map((producto) => ({
      ...producto,
      modificacion: modificaciones[producto.id] || ""
    })),
      subtotal: subtotal,
    recargo_tarjeta: recargoTarjeta,
    total: totalFinal,
      fecha: new Date().toISOString(),
      estado: "pendiente"
    }

  let error

  try {
    ({ error } = await supabase
  .from("pedidos")
  .insert([{
    numero_pedido: nuevoNumero,
    cliente: nombre,
    telefono: telefono,
    tipo_lugar: tipoLugar,
    mesa: mesa,
    direccion: direccion,
    medio_pago: medioPago,
    comentario: comentario,
    productos: carrito.map((producto) => ({
      ...producto,
      modificacion: modificaciones[producto.id] || ""
    })),
    subtotal: subtotal,
    recargo_tarjeta: recargoTarjeta,
    total: totalFinal,
    estado: "pendiente"
  }]))
    if (medioPago === "Tarjeta") {
      const itemsMercadoPago = [
        ...carrito.map((producto) => ({
          title: producto.nombre,
          unit_price: Number(producto.precio),
          quantity: Number(producto.cantidad),
        })),
        ...(recargoTarjeta > 0
          ? [
              {
                title: "Recargo por pago con tarjeta (15%)",
                unit_price: recargoTarjeta,
                quantity: 1,
              },
            ]
          : []),
      ];

      const { data: pagoData, error: pagoError } =
        await supabase.functions.invoke("Crear-pago-mercadopago", {
          body: {
            external_reference: nuevoNumero,
            total_amount: totalFinal,
            payer_email: email.trim(),
            items: itemsMercadoPago,
          },
        });

      if (pagoError) {
        throw new Error(
          pagoError.message ||
            "No se pudo iniciar el pago con Mercado Pago."
        );
      }

      if (!pagoData?.ok || !pagoData?.checkout_url) {
        throw new Error(
          pagoData?.error ||
            "Mercado Pago no devolvió una URL de pago."
        );
      }

      sessionStorage.setItem("ultimoPedido", JSON.stringify(pedido))
    sessionStorage.setItem("pantallaActual", "pedidoEnviado")
    sessionStorage.setItem("pedidoEnviadoActivo", "true")

    window.location.href = pagoData.checkout_url;
      return;
    }

  } catch (e) {
    console.error("Excepción al guardar el pedido:", e)
    setProcesandoPedido(false)
    alert("ERROR AL GUARDAR: " + (e?.message || JSON.stringify(e)))
    return
  }



if (error) {
    console.error("Error al guardar pedido:", error)
    setProcesandoPedido(false)
    alert("ERROR AL GUARDAR: " + (error?.message || JSON.stringify(error)))
    return
  }

  sessionStorage.setItem("ultimoPedido", JSON.stringify(pedido))
    sessionStorage.setItem("pantallaActual", "pedidoEnviado")
    sessionStorage.setItem("pedidoEnviadoActivo", "true")
setNumeroPedido(nuevoNumero)
setFormularioPedido(false)
  setCarrito(pedido.productos)
setPedidoEnviado(true)
  }

const productosFiltrados = productosMenu.filter((producto) => {
  const coincideCategoria =
    categoria === 'Todos' ||
    producto.categoria === categoria

  const textoBusqueda = normalizarTexto(busqueda.trim())

  const coincideBusqueda =
    !textoBusqueda ||
    normalizarTexto(producto.nombre || '').includes(textoBusqueda) ||
    normalizarTexto(producto.descripcion || '').includes(textoBusqueda) ||
    normalizarTexto(producto.categoria || '').includes(textoBusqueda)

  return coincideCategoria && coincideBusqueda
})

const agregar = (producto) => {
const existe = carrito.find(item => item.id === producto.id)

if (existe) {
setCarrito(
carrito.map(item =>
item.id === producto.id
? { ...item, cantidad: item.cantidad + 1 }
: item
)
)
} else {
setCarrito([...carrito, { ...producto, cantidad: 1 }])
}
}
const aumentar = (id) => {
setCarrito(prev =>
prev.map(item =>
item.id === id
? { ...item, cantidad: item.cantidad + 1 }
: item
)
)
}

const disminuir = (id) => {
setCarrito(prev =>
prev.flatMap(item =>
item.id === id
? item.cantidad > 1
? [{ ...item, cantidad: item.cantidad - 1 }]
: []
: [item]
)
)
}
const total = carrito.reduce(
(suma, producto) => suma + producto.precio * producto.cantidad,
0
)

if (confirmandoPedido) {
return (
<div
style={{
minHeight: '100vh',
background: '#4A0F16',
fontFamily: 'Arial, sans-serif',
padding: '20px',
boxSizing: 'border-box'
}}
>

<div
style={{
maxWidth: '600px',
margin: '0 auto 18px',
color: 'white',
textAlign: 'center',
padding: '10px 10px 4px',
boxSizing: 'border-box'
}}
>
<div
style={{
width: '58px',
height: '58px',
margin: '0 auto 10px',
borderRadius: '50%',
background: 'white',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
color: '#e30613'
}}
>
<svg
width="32"
height="32"
viewBox="0 0 24 24"
fill="none"
xmlns="http://www.w3.org/2000/svg"
aria-hidden="true"
>
<path
d="M7 8V7a5 5 0 0 1 10 0v1"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
/>
<path
d="M5 8h14l-1 11H6L5 8Z"
stroke="currentColor"
strokeWidth="1.8"
strokeLinejoin="round"
/>
<path
d="m9 14 2 2 4-4"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
/>
</svg>
</div>

<h2
style={{
margin: 0,
fontSize: '32px',
fontWeight: '900',
letterSpacing: '0.5px',
color: 'white'
}}
>
CONFIRMÁ TU PEDIDO
</h2>

<p
style={{
margin: '10px 0 0',
color: 'white',
fontSize: '16px'
}}
>
Revisá los productos y las cantidades antes de continuar.
</p>
</div>

<div
style={{
maxWidth: '600px',
margin: '0 auto',
background: 'white',
border: 'none',
borderRadius: '15px',
padding: '20px',
boxSizing: 'border-box'
}}
>

{carrito.map((producto) => (
<div
key={producto.id}
style={{
display: 'flex',
alignItems: 'center',
gap: '14px',
padding: '16px 0',
borderBottom: '1px solid #e5e5e5',
boxSizing: 'border-box'
}}
>
<div
style={{
width: '82px',
height: '82px',
borderRadius: '12px',
background: '#f1f1f1',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
flexShrink: 0,
color: '#999',
fontSize: '12px',
textAlign: 'center',
boxSizing: 'border-box',
overflow: 'hidden'
}}
>
{producto.imagen_url ? (
<img
src={producto.imagen_url}
alt={producto.nombre}
style={{
width: '100%',
height: '100%',
objectFit: 'cover',
display: 'block'
}}
/>
) : (
<span>Imagen</span>
)}
</div>

<div
style={{
flex: 1,
minWidth: 0
}}
>
<strong
style={{
display: 'block',
fontSize: '18px',
fontWeight: '800',
color: '#222',
lineHeight: '1.2'
}}
>
{producto.nombre}
</strong>

<div
style={{
marginTop: '6px',
fontSize: '14px',
lineHeight: '1.4',
color: '#666'
}}
>
{producto.descripcion}
</div>

<div
style={{
marginTop: '8px',
fontSize: '14px',
color: '#555'
}}
>
Cantidad: {producto.cantidad}
</div>

<textarea
value={modificaciones[producto.id] || ''}
onChange={(e) =>
setModificaciones({
...modificaciones,
[producto.id]: e.target.value
})
}
placeholder="Ej: sin tomate, sin sal..."
style={{
width: '100%',
minHeight: '54px',
marginTop: '8px',
padding: '8px',
borderRadius: '8px',
border: '1px solid #ccc',
boxSizing: 'border-box',
fontFamily: 'Arial, sans-serif',
fontSize: '14px',
resize: 'vertical'
}}
/>
</div>

<strong
style={{
fontSize: '18px',
fontWeight: '800',
whiteSpace: 'nowrap',
color: '#222',
alignSelf: 'flex-end'
}}
>
${(producto.precio * producto.cantidad).toLocaleString('es-AR')}
</strong>
</div>
))}

<div
style={{
marginTop: '20px',
padding: '16px 0',
borderTop: '1px solid #e5e5e5',
borderBottom: '1px solid #e5e5e5',
display: 'flex',
alignItems: 'center',
justifyContent: 'flex-end',
gap: '12px',
boxSizing: 'border-box'
}}
>
<svg
width="34"
height="34"
viewBox="0 0 24 24"
fill="none"
xmlns="http://www.w3.org/2000/svg"
aria-hidden="true"
style={{
color: '#e30613',
flexShrink: 0
}}
>
<path
d="M6 3H14L19 8V21H6V3Z"
stroke="currentColor"
strokeWidth="1.8"
strokeLinejoin="round"
/>
<path
d="M14 3V8H19"
stroke="currentColor"
strokeWidth="1.8"
strokeLinejoin="round"
/>
<path
d="M9 12H16"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
/>
<path
d="M9 16H14"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
/>
</svg>

<strong
style={{
fontSize: '24px',
fontWeight: '800',
color: '#222'
}}
>
Total
</strong>

<strong
style={{
fontSize: '28px',
fontWeight: '900',
color: '#b5121b',
whiteSpace: 'nowrap'
}}
>
${total.toLocaleString('es-AR')}
</strong>
</div>
<div style={{ marginTop: '20px' }}>
  <label style={{ fontWeight: 'bold' }}>
    ¿Querés agregar alguna indicación?
  </label>

  <textarea
    value={comentario}
    onChange={(e) => setComentario(e.target.value)}
    placeholder="Ej: Papas sin sal, hamburguesa sin tomate..."
    style={{
      width: '100%',
      minHeight: '90px',
      marginTop: '8px',
      padding: '10px',
      borderRadius: '10px',
      border: '1px solid #ccc',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      resize: 'vertical'
    }}
  />
</div>

<button
onClick={() => setConfirmandoPedido(false)}
style={{
width: '100%',
padding: '12px',
border: 'none',
borderRadius: '10px',
background: '#e5e7eb',
color: '#111827',
fontWeight: 'bold',
marginTop: '10px'
}}
>
Volver al pedido
</button>

<button
onClick={() => {
  setConfirmandoPedido(false)
  setFormularioPedido(true)
}}
style={{
width: '100%',
padding: '12px',
border: 'none',
borderRadius: '10px',
background: '#111827',
color: 'white',
fontWeight: 'bold',
marginTop: '10px'
}}
>
Continuar
</button>
</div>
</div>
)
}

if (rutaActual === "/menu-digital/restaurante") {
  return <PanelRestaurante />;
}

if (pedidoEnviado) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#4A0F16',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: 'white',
border: '1px solid #e7d9c7',
          borderRadius: '15px',
          padding: '25px',
          boxSizing: 'border-box',
          textAlign: 'center'
        }}
      >
<div
        style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 12px',
          borderRadius: '50%',
          background: '#fdebed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e30613'
        }}
      >
        <svg
          data-confirmacion-icono="true"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5 12.5L9.5 17L19 7.5"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

        <h2
style={{
  margin: 0,
  fontSize: '32px',
  fontWeight: '900',
  color: '#c9182b'
}}
>
¡Pedido enviado!
</h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            background: '#fff1f1',
            borderRadius: '14px',
            padding: '14px 20px',
            margin: '20px auto 18px',
            maxWidth: '420px',
            border: '1px solid #f3d2d2',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#fdebed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c9182b',
              flexShrink: 0
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 3.5h12v17l-2.2-1.5-1.8 1.5-2-1.5-2 1.5-2-1.5-2 1.5V3.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M9 8h6M9 12h6M9 16h3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#8b5b5b',
                letterSpacing: '0.5px',
                marginBottom: '2px'
              }}
            >
              NÚMERO DE PEDIDO
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: '900',
                color: '#c9182b',
                lineHeight: '1.1',
                wordBreak: 'break-word'
              }}
            >
              #{numeroPedido}
            </div>
          </div>
        </div>

        <p style={{ fontSize: '18px', color: '#555' }}>
          Tu pedido ha sido enviado.
        </p>

        <div
          style={{
            textAlign: 'left',
            background: '#f5f5f5',
            borderRadius: '10px',
            padding: '15px',
            marginTop: '20px'
          }}
        >
          <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  }}
>
  <div
    style={{
      width: '38px',
      height: '38px',
      borderRadius: '10px',
      backgroundColor: '#fdebed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#e30613',
      flexShrink: 0
    }}
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 20c.7-3.5 3.1-5.5 7-5.5s6.3 2 7 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  </div>

  <div style={{ flex: 1, minWidth: 0 }}>
    <strong>Cliente:</strong> {nombre}
  </div>
</div>
<div
style={{
display: 'flex',
alignItems: 'center',
gap: '12px',
marginBottom: '8px'
}}
>
<div
style={{
width: '38px',
height: '38px',
borderRadius: '10px',
backgroundColor: '#fdebed',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
color: '#e30613',
flexShrink: 0
}}
>
<svg
width="22"
height="22"
viewBox="0 0 24 24"
fill="none"
xmlns="http://www.w3.org/2000/svg"
aria-hidden="true"
>
<path
d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2.9.3 1.8.5 2.7.5.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.7 21 3 13.3 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 .9.2 1.8.5 2.7.1.4 0 .9-.2 1.2l-2.2 2.2Z"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
strokeLinejoin="round"
/>
</svg>
</div>

<div style={{ flex: 1, minWidth: 0 }}>
<strong>Teléfono:</strong> {telefono}
</div>
</div>



          <div
style={{
display: 'flex',
alignItems: 'center',
gap: '12px',
marginBottom: '8px'
}}
>
<div
style={{
width: '38px',
height: '38px',
borderRadius: '10px',
backgroundColor: '#fdebed',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
color: '#e30613',
flexShrink: 0
}}
>
<svg
width="22"
height="22"
viewBox="0 0 24 24"
fill="none"
xmlns="http://www.w3.org/2000/svg"
aria-hidden="true"
>
<path
d="M12 21s7-6.2 7-12A7 7 0 0 0 5 9c0 5.8 7 12 7 12Z"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
strokeLinejoin="round"
/>
<circle
cx="12"
cy="9"
r="2.5"
stroke="currentColor"
strokeWidth="1.8"
/>
</svg>
</div>
<div style={{ flex: 1, minWidth: 0 }}>
<strong>Ubicación:</strong>{' '}
{tipoLugar === 'Local'
? `Mesa ${mesa}`
: tipoLugar === 'Retiro'
? 'Para retirar'
: `Domicilio - ${direccion}`}
</div>
</div>


          <div
style={{
display: 'flex',
alignItems: 'center',
gap: '12px',
marginBottom: '8px'
}}
>
<div
style={{
width: '38px',
height: '38px',
borderRadius: '10px',
backgroundColor: '#fdebed',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
color: '#e30613',
flexShrink: 0
}}
>
<svg
width="22"
height="22"
viewBox="0 0 24 24"
fill="none"
xmlns="http://www.w3.org/2000/svg"
aria-hidden="true"
>
<rect
x="3"
y="5"
width="18"
height="14"
rx="2"
stroke="currentColor"
strokeWidth="1.8"
/>
<path
d="M3 9H21"
stroke="currentColor"
strokeWidth="1.8"
/>
<path
d="M7 15H11"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
/>
</svg>
</div>
<div style={{ flex: 1, minWidth: 0 }}>
<strong>Medio de pago:</strong> {medioPago}
</div>
</div>


<div
style={{
marginTop: '20px',
padding: '16px',
borderRadius: '12px',
backgroundColor: '#fdebed',
display: 'flex',
alignItems: 'center',
gap: '14px',
textAlign: 'left',
boxSizing: 'border-box'
}}
>
<div
style={{
width: '58px',
height: '58px',
borderRadius: '12px',
backgroundColor: '#fbdde1',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
flexShrink: 0,
color: '#c9182b'
}}
>
<svg
width="34"
height="34"
viewBox="0 0 24 24"
fill="none"
xmlns="http://www.w3.org/2000/svg"
aria-hidden="true"
>
<path
d="M3 17h13V9H8l-2 3H3v5Z"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
strokeLinejoin="round"
/>
<path
d="M16 12h3l2 2v3h-5"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
strokeLinejoin="round"
/>
<circle
cx="7"
cy="18"
r="2"
stroke="currentColor"
strokeWidth="1.8"
/>
<circle
cx="18"
cy="18"
r="2"
stroke="currentColor"
strokeWidth="1.8"
/>
<path
d="M10 6h4"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
/>
</svg>
</div>

<div>
<div
style={{
fontSize: '20px',
fontWeight: '800',
color: '#c9182b',
marginBottom: '4px'
}}
>
Gracias por tu compra
</div>

<div
style={{
fontSize: '14px',
color: '#555',
lineHeight: '1.4'
}}
>
En esta sección puedes ver el estado en tiempo real de tu pedido.
</div>
</div>
</div>
        </div>

<div
  style={{
    textAlign: 'left',
    background: '#f5f5f5',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '20px',
    marginBottom: '20px'
  }}
>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fdebed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e30613',
              flexShrink: 0
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 8h12l1 13H5L6 8Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M8 8V6a4 4 0 0 1 8 0v2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h3 style={{ margin: 0 }}>
            Resumen de tu pedido
          </h3>
        </div>

  {carrito.map((item) => (
<div
key={item.id}
style={{
display: 'flex',
alignItems: 'center',
gap: '12px',
padding: '12px 0',
borderBottom: '1px solid #eee'
}}
>
<div
style={{
width: '82px',
height: '62px',
borderRadius: '10px',
overflow: 'hidden',
background: '#f1f1f1',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
flexShrink: 0,
color: '#999',
fontSize: '12px',
textAlign: 'center'
}}
>
{item.imagen_url ? (
<img
src={item.imagen_url}
alt={item.nombre}
style={{
width: '100%',
height: '100%',
objectFit: 'cover',
display: 'block'
}}
/>
) : (
<span>Imagen</span>
)}
</div>

<div style={{ flex: 1, minWidth: 0 }}>
<strong
style={{
display: 'block',
fontSize: '17px',
fontWeight: '700',
color: '#222'
}}
>
{item.nombre} × {item.cantidad}
</strong>

{item.modificacion && (
<div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
<strong>Modificación:</strong> {item.modificacion}
</div>
)}
</div>

<strong style={{ whiteSpace: 'nowrap' }}>
${(item.precio * item.cantidad).toLocaleString('es-AR')}
</strong>
</div>
))}

        <div
style={{
marginTop: '20px',
marginBottom: '20px',
padding: '12px 14px',
background: '#fdebed',
borderRadius: '16px',
display: 'flex',
alignItems: 'center',
gap: '12px',
boxSizing: 'border-box'
}}
>
<div
style={{
width: '48px',
height: '48px',
borderRadius: '14px',
backgroundColor: '#fbd9de',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
color: '#e30613',
flexShrink: 0
}}
>
<svg
width="25"
height="25"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
strokeLinejoin="round"
>
<path d="M6 3h9l3 3v15H6z" />
<path d="M15 3v4h4" />
<path d="M9 13h6" />
<path d="M9 17h6" />
</svg>
</div>

<div style={{ flex: 1 }}>
  <div
    style={{
      fontSize: '14px',
      color: '#666',
      marginBottom: '4px'
    }}
  >
    Subtotal: ${total.toLocaleString('es-AR')}
  </div>

  {medioPago === 'Tarjeta' && (
    <div
      style={{
        fontSize: '14px',
        color: '#c9182b',
        marginBottom: '4px'
      }}
    >
      Recargo tarjeta (15%): ${(Math.round(total * 0.15 * 100) / 100).toLocaleString('es-AR')}
    </div>
  )}

  <strong
    style={{
      display: 'block',
      color: '#c9182b',
      fontSize: '22px',
      fontWeight: '800'
    }}
  >
    Total:
  </strong>
</div>

<strong
  style={{
    color: '#c9182b',
    fontSize: '25px',
    fontWeight: '900',
    whiteSpace: 'nowrap'
  }}
>
  ${(medioPago === 'Tarjeta'
    ? Math.round(total * 1.15 * 100) / 100
    : total
  ).toLocaleString('es-AR')}
</strong>
</div>

        <div
  style={{
    marginTop: '20px',
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    background: '#fff'
  }}
>
  <div
    style={{
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'left',
      marginBottom: '20px'
    }}
  >
<div
  style={{
    marginTop: '20px',
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    background: '#fff'
  }}
>
  <div
    style={{
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'left',
      marginBottom: '20px'
    }}
  >
    💳 ESTADO DEL PAGO
  </div>

  <div
    style={{
      fontSize: '22px',
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: '10px'
    }}
  >
    {estadoPago === "approved"
      ? "🟢 Pago realizado"
      : estadoPago === "pending"
      ? "🟠 Pago pendiente"
      : "🔴 Pago rechazado"}
  </div>

  <div
    style={{
      marginTop: '10px',
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.4',
      textAlign: 'center'
    }}
  >
    {estadoPago === "approved"
      ? "Tu pago con tarjeta fue aprobado correctamente."
      : estadoPago === "pending"
      ? "Estamos esperando la confirmación de tu pago."
      : "El pago con tarjeta no pudo ser aprobado."}
  </div>
</div>

    ♨️ ESTADO DE TU PEDIDO :
  </div>

  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '4px'
    }}
  >
    {[
      ['pendiente', 'Esperando confirmación'],
      ['aceptado', 'Pedido aceptado'],
      ['en_preparacion', 'En preparación'],
      ['listo', 'Pedido listo'],
      ['entregado', 'Entregado']
    ].map(([estado, texto], index, estados) => (
      <div
        key={estado}
        style={{
          flex: 1,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            margin: '0 auto 8px',
            border: '3px solid',
            borderColor: estadoPedido === estado ? '#f0aa00' : '#ccc',
            background: estadoPedido === estado ? '#f0aa00' : 'white',
            boxSizing: 'border-box'
          }}
        />

        <div
          style={{
            fontSize: '12px',
            fontWeight: estadoPedido === estado ? 'bold' : 'normal',
            color: estadoPedido === estado ? '#d99500' : '#555'
          }}
        >
          {texto}
        </div>
      </div>
    ))}
  </div>
</div>

<p style={{ color: '#555', marginTop: '20px' }}>
  {estadoPedido === "pendiente" && "🟡 Esperando confirmación."}
  {estadoPedido === "aceptado" && "🟢 Pedido aceptado."}
  {estadoPedido === "en_preparacion" && "🔵 En preparación."}
  {estadoPedido === "listo" && "🟢 ¡Tu pedido está listo!"}
  {estadoPedido === "entregado" && "⚪ Pedido entregado."}
  {estadoPedido === "rechazado" && "🟠 Pedido rechazado."}
</p>

        <button
          onClick={() => {
            sessionStorage.removeItem("pedidoEnviadoActivo")
            sessionStorage.removeItem("ultimoPedido")
            sessionStorage.removeItem("pantallaActual")
            localStorage.removeItem("pedidoEnviadoActivo")
            localStorage.removeItem("ultimoPedido")
            window.location.href =
              window.location.pathname +
              window.location.search +
              window.location.hash
          }}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '10px',
            background: '#111827',
            color: 'white',
            fontWeight: 'bold',
            marginTop: '20px'
          }}
        >
          Volver al menú
        </button>
      </div>
    </div>
    </div>
  )
}

if (formularioPedido) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#4A0F16',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box'
      }}
    >
              <div
          style={{
            maxWidth: '600px',
            margin: '0 auto 18px',
            color: 'white',
            textAlign: 'center',
            padding: '10px 10px 4px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              margin: '0 auto 12px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e30613'
            }}
          >
            <svg
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="8"
                r="3.2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M5.5 20C5.8 16.5 8.3 14.5 12 14.5C15.7 14.5 18.2 16.5 18.5 20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2
            style={{
              margin: 0,
            color: 'white',
              fontSize: '32px',
              fontWeight: '900',
              letterSpacing: '0.5px'
            }}
          >
            DATOS PARA TU PEDIDO
          </h2>

          <p
            style={{
              margin: '10px 0 0',
              color: 'white',
              fontSize: '18px'
            }}
          >
            Completá tus datos para continuar.
          </p>
        </div>

<div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: 'white',
border: '1px solid #e7d9c7',
          borderRadius: '15px',
          padding: '20px',
          boxSizing: 'border-box'
        }}
      >
        

        <div
data-form-icon="nombre"
style={{
display: 'flex',
alignItems: 'center',
gap: '10px',
marginBottom: '0'
}}
>
<span
style={{
width: '38px',
height: '38px',
borderRadius: '10px',
background: '#fff0f2',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
flexShrink: 0,
color: '#d91c2b'
}}
>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="2"/>
<path d="M5 20C5 16.7 8.1 14 12 14C15.9 14 19 16.7 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
</svg>
</span>
<label>Nombre</label>
</div>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '8px',
            marginBottom: '15px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            fontSize: '16px'
          }}
        />

        <div
data-form-icon="telefono"
style={{
display: 'flex',
alignItems: 'center',
gap: '10px',
marginBottom: '0'
}}
>
<span
style={{
width: '38px',
height: '38px',
borderRadius: '10px',
background: '#fff0f2',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
flexShrink: 0,
color: '#d91c2b'
}}
>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M6.6 3.5L9.1 3C9.7 2.9 10.2 3.2 10.4 3.8L11.5 7C11.7 7.5 11.5 8.1 11.1 8.4L9.5 9.6C10.3 11.4 11.8 12.9 13.6 13.7L14.8 12.1C15.1 11.7 15.7 11.5 16.2 11.7L19.4 12.8C20 13 20.3 13.5 20.2 14.1L19.7 16.6C19.6 17.3 19 17.8 18.3 17.8C10.9 17.5 6.5 13.1 6.2 5.7C6.2 5 6.7 4.4 6.6 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
</span>
<label>Teléfono</label>
</div>
        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Tu teléfono"
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '8px',
            marginBottom: '15px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            fontSize: '16px'
          }}
        />

      {medioPago === "Tarjeta" && (
        <div style={{ marginBottom: "15px" }}>
          <label>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu correo electrónico"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "15px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
              fontSize: "16px",
            }}
          />
        </div>
      )}

        <div
data-form-icon="ubicacion"
style={{
display: 'flex',
alignItems: 'center',
gap: '10px',
marginBottom: '0'
}}
>
<span
style={{
width: '38px',
height: '38px',
borderRadius: '10px',
background: '#fff0f2',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
flexShrink: 0,
color: '#d91c2b'
}}
>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M12 21C12 21 19 14.6 19 9.5C19 5.9 15.9 3 12 3C8.1 3 5 5.9 5 9.5C5 14.6 12 21 12 21Z" stroke="currentColor" strokeWidth="2"/>
<circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="2"/>
</svg>
</span>
<label>¿Dónde estás?</label>
</div>
<select
    value={tipoLugar}
    onChange={(e) => setTipoLugar(e.target.value)}
    style={{
        width: '100%',
        padding: '12px',
        marginTop: '8px',
        marginBottom: '15px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        fontSize: '16px'
    }}
>
    <option value="">Seleccioná una opción</option>
    <option value="Domicilio">🏠 Envío a domicilio</option>
    <option value="Local">🍽️ Estoy en el local</option>
          <option value="Retiro">🛍️ Para retirar</option>
</select>

{tipoLugar === 'Domicilio' && (
    <>
        <label>Dirección</label>
        <input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Dirección de entrega"
            style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                marginBottom: '15px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                fontSize: '16px'
            }}
        />
    </>
)}

{tipoLugar === 'Local' && (
    <>
        <label>Número de mesa</label>
        <input
            value={mesa}
            onChange={(e) => setMesa(e.target.value)}
            placeholder="Ej: Mesa 5"
            style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                marginBottom: '15px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                fontSize: '16px'
            }}
        />
    </>
)}

        <div
data-form-icon="pago"
style={{
display: 'flex',
alignItems: 'center',
gap: '10px',
marginBottom: '0'
}}
>
<span
style={{
width: '38px',
height: '38px',
borderRadius: '10px',
background: '#fff0f2',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
flexShrink: 0,
color: '#d91c2b'
}}
>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
<path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
<path d="M7 14H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
</svg>
</span>
<label>Medio de pago</label>
</div>
        <select
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '8px',
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            fontSize: '16px'
          }}
        >
          <option value="">Seleccioná un medio de pago</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Tarjeta">Tarjeta</option>
        </select>

<div style={{
  marginTop: "10px",
  marginBottom: "10px",
  padding: "12px",
  borderRadius: "8px",
  backgroundColor: "#f5f5f5",
  fontSize: "14px",
  textAlign: "center"
}}>
  En la siguiente sección podrás ver el estado real de tu pedido.
</div>
        <button
        onClick={() => procesarPedido()}

  style={{
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '10px',
    background: '#111827',
    color: 'white',
    fontWeight: 'bold',
    marginTop: '10px'
  }}
>
  Confirmar pedido
</button>

        <button
          onClick={() => setFormularioPedido(false)}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '10px',
            background: '#111827',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          Volver al pedido
        </button>
      </div>
    </div>
  )
}
  if (rutaActual === "/menu-digital/restaurante") {
    return <PanelRestaurante />
  }

return (
<div
style={{
minHeight: '100vh',
background: '#4A0F16',
fontFamily: 'Arial, sans-serif',
paddingBottom: '100px'
}}
>

<div style={{ width: "100%", position: "relative", overflow: "hidden", background: "#111" }}>
<div style={{
  position: 'absolute',
  top: '18px',
  left: '18px',
  zIndex: 2
}}>
  <img
    src="/logo-bodega.png"
    alt="La Bodega del Sabor"
    style={{
      width: '105px',
      height: '105px',
      objectFit: 'contain',
      display: 'block'
    }}
  />
</div>

  <img
    src="/banner-bodega.png"
    alt="La Bodega del Sabor"
    style={{ display: "block", width: "100%", height: "auto" }}
  />
</div>
<div style={{ position: 'relative', maxWidth: '500px', margin: '12px auto 8px' }}>
    <input
      type="text"
      placeholder="Buscar productos..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '12px 45px 12px 15px',
        borderRadius: '22px',
        border: 'none',
        fontSize: '16px',
        outline: 'none'
      }}
    />

    <span
      style={{
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '18px',
        color: '#666',
        pointerEvents: 'none'
      }}
    >
      🔍
    </span>
  </div>


<div
style={{
display: 'flex',
gap: '14px',
padding: '20px 15px',
overflowX: 'auto',
background: 'white'
}}
>
{categoriasMenu.map((cat, indiceCategoria) => {
  const categoriaId = categoriasIdsMenu[indiceCategoria];

  return (
<button
key={cat}
onClick={() => setCategoria(cat)}
style={{
minWidth: '125px',
height: '140px',
padding: '14px 10px',
borderRadius: '16px',
border: '1px solid #e5e7eb',
background: categoria === cat ? '#b5122a' : 'white',
color: categoria === cat ? 'white' : '#111827',
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
justifyContent: 'center',
gap: '10px',
boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
fontSize: '15px',
fontWeight: '600',
flexShrink: 0
}}
>
<span style={{ fontSize: '38px', lineHeight: 1 }}>
  {cat === 'Todos' ? '🏠' : {
      "19d9975b-48f0-422c-aa20-c94e62fff9e9": "🍟",
      "f2e400e3-705e-4a06-a3f5-d949b310c9e0": "🍔",
      "84f66088-3578-460a-a98c-5e4f2b9bb898": "🥤",
      "1d2bab94-81f8-4704-bb41-e9ad57aacba4": "🍔🥤",
      "dc5276b7-4097-4d0f-b9a1-4942899999b7": "⭐",
      "b832337a-5fce-4f63-9b06-a13baeca6592": "➕",
      "e4fe5dfd-6836-4e9d-a4f2-706a44ef1c98": "🍕",
      "3065bab1-d343-483e-9c9f-60853a7992ed": "🍽️",
      "a36db80e-8590-4244-90ad-a4b45bb68932": "🥪",
      "1e483d9c-1c7e-4272-a1eb-aa6e8590d440": "🧇"
    }[categoriaId] || '📁'}
</span>
<span>
{cat === 'Hamburguesas' ? 'Burgers' :
cat === 'Porciones de papas' ? 'Papas' :
cat === 'Todos' ? 'Inicio' :
cat}
</span>
</button>
  );
})}
</div>



<div style={{
  display: 'flex',
alignItems: 'center',
justifyContent: 'space-between',
textAlign: 'left',
  margin: '10px 20px',
  padding: '12px 15px',
  background: '#f5f5f5',
  borderRadius: '12px'
}}>
  {restaurante.mensaje}

<button
    onClick={() => setMostrarPedido(true)}
    style={{
      border: 'none',
      background: 'white',
      color: '#111827',
      borderRadius: '22px',
      padding: '10px 14px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    }}
  >
    🛒 {carrito.length}
  </button>
</div>


<main style={{ padding: '20px' }}>
<h2 style={{ marginTop: 0 }}>
{categoria}
</h2>

<div
style={{
display: 'grid',
gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
gap: '14px',
alignItems: 'stretch'
}}
>
{productosFiltrados.map((producto) => (
<div
key={producto.id}
style={{
background: 'white',
border: '1px solid #e7d9c7',
borderRadius: '15px',
padding: '18px',
marginBottom: '15px',
boxShadow:
'0 2px 8px rgba(0,0,0,0.08)'
}}
>
<div style={{ width: "100%", height: "180px", borderRadius: "12px", overflow: "hidden", background: "#f1f1f1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}>
{producto.imagen_url || producto.imagen ? <img src={producto.imagen_url || producto.imagen} alt={producto.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#999", fontSize: "15px" }}>Imagen del producto</span>}
</div>
<h2 style={{ marginTop: 0 }}>
{producto.nombre}
</h2>

<p style={{ color: '#666' }}>
{producto.descripcion}
</p>

<p
style={{
fontSize: '20px',
fontWeight: 'bold'
}}
>
${producto.precio.toLocaleString('es-AR')}
</p>

<button
onClick={() => agregar(producto)}
style={{
width: '100%',
padding: '13px',
border: 'none',
borderRadius: '10px',
background: '#b5122a',
color: 'white',
fontSize: '16px',
fontWeight: 'bold'
}}
>
+ Agregar al pedido
</button>
</div>
))}
</div>
</main>

<div
style={{
position: 'fixed',
bottom: 0,
left: 0,
right: 0,
background: '#111827',
color: 'white',
padding: '15px 20px',
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center'
}}
>
<div>
<strong>{carrito.length}</strong> producto(s)
<br />
Total:{' '}
<strong>
${total.toLocaleString('es-AR')}
</strong>
</div>

<button
onClick={() =>
setMostrarPedido(true)}
style={{
padding: '12px 18px',
border: 'none',
borderRadius: '10px',
background: '#f59e0b',
color: '#111827',
fontWeight: 'bold'
}}
>
Ver pedido
</button>
</div>

{mostrarPedido && (
<div
style={{
position: 'fixed',
top: 0,
left: 0,
right: 0,
bottom: 0,
background: 'rgba(0,0,0,0.6)',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
padding: '20px',
zIndex: 1000
}}
>
<div
style={{
background: 'white',
border: '1px solid #e7d9c7',
width: '100%',
maxWidth: '500px',
maxHeight: '80vh',
overflowY: 'auto',
borderRadius: '15px',
padding: '20px',
color: '#111827'
}}
>
<h2 style={{ marginTop: 0 }}>
Tu pedido
</h2>

{carrito.length === 0 ? (
<p>Tu pedido está vacío.</p>
) : (
carrito.map((producto, index) => (
<div
key={index}
style={{
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
padding: '10px 0',
borderBottom: '1px solid #ddd'
}}
>
<span>{producto.nombre}</span>

<div
style={{
display: 'flex',
alignItems: 'center',
gap: '10px'
}}
>
<button onClick={() => disminuir(producto.id)}>
−
</button>

<span>{producto.cantidad}</span>

<button onClick={() => aumentar(producto.id)}>
+
</button>
</div>

<strong>
{(producto.precio * producto.cantidad).toLocaleString('es-AR')}
</strong>
</div>))
)}

<h3>
Total: ${total.toLocaleString('es-AR')}
</h3>

<button
onClick={() => setMostrarPedido(false)}
style={{
width: '100%',
padding: '12px',
border: 'none',
borderRadius: '10px',
background: '#111827',
color: 'white',
fontWeight: 'bold',
marginTop: '10px'
}}
>
Volver al menú
</button>
<button
onClick={() => setConfirmandoPedido(true)}
style={{
width: '100%',
padding: '12px',
border: 'none',
borderRadius: '10px',
background: '#111827',
color: 'white',
fontWeight: 'bold',
marginTop: '10px'
}}
>
Continuar
</button>
</div>
</div>
)}
</div>
)
}

export default App

