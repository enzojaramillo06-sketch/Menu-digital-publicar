import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Dashboard from './Dashboard'

function PanelRestaurante() {
  const [pedidos, setPedidos] = useState([])
  const [seccionActiva, setSeccionActiva] = useState(() => {
    const guardada = sessionStorage.getItem('panelSeccionActiva')
    return guardada === 'dashboard' ? 'dashboard' : guardada === 'configuracion' ? 'configuracion' : 'pedidos'
  })

  useEffect(() => {
    sessionStorage.setItem('panelSeccionActiva', seccionActiva)
  }, [seccionActiva])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categorias, setCategorias] = useState([])
  const [busquedaCategorias, setBusquedaCategorias] = useState('')
  const [productos, setProductos] = useState([])
  const [busquedaProductos, setBusquedaProductos] = useState('')
  const [filtroCategoriaProductos, setFiltroCategoriaProductos] = useState('todas')
  const [filtroEstadoProductos, setFiltroEstadoProductos] = useState('todos')
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const [cargandoAuth, setCargandoAuth] = useState(true)
  const [emailLogin, setEmailLogin] = useState('')
  const [passwordLogin, setPasswordLogin] = useState('')
  const [errorLogin, setErrorLogin] = useState('')
  const [cargandoLogin, setCargandoLogin] = useState(false)

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const termino = busqueda.trim().toLowerCase()

    if (!termino) return true

    return (
      String(pedido.numero_pedido || '').toLowerCase().includes(termino) ||
      String(pedido.cliente || '').toLowerCase().includes(termino) ||
      String(pedido.telefono || '').toLowerCase().includes(termino)
    )
  })

  useEffect(() => {
    const verificarSesion = async () => {
      const { data } = await supabase.auth.getSession()
      setUsuario(data.session?.user ?? null)
      setCargandoAuth(false)
    }

    verificarSesion()
  }, [])

  const iniciarSesion = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { error: error.message }
    }

    setUsuario(data.user)
    return { error: null }
  }

  const cargarPedidos = async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')

    if (error) {
      console.error('Error al cargar pedidos:', error)
      setError(error.message)
      setCargando(false)
      return
    }

    setPedidos(data || [])
    setError('')
    setCargando(false)
  }

  useEffect(() => {
    if (!usuario) return

    cargarPedidos()

    const intervalo = setInterval(() => {
      cargarPedidos()
    }, 5000)

    return () => clearInterval(intervalo)
  }, [usuario])

  useEffect(() => {
    if (!usuario) return

    const cargarCategorias = async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('orden', { ascending: true })

      if (error) {
        console.error('Error al cargar categorías:', error)
        return
      }

      setCategorias(data || [])
    }

    cargarCategorias()
  }, [usuario])

  useEffect(() => {
  if (!usuario) return

  const cargarProductos = async () => {
    setCargandoProductos(true)

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('categoria_id', { ascending: true })
      .order('orden', { ascending: true })
      .order('nombre', { ascending: true })

    if (error) {
      console.error('Error al cargar productos:', error)
      setCargandoProductos(false)
      return
    }

    setProductos(data || [])
    setCargandoProductos(false)
  }

  cargarProductos()
}, [usuario])

const cambiarEstadoCategoria = async (id, activoActual) => {
    const { error } = await supabase
      .from('categorias')
      .update({ activo: !activoActual })
      .eq('id', id);

    if (error) {
      console.error('Error al cambiar estado de categoría:', error);
      alert('No se pudo cambiar el estado de la categoría: ' + error.message);
      return;
    }

    setCategorias(prev =>
      prev.map(categoria =>
        categoria.id === id
          ? { ...categoria, activo: !activoActual }
          : categoria
      )
    );
  };

const cambiarNombreCategoria = async (id, nombreActual) => {
  const nuevoNombre = prompt("Nuevo nombre para la categoría:", nombreActual);

  if (nuevoNombre === null) return;

  const nombre = nuevoNombre.trim();

  if (!nombre) {
    alert("El nombre no puede estar vacío.");
    return;
  }

  const { error } = await supabase
    .from("categorias")
    .update({ nombre })
    .eq("id", id);

  if (error) {
    console.error("Error al cambiar nombre de categoría:", error);
    alert("No se pudo cambiar el nombre de la categoría: " + error.message);
    return;
  }

  setCategorias(prev =>
    prev.map(categoria =>
      categoria.id === id
        ? { ...categoria, nombre }
        : categoria
    )
  );
};


  const crearCategoria = async () => {
  const nuevoNombre = prompt("Nombre de la nueva categoría:");

  if (nuevoNombre === null) return;

  const nombre = nuevoNombre.trim();

  if (!nombre) {
    alert("El nombre no puede estar vacío.");
    return;
  }

  const { data: ultimaCategoria, error: errorOrden } = await supabase
    .from('categorias')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errorOrden) {
    console.error("Error al obtener el orden de la categoría:", errorOrden);
    alert("No se pudo determinar el orden de la nueva categoría: " + errorOrden.message);
    return;
  }

  const nuevoOrden = (ultimaCategoria?.orden ?? 0) + 1;

  const { data, error } = await supabase
    .from('categorias')
    .insert({
      nombre,
      orden: nuevoOrden,
      activo: true
    })
    .select()
    .single();

  if (error) {
    console.error("Error al crear categoría:", error);
    alert("No se pudo crear la categoría: " + error.message);
    return;
  }

  setCategorias(prev =>
    [...prev, data].sort((a, b) => a.orden - b.orden)
  );
};

const eliminarCategoria = async (id, nombreCategoria) => {
  const { count, error: errorProductos } = await supabase
    .from('productos')
    .select('id', { count: 'exact', head: true })
    .eq('categoria_id', id);

  if (errorProductos) {
    console.error("Error al comprobar productos de la categoría:", errorProductos);
    alert("No se pudo comprobar si la categoría tiene productos: " + errorProductos.message);
    return;
  }

  if ((count ?? 0) > 0) {
    alert(
      "No se puede eliminar la categoría \"" +
      nombreCategoria +
      "\" porque tiene " +
      count +
      " producto(s) asociado(s)."
    );
    return;
  }

  const confirmar = window.confirm(
    '¿Seguro que querés eliminar la categoría "' + nombreCategoria + '"?'
  );

  if (!confirmar) return;

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error al eliminar categoría:", error);
    alert("No se pudo eliminar la categoría: " + error.message);
    return;
  }

  setCategorias(prev =>
    prev.filter(categoria => categoria.id !== id)
  );
};

const moverCategoria = async (id, direccion) => {
  const indiceActual = categorias.findIndex(categoria => categoria.id === id);
  const nuevoIndice = indiceActual + direccion;

  if (indiceActual < 0 || nuevoIndice < 0 || nuevoIndice >= categorias.length) {
    return;
  }

  const categoriaActual = categorias[indiceActual];
  const categoriaVecina = categorias[nuevoIndice];

  const ordenActual = categoriaActual.orden;
  const ordenVecino = categoriaVecina.orden;

  const { error: errorTemporal } = await supabase
    .from('categorias')
    .update({ orden: -1 })
    .eq('id', categoriaActual.id);

  if (errorTemporal) {
    console.error('Error al preparar el cambio de orden:', errorTemporal);
    alert('No se pudo cambiar el orden de la categoría: ' + errorTemporal.message);
    return;
  }

  const { error: errorVecina } = await supabase
    .from('categorias')
    .update({ orden: ordenActual })
    .eq('id', categoriaVecina.id);

  if (errorVecina) {
    console.error('Error al cambiar el orden de la categoría vecina:', errorVecina);
    await supabase
      .from('categorias')
      .update({ orden: ordenActual })
      .eq('id', categoriaActual.id);
    alert('No se pudo cambiar el orden de la categoría: ' + errorVecina.message);
    return;
  }

  const { error: errorActual } = await supabase
    .from('categorias')
    .update({ orden: ordenVecino })
    .eq('id', categoriaActual.id);

  if (errorActual) {
    console.error('Error al finalizar el cambio de orden:', errorActual);
    await supabase
      .from('categorias')
      .update({ orden: ordenVecino })
      .eq('id', categoriaVecina.id);
    await supabase
      .from('categorias')
      .update({ orden: ordenActual })
      .eq('id', categoriaActual.id);
    alert('No se pudo cambiar el orden de la categoría: ' + errorActual.message);
    return;
  }

  setCategorias(prev => {
    const copia = [...prev];
    [copia[indiceActual], copia[nuevoIndice]] = [copia[nuevoIndice], copia[indiceActual]];

    return copia.map((categoria, indice) => ({
      ...categoria,
      orden: indice === indiceActual
        ? ordenVecino
        : indice === nuevoIndice
          ? ordenActual
          : categoria.orden
    }));
  });
};


const cargarImagenProducto = async (producto) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = async (evento) => {
    const archivoSeleccionado = evento.target.files?.[0];

    if (!archivoSeleccionado) return;

    if (!archivoSeleccionado.type.startsWith('image/')) {
      alert('El archivo seleccionado no es una imagen válida.');
      return;
    }

    if (archivoSeleccionado.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5 MB.');
      return;
    }

    const extension = (
      archivoSeleccionado.name.split('.').pop() || 'jpg'
    ).toLowerCase();

    const nombreArchivo = `${producto.id}-${Date.now()}.${extension}`;
    const ruta = `${producto.id}/${nombreArchivo}`;

    const { error: errorSubida } = await supabase
      .storage
      .from('productos')
      .upload(ruta, archivoSeleccionado, {
        cacheControl: '3600',
        upsert: false
      });

    if (errorSubida) {
      console.error('Error al subir imagen:', errorSubida);
      alert('No se pudo subir la imagen: ' + errorSubida.message);
      return;
    }

    const { data: urlPublica } = supabase
      .storage
      .from('productos')
      .getPublicUrl(ruta);

    const imagenUrl = urlPublica?.publicUrl;

    if (!imagenUrl) {
      alert('La imagen se subió, pero no se pudo obtener su URL.');
      return;
    }

    const { error: errorActualizacion } = await supabase
      .from('productos')
      .update({ imagen_url: imagenUrl })
      .eq('id', producto.id);

    if (errorActualizacion) {
      console.error('Error al guardar imagen_url:', errorActualizacion);
      alert(
        'La imagen se subió, pero no se pudo guardar en el producto: ' +
        errorActualizacion.message
      );
      return;
    }

    setProductos(prev =>
      prev.map(item =>
        item.id === producto.id
          ? { ...item, imagen_url: imagenUrl }
          : item
      )
    );

    alert('Imagen cargada correctamente.');
  };

  input.click();
};

const editarProducto = async (producto) => {
  if (!producto || !producto.id) {
    alert("El producto seleccionado no es válido.");
    return;
  }

  const nuevoNombre = prompt(
    "Nombre del producto:",
    producto.nombre ?? ""
  );

  if (nuevoNombre === null) return;

  const nombre = nuevoNombre.trim();

  if (!nombre) {
    alert("El nombre del producto no puede estar vacío.");
    return;
  }

  const nuevoPrecio = prompt(
    "Precio del producto:",
    String(producto.precio ?? "")
  );

  if (nuevoPrecio === null) return;

  const precio = Number(
    nuevoPrecio.trim().replace(",", ".")
  );

  if (!Number.isFinite(precio) || precio < 0) {
    alert("El precio ingresado no es válido.");
    return;
  }

  const nuevaDescripcion = prompt(
    "Descripción del producto:",
    producto.descripcion ?? ""
  );

  if (nuevaDescripcion === null) return;

  const descripcion = nuevaDescripcion.trim();

  if (!categorias.length) {
    alert("No hay categorías disponibles para asignar el producto.");
    return;
  }

  const categoriaActual = categorias.find(
    categoria => String(categoria.id) === String(producto.categoria_id)
  );

  const opcionesCategorias = categorias
    .map((categoria, indice) =>
      (indice + 1) + ". " + categoria.nombre
    )
    .join("\n");

  const seleccion = prompt(
    "Elegí el número de la categoría:\n\n" +
    opcionesCategorias,
    categoriaActual
      ? String(categorias.findIndex(
          categoria => String(categoria.id) === String(producto.categoria_id)
        ) + 1)
      : ""
  );

  if (seleccion === null) return;

  const indiceCategoria = Number(seleccion) - 1;

  if (
    !Number.isInteger(indiceCategoria) ||
    indiceCategoria < 0 ||
    indiceCategoria >= categorias.length
  ) {
    alert("La categoría seleccionada no es válida.");
    return;
  }

  const categoriaSeleccionada = categorias[indiceCategoria];

  const { data, error } = await supabase
    .from('productos')
    .update({
      nombre,
      precio,
      descripcion,
      categoria_id: categoriaSeleccionada.id
    })
    .eq('id', producto.id)
    .select()
    .single();

  if (error) {
    console.error("Error al editar producto:", error);
    alert(
      "No se pudo editar el producto: " +
      error.message
    );
    return;
  }

  setProductos(prev =>
    prev
      .map(item =>
        item.id === producto.id
          ? { ...item, ...data }
          : item
      )
      .sort((a, b) => {
        if (String(a.categoria_id) !== String(b.categoria_id)) {
          return String(a.categoria_id).localeCompare(
            String(b.categoria_id)
          );
        }

        if ((a.orden ?? 0) !== (b.orden ?? 0)) {
          return (a.orden ?? 0) - (b.orden ?? 0);
        }

        return String(a.nombre ?? "").localeCompare(
          String(b.nombre ?? "")
        );
      })
  );

  alert("Producto editado correctamente.");
};

const cambiarEstadoProducto = async (id, activoActual) => {
  const nuevoEstado = !activoActual;

  const { error } = await supabase
    .from('productos')
    .update({ activo: nuevoEstado })
    .eq('id', id);

  if (error) {
    console.error('Error al cambiar estado del producto:', error);
    alert('No se pudo cambiar el estado del producto: ' + error.message);
    return;
  }

  setProductos(prev =>
    prev.map(producto =>
      producto.id === id
        ? { ...producto, activo: nuevoEstado }
        : producto
    )
  );
};

const eliminarProducto = async (id, nombre) => {
  const confirmar = window.confirm(
    `¿Seguro que querés eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`
  );

  if (!confirmar) return;

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar producto:', error);
    alert('No se pudo eliminar el producto: ' + error.message);
    return;
  }

  setProductos(prev =>
    prev.filter(producto => producto.id !== id)
  );

  alert('Producto eliminado correctamente.');
};

const moverProducto = async (id, direccion) => {
  const productoActual = productos.find(producto => producto.id === id);

  if (!productoActual) {
    alert("No se encontró el producto.");
    return;
  }

  const productosCategoria = productos
    .filter(producto => String(producto.categoria_id) === String(productoActual.categoria_id))
    .sort((a, b) => {
      if ((a.orden ?? 0) !== (b.orden ?? 0)) {
        return (a.orden ?? 0) - (b.orden ?? 0);
      }

      return String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""));
    });

  const indiceActual = productosCategoria.findIndex(producto => producto.id === id);

  if (indiceActual === -1) {
    alert("No se pudo ubicar el producto en su categoría.");
    return;
  }

  const indiceDestino =
    direccion === "arriba"
      ? indiceActual - 1
      : indiceActual + 1;

  if (indiceDestino < 0 || indiceDestino >= productosCategoria.length) {
    return;
  }

  const productoDestino = productosCategoria[indiceDestino];

  const ordenActual = productoActual.orden ?? 0;
  const ordenDestino = productoDestino.orden ?? 0;

  const { error: errorTemporal } = await supabase
    .from("productos")
    .update({ orden: ordenDestino })
    .eq("id", productoActual.id);

  if (errorTemporal) {
    console.error("Error al preparar el movimiento:", errorTemporal);
    alert("No se pudo mover el producto: " + errorTemporal.message);
    return;
  }

  const { error: errorDestino } = await supabase
    .from("productos")
    .update({ orden: ordenActual })
    .eq("id", productoDestino.id);

  if (errorDestino) {
    console.error("Error al completar el movimiento:", errorDestino);
    alert("No se pudo completar el movimiento: " + errorDestino.message);

    await supabase
      .from("productos")
      .update({ orden: ordenActual })
      .eq("id", productoActual.id);

    return;
  }

  setProductos(prev =>
    prev
      .map(producto => {
        if (producto.id === productoActual.id) {
          return { ...producto, orden: ordenDestino };
        }

        if (producto.id === productoDestino.id) {
          return { ...producto, orden: ordenActual };
        }

        return producto;
      })
      .sort((a, b) => {
        if (String(a.categoria_id) !== String(b.categoria_id)) {
          return String(a.categoria_id).localeCompare(String(b.categoria_id));
        }

        if ((a.orden ?? 0) !== (b.orden ?? 0)) {
          return (a.orden ?? 0) - (b.orden ?? 0);
        }

        return String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""));
      })
  );
};

const crearProducto = async () => {
  const nuevoNombre = prompt("Nombre del nuevo producto:");

  if (nuevoNombre === null) return;

  const nombre = nuevoNombre.trim();

  if (!nombre) {
    alert("El nombre del producto no puede estar vacío.");
    return;
  }

  const nuevoPrecio = prompt("Precio del producto:");

  if (nuevoPrecio === null) return;

  const precio = Number(
    nuevoPrecio.trim().replace(',', '.')
  );

  if (!Number.isFinite(precio) || precio < 0) {
    alert("El precio ingresado no es válido.");
    return;
  }

  const nuevaDescripcion = prompt("Descripción del producto:");

  if (nuevaDescripcion === null) return;

  const descripcion = nuevaDescripcion.trim();

  if (!categorias.length) {
    alert("No hay categorías disponibles para asignar el producto.");
    return;
  }

  const opcionesCategorias = categorias
    .map((categoria, indice) =>
      (indice + 1) + ". " + categoria.nombre
    )
    .join("\n");

  const seleccion = prompt(
    "Elegí el número de la categoría:\n\n" + opcionesCategorias
  );

  if (seleccion === null) return;

  const indiceCategoria = Number(seleccion) - 1;

  if (
    !Number.isInteger(indiceCategoria) ||
    indiceCategoria < 0 ||
    indiceCategoria >= categorias.length
  ) {
    alert("La categoría seleccionada no es válida.");
    return;
  }

  const categoriaSeleccionada = categorias[indiceCategoria];

  const { data: ultimoProducto, error: errorOrden } = await supabase
    .from('productos')
    .select('orden')
    .eq('categoria_id', categoriaSeleccionada.id)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errorOrden) {
    console.error("Error al obtener el orden del producto:", errorOrden);
    alert(
      "No se pudo determinar el orden del producto: " +
      errorOrden.message
    );
    return;
  }

  const nuevoOrden = (ultimoProducto?.orden ?? 0) + 1;

  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre,
      precio,
      descripcion,
      categoria_id: categoriaSeleccionada.id,
      imagen_url: null,
      orden: nuevoOrden,
      activo: true
    })
    .select()
    .single();

  if (error) {
    console.error("Error al crear producto:", error);
    alert(
      "No se pudo crear el producto: " +
      error.message
    );
    return;
  }

  setProductos(prev =>
    [...prev, data].sort((a, b) => {
      if (a.categoria_id !== b.categoria_id) {
        return String(a.categoria_id).localeCompare(
          String(b.categoria_id)
        );
      }

      if ((a.orden ?? 0) !== (b.orden ?? 0)) {
        return (a.orden ?? 0) - (b.orden ?? 0);
      }

      return String(a.nombre ?? '').localeCompare(
        String(b.nombre ?? '')
      );
    })
  );

  alert("Producto creado correctamente.");
};

const cambiarEstado = async (numeroPedido, nuevoEstado) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('numero_pedido', numeroPedido)
      .select('numero_pedido, estado')

    if (error) {
      console.error('Error al cambiar estado:', error)
      alert('No se pudo cambiar el estado: ' + error.message)
      return
    }
   
 setPedidos(prev =>
      prev.map(pedido =>
        pedido.numero_pedido === numeroPedido
          ? { ...pedido, estado: nuevoEstado }
          : pedido
      )
    )
  }

  const rechazarPedido = async (numeroPedido) => {
  const motivo = window.prompt("Ingrese el motivo del rechazo:");

  if (!motivo || !motivo.trim()) {
    return;
  }

  const motivoLimpio = motivo.trim();

  console.log("=== PRUEBA RECHAZAR PEDIDO ===");
  console.log("numeroPedido:", numeroPedido);
  console.log("motivo:", motivoLimpio);
  console.log("supabase:", supabase);

  try {
    console.log("Iniciando UPDATE en Supabase...");

    const resultado = await supabase
      .from("pedidos")
      .update({
        estado: "rechazado",
        motivo_rechazo: motivoLimpio
      })
      .eq("numero_pedido", numeroPedido)
      .select();

    console.log("RESULTADO COMPLETO:", resultado);

    if (resultado.error) {
      console.error("ERROR DE SUPABASE:", resultado.error);
      alert(
        "Supabase respondió con error:\n" +
        resultado.error.message
      );
      return;
    }

    console.log("UPDATE CORRECTO:", resultado.data);

    setPedidos(prev =>
      prev.map(pedido =>
        pedido.numero_pedido === numeroPedido
          ? {
              ...pedido,
              estado: "rechazado",
              motivo_rechazo: motivoLimpio
            }
          : pedido
      )
    );

    alert("Pedido rechazado correctamente.");

  } catch (e) {
    console.error("ERROR REAL DEL FETCH:", e);
    console.error("nombre:", e?.name);
    console.error("mensaje:", e?.message);
    console.error("stack:", e?.stack);

    alert(
      "ERROR REAL:\n" +
      "Nombre: " + (e?.name || "desconocido") + "\n" +
      "Mensaje: " + (e?.message || "desconocido")
    );
  }
};

const imprimirPedido = (pedido) => {
  const escapar = (valor) =>
    String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const ubicacion =
    pedido.tipo_lugar === 'Local'
      ? `Mesa ${pedido.mesa || ''}`
      : pedido.tipo_lugar === 'Domicilio'
      ? `Domicilio - ${pedido.direccion || ''}`
      : 'Retiro en el local';

  const productos = Array.isArray(pedido.productos)
    ? pedido.productos
        .map((item) => `
          <div class="producto">
            <div>
              <strong>${escapar(item.nombre)} × ${escapar(item.cantidad)}</strong>
              ${
                item.modificacion
                  ? `<div class="modificacion"><strong>Modificación:</strong> ${escapar(item.modificacion)}</div>`
                  : ''
              }
            </div>
            <strong>
              $${(
                Number(item.precio || 0) * Number(item.cantidad || 0)
              ).toLocaleString('es-AR')}
            </strong>
          </div>
        `)
        .join('')
    : '';

  const ventana = window.open('', '_blank', 'width=800,height=900');

  if (!ventana) {
    alert('No se pudo abrir la ventana de impresión.');
    return;
  }

  ventana.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Pedido ${escapar(pedido.numero_pedido)}</title>
      <style>
        @page {
        size: 58mm auto;
        margin: 0;
      }

      * {
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 10px 14px;
          color: #111;
          background: white;
        }

        .ticket {
                width: 58mm;
                max-width: 58mm;
                margin: 0 auto;
            }

        h1 {
          margin: 0 0 2px;
          font-size: 26px;
        }

        .numero {
          color: #555;
          font-size: 15px;
          margin-bottom: 8px;
        }

        .datos {
          border-top: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
          padding: 8px 0;
          margin-bottom: 8px;
        }

        .dato {
          margin: 3px 0;
          font-size: 15px;
        }

        h2 {
          font-size: 19px;
          margin: 0 0 6px;
        }

        .producto {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
          font-size: 15px;
        }

        .modificacion {
          margin-top: 5px;
          color: #555;
          font-size: 13px;
        }

        .comentario {
          margin-top: 8px;
          padding: 7px;
          border: 1px solid #ccc;
          font-size: 14px;
        }

        .total {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          padding-top: 7px;
          border-top: 2px solid #111;
          font-size: 21px;
        }

        @media print {
          body {
            padding: 0;
          }

          .ticket {
            max-width: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <h1>LA BODEGA DEL SABOR</h1>
        <div class="numero">
              Pedido: <strong>${escapar(pedido.numero_pedido)}</strong>
            </div>

            <div class="fecha">
              Fecha: ${pedido.fecha_creado
                ? new Date(pedido.fecha_creado).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : ''}
            </div>

        <div class="datos">
          <div class="dato"><strong>Cliente:</strong> ${escapar(pedido.cliente)}</div>
          <div class="dato"><strong>Teléfono:</strong> ${escapar(pedido.telefono)}</div>
          <div class="dato"><strong>Ubicación:</strong> ${escapar(ubicacion)}</div>
          <div class="dato"><strong>Medio de pago:</strong> ${escapar(pedido.medio_pago)}</div>
        </div>

        <h2>Productos</h2>

        ${productos}

        ${
          pedido.comentario
            ? `<div class="comentario"><strong>Comentario:</strong> ${escapar(pedido.comentario)}</div>`
            : ''
        }

        <div class="total">
          <strong>TOTAL</strong>
          <strong>$${Number(pedido.total || 0).toLocaleString('es-AR')}</strong>
        </div>
      </div>
    </body>
    </html>
  `);

  ventana.document.close();
  ventana.focus();

  setTimeout(() => {
    ventana.print();
  }, 300);
};

const colorEstado = (estado) => {
    if (estado === 'pendiente') return '#f59e0b'
    if (estado === 'En preparación') return '#3b82f6'
    if (estado === 'Listo') return '#22c55e'
    if (estado === 'Entregado') return '#6b7280'
    return '#6b7280'
  }

  if (cargandoAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <strong>Verificando acceso...</strong>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box'
      }}>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setErrorLogin('')
            setCargandoLogin(true)

            const resultado = await iniciarSesion(emailLogin, passwordLogin)

            setCargandoLogin(false)

            if (resultado.error) {
              setErrorLogin(resultado.error)
            }
          }}
          style={{
            width: '100%',
            maxWidth: '400px',
            background: 'white',
            padding: '30px',
            borderRadius: '18px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.10)',
            boxSizing: 'border-box'
          }}
        >
          <h1 style={{
            margin: '0 0 8px',
            textAlign: 'center',
            color: '#222',
            fontSize: '28px'
          }}>
            La Bodega del Sabor
          </h1>

          <p style={{
            margin: '0 0 25px',
            textAlign: 'center',
            color: '#777',
            fontSize: '15px'
          }}>
            Acceso al panel de administración
          </p>

          <label style={{
            display: 'block',
            marginBottom: '7px',
            fontWeight: '700',
            color: '#333'
          }}>
            Correo electrónico
          </label>

          <input
            type="email"
            value={emailLogin}
            onChange={(e) => setEmailLogin(e.target.value)}
            required
            autoComplete="username"
            placeholder="Ingresá tu correo"
            style={{
              width: '100%',
              padding: '13px',
              marginBottom: '16px',
              border: '1px solid #ddd',
              borderRadius: '10px',
              boxSizing: 'border-box',
              fontSize: '15px'
            }}
          />

          <label style={{
            display: 'block',
            marginBottom: '7px',
            fontWeight: '700',
            color: '#333'
          }}>
            Contraseña
          </label>

          <input
            type="password"
            value={passwordLogin}
            onChange={(e) => setPasswordLogin(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Ingresá tu contraseña"
            style={{
              width: '100%',
              padding: '13px',
              marginBottom: '16px',
              border: '1px solid #ddd',
              borderRadius: '10px',
              boxSizing: 'border-box',
              fontSize: '15px'
            }}
          />

          {errorLogin && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '10px',
              background: '#ffe8e8',
              color: '#b42318',
              fontSize: '14px'
            }}>
              {errorLogin}
            </div>
          )}

          <button
            type="submit"
            disabled={cargandoLogin}
            style={{
              width: '100%',
              padding: '13px',
              border: 'none',
              borderRadius: '10px',
              background: '#111',
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              cursor: cargandoLogin ? 'default' : 'pointer',
              opacity: cargandoLogin ? 0.7 : 1
            }}
          >
            {cargandoLogin ? 'Ingresando...' : 'Ingresar al panel'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#111827',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box',
        display: 'flex',
        gap: '20px',
        alignItems: 'stretch'
      }}
    >
      <aside
        style={{
          width: '220px',
          minWidth: '220px',
          background: '#0f1b2d',
          color: 'white',
          borderRadius: '14px',
          padding: '18px',
          boxSizing: 'border-box',
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            textAlign: 'center',
            paddingBottom: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.12)'
          }}
        >
          <div style={{ fontSize: '42px', marginBottom: '8px' }}>🍔</div>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>Tu Restaurante</div>
          <div style={{ fontSize: '12px', color: '#aeb9c9', marginTop: '4px' }}>
            Panel Restaurante
          </div>
        </div>

        <nav style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            onClick={() => setSeccionActiva('pedidos')}
            style={{
              background: seccionActiva === 'pedidos' ? '#1677ff' : 'transparent',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            📋 <span>Pedidos</span>
          </div>

                <div
        onClick={() => setSeccionActiva('dashboard')}
        style={{
          background: seccionActiva === 'dashboard' ? '#1677ff' : 'transparent',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer'
        }}
      >
        📊 <span>Dashboard</span>
      </div>



          <div
              onClick={() => setSeccionActiva('configuracion')}
            style={{
              padding: '10px 12px',
              fontSize: '14px',
              color: '#d5dce6',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            ⚙️ <span>Configuración</span>
          </div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div
            style={{
              padding: '10px 12px',
              fontSize: '14px',
              color: '#d5dce6',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            ↪️ <span>Salir</span>
          </div>
        </div>
      </aside>
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
            display: seccionActiva === 'pedidos' ? 'block' : 'none',
        }}
      >
        <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '25px',
          padding: '18px 20px',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          boxSizing: 'border-box'
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: '800',
              color: '#222'
            }}
          >
            Panel de pedidos
          </h1>

          <p
            style={{
              color: '#666',
              margin: '6px 0 0',
              fontSize: '16px'
            }}
          >
            Administración de pedidos en tiempo real
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
            fontWeight: '700',
            color: '#333',
            whiteSpace: 'nowrap'
          }}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block'
            }}
          />
          En línea
          <div
            style={{
              fontSize: '13px',
              fontWeight: '400',
              color: '#888'
            }}
          >
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }).replace(/,/g, '')} - {new Date().toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </div>
        </div>
      </div>

        <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {[
          {
            titulo: 'Pendientes',
            estado: 'pendiente',
            color: '#f59e0b',
            fondo: '#fff7e6',
            icono: '📄'
          },
          {
            titulo: 'En preparación',
            estado: 'En preparación',
            color: '#3b82f6',
            fondo: '#eef6ff',
            icono: '👨‍🍳'
          },
          {
            titulo: 'Listos',
            estado: 'Listo',
            color: '#22c55e',
            fondo: '#effaf2',
            icono: '✓'
          },
          {
            titulo: 'Entregados',
            estado: 'Entregado',
            color: '#6b7280',
            fondo: '#f1f3f5',
            icono: '🚚'
          },
          {
            titulo: 'Rechazados',
            estado: 'rechazado',
            color: '#dc2626',
            fondo: '#fff0f0',
            icono: '✕'
          }
        ].map((resumen) => (
          <div
            key={resumen.estado}
            style={{
              background: resumen.fondo,
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: '800',
                color: resumen.color,
                flexShrink: 0
              }}
            >
              {resumen.icono}
            </div>

            <div>
              <div
                style={{
                  color: resumen.color,
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '2px'
                }}
              >
                {resumen.titulo}
              </div>

              <div
                style={{
                  color: '#222',
                  fontSize: '25px',
                  fontWeight: '800',
                  lineHeight: '1'
                }}
              >
                {pedidos.filter(p => p.estado === resumen.estado).length}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '20px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontSize: '22px',
            color: '#222',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          🔍
        </span>

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por número de pedido, cliente o teléfono..."
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            color: '#222',
            background: 'transparent'
          }}
        />
      </div>

      {cargando && (
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '15px',
              textAlign: 'center'
            }}
          >
            Cargando pedidos...
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '15px'
            }}
          >
            <strong>Error de Supabase:</strong>
            <br />
            {error}
          </div>
        )}

        {!cargando && pedidos.length === 0 && !error && (
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '15px',
              textAlign: 'center'
            }}
          >
            <h2>No hay pedidos</h2>
            <p>Los nuevos pedidos aparecerán aquí automáticamente.</p>
          </div>
        )}

        {pedidosFiltrados.map((pedido) => (
          <div
            key={pedido.numero_pedido}
            style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
        position: 'relative',
              }}
            >
              <div>
<div
style={{
fontSize: '12px',
fontWeight: '600',
marginBottom: '3px',
letterSpacing: '0.5px',
color: '#666'
}}
>
PEDIDO
</div>

<h2
style={{
margin: 0,
fontSize: '24px',
fontWeight: '800',
color: '#222'
}}
>
{pedido.numero_pedido}
</h2>
</div>
          <div style={{
            fontSize: '12px',
            color: '#777',
            marginTop: '3px'
          }}>
            {pedido.fecha_creado
              ? new Date(pedido.fecha_creado).toLocaleString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : ''}
          </div>

<span
style={{
background: colorEstado(pedido.estado),
color: 'white',
padding: '8px 12px',
borderRadius: '20px',
fontWeight: 'bold',
position: 'absolute',
left: '50%',
transform: 'translateX(-50%)'
}}
>
{pedido.estado || 'pendiente'}
</span>
            </div>

            <hr style={{ margin: '15px 0' }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '30px',
            alignItems: 'start'
          }}
        >
          <div>

            <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
<svg
width="16"
height="16"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
style={{flexShrink: 0, color: '#111'}}
>
<path d="M20 21a8 8 0 0 0-16 0" />
<circle cx="12" cy="7" r="4" />
</svg>
<strong>Cliente:</strong> {pedido.cliente}
</p>

            <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
<svg
width="16"
height="16"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
style={{flexShrink: 0, color: '#111'}}
>
<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
</svg>
<strong>Teléfono:</strong> {pedido.telefono}
</p>

            <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
<svg
width="16"
height="16"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
style={{flexShrink: 0, color: '#111'}}
>
<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
<circle cx="12" cy="10" r="3" />
</svg>
<strong>Ubicación:</strong>{' '}
{pedido.tipo_lugar === 'Local'
? `Mesa ${pedido.mesa || ''}`
: pedido.tipo_lugar === 'Domicilio'
? `Domicilio - ${pedido.direccion || ''}`
: '📍 Retiro en el local'}
</p>

            <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
<svg
width="16"
height="16"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
style={{flexShrink: 0, color: '#111'}}
>
<rect x="3" y="5" width="18" height="14" rx="2" />
<line x1="3" y1="10" x2="21" y2="10" />
</svg>
<strong>Medio de pago:</strong> {pedido.medio_pago}
</p>
          </div>

          <div>

            {pedido.comentario && (
              <p>
                <strong>Comentario:</strong> {pedido.comentario}
              </p>
            )}

            <hr style={{ margin: '15px 0' }} />

            <h3>Productos</h3>

            {Array.isArray(pedido.productos) &&
              pedido.productos.map((item, index) => (
                <div
                  key={item.id || index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginBottom: '10px'
                  }}
                >
                  <div>
                <span>
                  {item.nombre} × {item.cantidad}
                </span>
                {item.modificacion && (
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    <strong>Modificación:</strong> {item.modificacion}
                  </div>
                )}
              </div>

                  <strong>
                    $
                    {(
                      Number(item.precio || 0) *
                      Number(item.cantidad || 0)
                    ).toLocaleString('es-AR')}
                  </strong>
                </div>
              ))}

            <h2 style={{ marginTop: '25px' }}>
              Total: $
              {Number(pedido.total || 0).toLocaleString('es-AR')}
            </h2>
          </div>
        </div>

            <div
style={{
display: 'flex',
justifyContent: 'flex-end',
alignItems: 'center',
gap: '10px',
flexWrap: 'wrap',
marginTop: '20px'
}}
>
{pedido.estado === 'pendiente' && (
  <button
    onClick={() =>
      cambiarEstado(
        pedido.numero_pedido,
        'aceptado'
      )
    }
    style={{
      width: 'auto',
      padding: '12px',
      marginTop: '10px',
      border: 'none',
      borderRadius: '10px',
      background: '#22c55e',
      color: 'white',
      fontWeight: 'bold'
    }}
  >
    🟢 Confirmar pedido
  </button>
)}

          {pedido.estado !== 'entregado' && pedido.estado !== 'rechazado' && (
            <>
              {pedido.estado === 'aceptado' && (
<button
                onClick={() =>
                  cambiarEstado(
                    pedido.numero_pedido,
                    'en_preparacion'
                  )
                }
                style={{
                  width: 'auto',
                  padding: '12px',
                  marginTop: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#3b82f6',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                🔵 En preparación
              </button>
)}

              {pedido.estado === 'en_preparacion' && (
<button
                onClick={() =>
                  cambiarEstado(
                    pedido.numero_pedido,
                    'listo'
                  )
                }
                style={{
                  width: 'auto',
                  padding: '12px',
                  marginTop: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#22c55e',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                🟢 Listo
              </button>
)}

              {pedido.estado === 'listo' && (
                <button
                  onClick={() =>
                    cambiarEstado(
                      pedido.numero_pedido,
                      'entregado'
                    )
                  }
                  style={{
                    width: 'auto',
                    padding: '12px',
                    marginTop: '10px',
                    border: 'none',
                    borderRadius: '10px',
                    background: '#6b7280',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  ⚪ Entregado
                </button>
              )}

              <button
                onClick={() => rechazarPedido(pedido.numero_pedido)}
                style={{
                  width: 'auto',
                  padding: '12px',
                  marginTop: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                🔴 Rechazar pedido
              </button>

      <button
        onClick={() => imprimirPedido(pedido)}
        style={{
          width: 'auto',
          padding: '12px',
          marginTop: '10px',
          border: '1px solid #d1d5db',
          borderRadius: '10px',
          background: 'white',
          color: '#111',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, color: "#111" }}
        >
          <path d="M6 9V3h12v6" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="7" rx="1" />
          <circle cx="18" cy="12" r="1" />
        </svg>
        Imprimir
      </button>
            </>
          )}

          {pedido.estado === 'rechazado' && pedido.motivo_rechazo && (
            <div
              style={{
                marginTop: '15px',
                padding: '12px',
                background: '#fee2e2',
                borderRadius: '10px',
                color: '#991b1b'
              }}
            >
              <strong>Motivo del rechazo:</strong>
              <br />
              {pedido.motivo_rechazo}
            </div>
          )}

        </div>
          </div>
        ))}
      </div>
    <div style={{ display: seccionActiva === 'dashboard' ? 'block' : 'none' }}>
  <Dashboard />
</div>

<div style={{ display: seccionActiva === 'configuracion' ? 'block' : 'none', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#222' }}>Configuración del menú</h1>
        <p style={{ marginTop: '8px', color: '#777', fontSize: '15px' }}>Administrá las categorías y productos de tu menú.</p>
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '25px'
}}>
  <h2 style={{ margin: 0, fontSize: '22px', color: '#222' }}>Categorías</h2>

  <button
    onClick={crearCategoria}
    style={{
      background: '#c9151e',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 18px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer'
    }}
  >
    + Nueva categoría
  </button>
</div>
<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
        <input
        type="text"
        value={busquedaCategorias}
        onChange={(e) => setBusquedaCategorias(e.target.value)}
        placeholder="Buscar categoría..."
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      />

{categorias
  .filter((categoria) =>
    String(categoria.nombre || '')
      .toLowerCase()
      .includes(busquedaCategorias.trim().toLowerCase())
  )
  .map((categoria) => (
    <div
      key={categoria.id}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        border: '1px solid #e5e5e5',
        borderRadius: '10px'
      }}
    >
      <span style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>
        {categoria.nombre}
      </span>
              <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                <button
                  onClick={() => moverCategoria(categoria.id, -1)}
                  style={{
                    border: '1px solid #ddd',
                    background: '#fff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '3px 7px'
                  }}
                  aria-label="Subir categoría"
                >
                  ↑
                </button>
                <button
                  onClick={() => moverCategoria(categoria.id, 1)}
                  style={{
                    border: '1px solid #ddd',
                    background: '#fff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '3px 7px'
                  }}
                  aria-label="Bajar categoría"
                >
                  ↓
                </button>
              </div>
      <button
                      onClick={() => cambiarEstadoCategoria(categoria.id, categoria.activo)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: categoria.activo ? '#16803c' : '#999',
                        padding: 0
                      }}
                    >
                      {categoria.activo ? 'Activa' : 'Inactiva'}
                    </button>
                    <button
                      onClick={() => cambiarNombreCategoria(categoria.id, categoria.nombre)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#555',
                        padding: 0
                      }}
                    >
                      Editar
                    </button>
<button
  onClick={() => eliminarCategoria(categoria.id, categoria.nombre)}
  style={{
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#d32f2f',
    padding: 0,
    marginLeft: '12px'
  }}
>
  Eliminar
</button>
    </div>
  ))}
</div>
      </div>
    

      <div style={{
        marginTop: '30px',
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        padding: '22px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#222' }}>
              Productos
            </h2>
            <p style={{ margin: '6px 0 0', color: '#777', fontSize: '14px' }}>
              Administrá los productos de tu menú.
            </p>
          </div>

          <button
            onClick={crearProducto}
            style={{
              background: '#c9151e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            + Nuevo producto
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginTop: '20px'
        }}>
          <input
            type="text"
            value={busquedaProductos}
            onChange={(e) => setBusquedaProductos(e.target.value)}
            placeholder="Buscar producto..."
            style={{
              flex: '1 1 260px',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />

          <select
            value={filtroCategoriaProductos}
            onChange={(e) => setFiltroCategoriaProductos(e.target.value)}
            style={{
              flex: '0 1 220px',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="todas">Todas las categorías</option>
            

          {categorias
            .filter((categoria) =>
              String(categoria.nombre || '')
                .toLowerCase()
                .includes(busquedaCategorias.trim().toLowerCase())
            )
            .map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <select
            value={filtroEstadoProductos}
            onChange={(e) => setFiltroEstadoProductos(e.target.value)}
            style={{
              flex: '0 1 170px',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>

        <div style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {productos
            .filter((producto) => {
              const termino = busquedaProductos.trim().toLowerCase();

              const coincideBusqueda =
                !termino ||
                String(producto.nombre || '').toLowerCase().includes(termino) ||
                String(producto.descripcion || '').toLowerCase().includes(termino);

              const coincideCategoria =
                filtroCategoriaProductos === 'todas' ||
                String(producto.categoria_id) === String(filtroCategoriaProductos);

              const coincideEstado =
                filtroEstadoProductos === 'todos' ||
                (filtroEstadoProductos === 'activos' && producto.activo) ||
                (filtroEstadoProductos === 'inactivos' && !producto.activo);

              return coincideBusqueda && coincideCategoria && coincideEstado;
            })
            .map((producto) => (
              <div
                key={producto.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr auto',
                  gap: '15px',
                  alignItems: 'center',
                  padding: '14px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '10px',
                  background: '#fff'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  background: '#f3f3f3',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '12px'
                }}>
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    'Sin foto'
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '16px',
                    color: '#222'
                  }}>
                    {producto.nombre}
                  </div>

                  <div style={{
                    marginTop: '4px',
                    fontSize: '13px',
                    color: '#777'
                  }}>
                    {categorias.find(c => String(c.id) === String(producto.categoria_id))?.nombre || 'Sin categoría'}
                  </div>

                  {producto.descripcion && (
                    <div style={{
                      marginTop: '4px',
                      fontSize: '13px',
                      color: '#888',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {producto.descripcion}
                    </div>
                  )}
                </div>

                <div style={{
                  textAlign: 'right',
                  whiteSpace: 'nowrap'
                }}>
                  <div style={{
                    fontWeight: '800',
                    fontSize: '16px',
                    color: '#222'
                  }}>
                    ${Number(producto.precio || 0).toLocaleString('es-AR')}
                  </div>

                  <div style={{
  display: 'flex',
  gap: '6px',
  marginTop: '8px',
  justifyContent: 'flex-end'
}}>
  <button
    onClick={() => moverProducto(producto.id, "arriba")}
    title="Mover producto hacia arriba"
    style={{
      border: '1px solid #ddd',
      background: '#fff',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '15px',
      width: '30px',
      height: '28px'
    }}
  >
    ↑
  </button>

  <button
    onClick={() => moverProducto(producto.id, "abajo")}
    title="Mover producto hacia abajo"
    style={{
      border: '1px solid #ddd',
      background: '#fff',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '15px',
      width: '30px',
      height: '28px'
    }}
  >
    ↓
  </button>
</div>

<button
  onClick={() => cargarImagenProducto(producto)}
  title="Cargar imagen del producto"
  style={{
    marginTop: '8px',
    marginRight: '8px',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    color: '#555'
  }}
>
  Imagen
</button>
<button
  onClick={() => editarProducto(producto)}
  title="Editar producto"
  style={{
    marginTop: '8px',
    marginRight: '8px',
              padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    color: '#555'
  }}
>
  Editar
</button>

<button
                    onClick={() => cambiarEstadoProducto(producto.id, producto.activo)}
                    title={producto.activo ? 'Desactivar producto' : 'Activar producto'}
                    style={{
                      marginTop: '5px',
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: producto.activo ? '#16803c' : '#999'
                    }}
                  >
                    {producto.activo ? 'Activo' : 'Inactivo'}
                  </button>

                    <button
                      onClick={() => eliminarProducto(producto.id, producto.nombre)}
                      style={{
                        marginLeft: '8px',
                marginTop: '8px',
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#b42318'
                      }}
                    >
                      Eliminar
                    </button>
                </div>
              </div>
            ))}

          {productos.filter((producto) => {
            const termino = busquedaProductos.trim().toLowerCase();

            const coincideBusqueda =
              !termino ||
              String(producto.nombre || '').toLowerCase().includes(termino) ||
              String(producto.descripcion || '').toLowerCase().includes(termino);

            const coincideCategoria =
              filtroCategoriaProductos === 'todas' ||
              String(producto.categoria_id) === String(filtroCategoriaProductos);

            const coincideEstado =
              filtroEstadoProductos === 'todos' ||
              (filtroEstadoProductos === 'activos' && producto.activo) ||
              (filtroEstadoProductos === 'inactivos' && !producto.activo);

            return coincideBusqueda && coincideCategoria && coincideEstado;
          }).length === 0 && (
            <div style={{
              padding: '30px',
              textAlign: 'center',
              color: '#888',
              border: '1px dashed #ddd',
              borderRadius: '10px'
            }}>
              No hay productos que coincidan con los filtros.
            </div>
          )}
        </div>
      </div>
</div>
    </div>
  )
}

export default PanelRestaurante
