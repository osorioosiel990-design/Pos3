# 🔍 Análisis de Inconsistencias y Mejoras - Ferretería Suárez

## 📊 Resumen Ejecutivo

Se han identificado **15 problemas críticos**, **8 datos faltantes** y **12 mejoras de representación** que pueden causar confusión en pequeños negocios.

---

## 🚨 PROBLEMAS CRÍTICOS

### 1. **Inconsistencia en Filtros de Stock (ALTA PRIORIDAD)**

**Ubicación:** `src/App.tsx` líneas 244-246, 318-322

**Problema:**
```typescript
// Filtros usan p.stock (total) en lugar de p.stockTienda
if (filterStatus === 'low') filtered = filtered.filter(p => p.stock > 0 && p.stock <= p.min);
if (filterStatus === 'out') filtered = filtered.filter(p => p.stock <= 0);

// StatusBadge también usa p.stock
if (p.stock <= 0) return <span className="badge badge-err">Agotado</span>;
if (p.stock <= p.min) return <span className="badge badge-warn">Bajo</span>;
```

**Impacto:**
- Un producto puede tener `stock = 50` (total) pero `stockTienda = 0`
- Aparecerá como "Disponible" cuando en realidad **NO se puede vender**
- El dueño verá "todo bien" pero no podrá vender nada

**Confusión para el negocio:**
> "El sistema dice que tengo 50 martillos, pero cuando voy a vender no hay ninguno en la tienda"

**Solución:**
```typescript
// Cambiar todos los filtros a stockTienda
if (filterStatus === 'low') filtered = filtered.filter(p => (p.stockTienda || 0) > 0 && (p.stockTienda || 0) <= p.min);
if (filterStatus === 'out') filtered = filtered.filter(p => (p.stockTienda || 0) <= 0);

// StatusBadge debe usar stockTienda
const stockDisponible = p.stockTienda || 0;
if (stockDisponible <= 0) return <span className="badge badge-err">Agotado</span>;
if (stockDisponible <= p.min) return <span className="badge badge-warn">Bajo</span>;
```

---

### 2. **Dashboard No Muestra Desglose de Inventario (ALTA PRIORIDAD)**

**Ubicación:** `src/App.tsx` líneas 199-203

**Problema:**
```typescript
const inversionCUP = productos.reduce((s, p) => s + (p.stock * p.pep), 0);
// Solo muestra el total, no desglosa por ubicación
```

**Impacto:**
- El dueño no sabe cuánto tiene invertido en tienda vs almacén
- No puede tomar decisiones sobre reposición
- No ve el dinero "atrapado" en el almacén

**Confusión para el negocio:**
> "Tengo 100,000 CUP en inventario, pero no sé cuánto puedo vender hoy"

**Solución:**
```typescript
const inversionTienda = productos.reduce((s, p) => s + ((p.stockTienda || 0) * p.pep), 0);
const inversionAlmacen = productos.reduce((s, p) => s + ((p.stockAlmacen || 0) * p.pep), 0);

// Mostrar en Dashboard:
<div className="kpi">
  <div className="kpi-label">💰 Inventario en Tienda</div>
  <div className="kpi-value">{fmt(inversionTienda)} CUP</div>
  <p className="equivalent">Disponible para venta</p>
</div>
<div className="kpi">
  <div className="kpi-label">📦 Inventario en Almacén</div>
  <div className="kpi-value">{fmt(inversionAlmacen)} CUP</div>
  <p className="equivalent">Requiere transferencia</p>
</div>
```

---

### 3. **Alertas de Stock Bajo No Especifican Ubicación (MEDIA PRIORIDAD)**

**Ubicación:** `src/App.tsx` líneas 174-175, 212-213

**Problema:**
```typescript
const stockBajo = productos.filter(p => p.stock > 0 && p.stock <= p.min);
// No distingue entre tienda y almacén
```

**Impacto:**
- Alerta dice "5 productos con stock bajo"
- Pero no dice si es en tienda o almacén
- El dueño puede pensar que necesita comprar más cuando solo necesita transferir

**Confusión para el negocio:**
> "Me dice que tengo stock bajo, pero tengo 100 unidades en el almacén. ¿Por qué me pide comprar más?"

**Solución:**
```typescript
const stockBajoTienda = productos.filter(p => (p.stockTienda || 0) > 0 && (p.stockTienda || 0) <= p.min);
const stockBajoAlmacen = productos.filter(p => (p.stockAlmacen || 0) > 0 && (p.stockAlmacen || 0) <= p.min);
const agotadosTienda = productos.filter(p => (p.stockTienda || 0) <= 0 && (p.stockAlmacen || 0) > 0);

// Alertas más específicas:
{agotadosTienda.length > 0 && (
  <div className="p-2 rounded" style={{ background: '#fee2e2' }}>
    <span className="text-sm text-red-700">
      🔴 {agotadosTienda.length} productos sin stock en tienda 
      (pero disponibles en almacén - transferir)
    </span>
  </div>
)}
```

---

### 4. **Métricas Semanales No Muestran Rotación de Inventario (MEDIA PRIORIDAD)**

**Ubicación:** `src/App.tsx` líneas 1173-1199

**Problema:**
- No hay forma de saber qué productos se venden más rápido
- No hay alerta de productos con baja rotación
- No se muestra el margen de ganancia promedio

**Impacto:**
- El dueño no sabe qué productos "no se mueven"
- No puede identificar productos obsoletos
- No optimiza el inventario

**Confusión para el negocio:**
> "Tengo productos que llevan meses en el almacén y no se venden. ¿Cómo sé cuáles son?"

**Solución:**
Agregar métricas de rotación:
```typescript
// Calcular rotación por producto
const rotacionProductos = productos.map(p => {
  const ventasProducto = ventasSemana
    .flatMap(v => v.items)
    .filter(it => it.productoId === p.id)
    .reduce((s, it) => s + it.cantidad, 0);
  
  const rotacion = p.stock > 0 ? (ventasProducto / p.stock) * 100 : 0;
  const margen = p.ventaCUP > 0 ? ((p.ventaCUP - p.pep) / p.ventaCUP) * 100 : 0;
  
  return { ...p, ventas: ventasProducto, rotacion, margen };
});

// Mostrar productos con baja rotación
const bajaRotacion = rotacionProductos.filter(p => p.rotacion < 10 && p.stock > 0);
```

---

### 5. **Exportación Excel No Incluye stockTienda/stockAlmacen (MEDIA PRIORIDAD)**

**Ubicación:** `src/App.tsx` líneas 1274-1275

**Problema:**
```typescript
// Solo exporta Stock (total), no desglosa por ubicación
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productos.map(p => ({
  ID: p.id, Código: p.codigo, Nombre: p.nombre,
  Stock: p.stock, // ❌ No incluye stockTienda ni stockAlmacen
  // ...
}))), 'Productos');
```

**Impacto:**
- El Excel no refleja la realidad del doble inventario
- No se puede analizar inventario por ubicación
- Pérdida de información crítica

**Solución:**
```typescript
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productos.map(p => ({
  ID: p.id, Código: p.codigo, Nombre: p.nombre,
  'Stock Tienda': p.stockTienda || 0,
  'Stock Almacén': p.stockAlmacen || 0,
  'Stock Total': p.stock,
  // ...
}))), 'Productos');
```

---

### 6. **Compras No Muestran Resumen de Destino (BAJA PRIORIDAD)**

**Ubicación:** `src/App.tsx` líneas 453-456

**Problema:**
```typescript
// La tabla de compras no muestra el destino
<table>
  <thead><tr><th>Fecha</th><th>Producto</th><th>Proveedor</th><th>Cant.</th>...</tr></thead>
  // ❌ Falta columna "Destino" (Tienda/Almacén)
</table>
```

**Impacto:**
- No se puede ver rápidamente dónde se almacenó cada compra
- Dificulta el seguimiento de inventario

**Solución:**
```typescript
<thead>
  <tr>
    <th>Fecha</th><th>Producto</th><th>Proveedor</th>
    <th>Destino</th> {/* NUEVO */}
    <th>Cant.</th><th>P.Unit CUP</th><th>Total CUP</th>
  </tr>
</thead>
<tbody>
  {compras.map(c => (
    <tr>
      <td>{fmtDate(c.fecha)}</td>
      <td>{c.productoNombre}</td>
      <td>{c.proveedor || '-'}</td>
      <td>{c.destino === 'tienda' ? '🏪 Tienda' : '📦 Almacén'}</td>
      <td>{c.cantidad}</td>
      <td>{fmt(c.precioUnitCUP)}</td>
      <td>{fmt(c.totalCUP)}</td>
    </tr>
  ))}
</tbody>
```

---

### 7. **No Hay Validación de Consistencia de Stock (ALTA PRIORIDAD)**

**Ubicación:** `src/App.tsx` línea 283

**Problema:**
```typescript
await dbPut('productos', { 
  ...editItem, 
  ...form, 
  stock: stockTotal, 
  stockTienda, 
  stockAlmacen 
});
// No valida que stockTienda + stockAlmacen === stock
```

**Impacto:**
- Si hay un error de cálculo, los datos quedan inconsistentes
- No hay forma de detectar el error
- Puede causar problemas en ventas y transferencias

**Solución:**
```typescript
// Validar consistencia
if (stockTienda + stockAlmacen !== stockTotal) {
  showToast('Error: Stock inconsistente', 'err');
  return;
}

// O mejor, calcular automáticamente:
const stockTotal = stockTienda + stockAlmacen; // Siempre calcular, nunca confiar en input manual
```

---

### 8. **Productos Antiguos No Tienen stockTienda/stockAlmacen (CRÍTICO)**

**Ubicación:** Migración de base de datos

**Problema:**
- Productos creados antes de la actualización tienen `stock` pero no `stockTienda` ni `stockAlmacen`
- El código asume que son 0 si no existen: `p.stockTienda || 0`
- Pero el stock real está en `p.stock`

**Impacto:**
- Productos antiguos aparecen con stock 0 en tienda y almacén
- No se pueden vender aunque tengan stock
- Pérdida de datos

**Solución:**
Crear script de migración:
```typescript
// Al abrir la app, verificar si hay productos sin stockTienda
const productos = await dbGetAll<Producto>('productos');
const necesitaMigracion = productos.some(p => p.stockTienda === undefined);

if (necesitaMigracion) {
  for (const p of productos) {
    if (p.stockTienda === undefined) {
      // Migrar stock antiguo a stockTienda
      await dbPut('productos', {
        ...p,
        stockTienda: p.stock,
        stockAlmacen: 0
      });
    }
  }
  showToast('Datos migrados correctamente', 'ok');
}
```

---

## 📋 DATOS FALTANTES

### 9. **No Hay Historial de Precios de Compra**

**Problema:**
- No se guarda el historial de precios de compra por proveedor
- No se puede ver la tendencia de precios
- No se puede negociar mejor con proveedores

**Confusión:**
> "¿A cuánto me vendió el proveedor la última vez? ¿Subió o bajó el precio?"

**Solución:**
Crear tabla `historialPrecios`:
```typescript
interface HistorialPrecio {
  id?: number;
  productoId: number;
  proveedor: string;
  precioCUP: number;
  precioUSD: number;
  fecha: number;
}
```

---

### 10. **No Hay Control de Caducidad/Vencimiento**

**Problema:**
- No hay campo para fecha de vencimiento
- No hay alertas de productos próximos a vencer
- Riesgo de pérdidas por productos vencidos

**Confusión:**
> "Tengo productos que se vencieron y no me di cuenta. ¿Cómo evito esto?"

**Solución:**
Agregar campo `fechaVencimiento` en Producto y alertas:
```typescript
const proximosVencer = productos.filter(p => {
  if (!p.fechaVencimiento) return false;
  const diasRestantes = (p.fechaVencimiento - Date.now()) / (1000 * 60 * 60 * 24);
  return diasRestantes <= 30; // 30 días o menos
});
```

---

### 11. **No Hay Código de Barras**

**Problema:**
- No hay campo para código de barras
- No se puede usar scanner
- Ingreso manual de productos es lento

**Confusión:**
> "Tengo que buscar cada producto manualmente. ¿No puedo usar un scanner?"

**Solución:**
Agregar campo `codigoBarras` en Producto y búsqueda por código de barras en POS.

---

### 12. **No Hay Múltiples Unidades de Medida por Producto**

**Problema:**
- Un producto solo tiene una unidad (ej: "Caja")
- No se puede vender por unidades sueltas
- No hay conversión automática

**Confusión:**
> "Vendo cajas de tornillos, pero a veces los clientes quieren tornillos sueltos. ¿Cómo lo manejo?"

**Solución:**
Sistema de unidades múltiples:
```typescript
interface UnidadProducto {
  unidad: string; // "Caja", "Unidad"
  factor: number; // 1 caja = 100 unidades
  precioCUP: number;
  precioUSD: number;
}

interface Producto {
  // ...
  unidades: UnidadProducto[];
}
```

---

### 13. **No Hay Reportes de Productos Más Rentables**

**Problema:**
- No hay ranking de productos por rentabilidad
- No se muestra el margen de ganancia por producto
- No se puede identificar qué productos dan más dinero

**Confusión:**
> "¿Qué productos me dan más ganancia? ¿En cuáles debo invertir más?"

**Solución:**
Agregar reporte de rentabilidad:
```typescript
const rentabilidad = productos.map(p => {
  const ventas = ventasSemana
    .flatMap(v => v.items)
    .filter(it => it.productoId === p.id);
  
  const ingreso = ventas.reduce((s, it) => s + it.subtotalCUP, 0);
  const costo = ventas.reduce((s, it) => s + (it.pep * it.cantidad), 0);
  const ganancia = ingreso - costo;
  const margen = ingreso > 0 ? (ganancia / ingreso) * 100 : 0;
  
  return { ...p, ingreso, costo, ganancia, margen };
}).sort((a, b) => b.ganancia - a.ganancia);
```

---

### 14. **No Hay Presupuesto/Objetivos de Venta**

**Problema:**
- No se pueden establecer objetivos de venta diarios/semanales
- No hay comparación con lo planificado
- No se puede medir el desempeño

**Confusión:**
> "¿Cómo voy comparado con lo que planeé vender esta semana?"

**Solución:**
Agregar campo de `objetivoVenta` en config y mostrar progreso:
```typescript
const progreso = (totalVentasSemana / cfg.objetivoVentaSemanal) * 100;
<div className="kpi">
  <div className="kpi-label">Progreso Semanal</div>
  <div className="kpi-value">{fmt(progreso)}%</div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progreso}%` }}></div>
  </div>
</div>
```

---

### 15. **No Hay Alertas de Stock Excesivo**

**Problema:**
- Solo hay alertas de stock bajo
- No hay alertas de exceso de inventario
- No se puede identificar dinero "atrapado" en stock

**Confusión:**
> "Tengo 500 martillos y solo vendo 10 al mes. ¿Es mucho?"

**Solución:**
Calcular días de inventario y alertar:
```typescript
const diasInventario = productos.map(p => {
  const ventasPromedio = /* calcular promedio diario */;
  const dias = ventasPromedio > 0 ? p.stock / ventasPromedio : Infinity;
  return { ...p, diasInventario: dias };
});

const stockExcesivo = diasInventario.filter(p => p.diasInventario > 180); // Más de 6 meses
```

---

## 🎨 MEJORAS DE REPRESENTACIÓN

### 16. **Dashboard Debería Mostrar Resumen Visual de Inventario**

**Mejora:**
```typescript
// Gráfico de barras mostrando inventario por ubicación
<div className="card p-4">
  <h3>Inventario por Ubicación</h3>
  <div className="flex gap-4">
    <div className="flex-1">
      <div className="text-sm mb-1">🏪 Tienda</div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div className="bg-green-600 h-4 rounded-full" style={{ width: `${(inversionTienda / inversionTotal) * 100}%` }}></div>
      </div>
      <div className="text-xs mt-1">{fmt(inversionTienda)} CUP ({fmt((inversionTienda / inversionTotal) * 100)}%)</div>
    </div>
    <div className="flex-1">
      <div className="text-sm mb-1">📦 Almacén</div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${(inversionAlmacen / inversionTotal) * 100}%` }}></div>
      </div>
      <div className="text-xs mt-1">{fmt(inversionAlmacen)} CUP ({fmt((inversionAlmacen / inversionTotal) * 100)}%)</div>
    </div>
  </div>
</div>
```

---

### 17. **Inventario Debería Mostrar Indicadores Visuales por Ubicación**

**Mejora:**
```typescript
// En la tabla de inventario, usar colores para cada ubicación
<td>
  <span className="inline-flex items-center gap-1">
    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
    {p.stockTienda || 0}
  </span>
</td>
<td>
  <span className="inline-flex items-center gap-1">
    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
    {p.stockAlmacen || 0}
  </span>
</td>
```

---

### 18. **POS Debería Mostrar Stock de Almacén como Referencia**

**Mejora:**
```typescript
// En POS, mostrar stock de tienda y almacén
<td>
  <div className="text-xs">
    <span className="font-bold text-green-600">🏪 {p.stockTienda || 0}</span>
    <span className="text-gray-400 ml-1">📦 {p.stockAlmacen || 0}</span>
  </div>
</td>
```

---

### 19. **Transferencias Deberían Mostrar Costo/Valor**

**Mejora:**
```typescript
// En tabla de transferencias, mostrar el valor transferido
<td>{fmt(t.cantidad * producto.pep)} CUP</td>
```

---

### 20. **Cierre Semanal Debería Mostrar Tendencia**

**Mejora:**
```typescript
// Comparar con semana anterior
const semanaAnterior = cierres.find(c => c.semanaInicio === week.start - 7 * 24 * 60 * 60 * 1000);
const cambio = semanaAnterior ? ((totalCUP - semanaAnterior.totalVentasCUP) / semanaAnterior.totalVentasCUP) * 100 : 0;

<div className="kpi">
  <div className="kpi-label">Ventas Semana</div>
  <div className="kpi-value">{fmt(totalCUP)} CUP</div>
  <p className={`text-xs ${cambio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
    {cambio >= 0 ? '↑' : '↓'} {fmt(Math.abs(cambio))}% vs semana anterior
  </p>
</div>
```

---

### 21. **Métricas Deberían Mostrar Top Productos por Ganancia**

**Mejora:**
```typescript
// Ranking de productos más rentables
const topProductos = productos
  .map(p => {
    const ventas = ventasSemana.flatMap(v => v.items).filter(it => it.productoId === p.id);
    const ganancia = ventas.reduce((s, it) => s + (it.precioCUP - it.pep) * it.cantidad, 0);
    return { ...p, ganancia };
  })
  .sort((a, b) => b.ganancia - a.ganancia)
  .slice(0, 10);

<div className="card p-4">
  <h3>🏆 Top 10 Productos Más Rentables</h3>
  {topProductos.map((p, i) => (
    <div key={p.id} className="flex justify-between items-center py-2 border-b">
      <span>{i + 1}. {p.nombre}</span>
      <span className="font-bold text-green-600">{fmt(p.ganancia)} CUP</span>
    </div>
  ))}
</div>
```

---

### 22. **Clientes Deberían Mostrar Historial de Compras**

**Mejora:**
```typescript
// Al ver detalle de cliente, mostrar sus compras
const comprasCliente = ventas.filter(v => v.clienteId === cliente.id);

<Modal title={`Historial de ${cliente.nombre}`}>
  <table>
    <thead><tr><th>Fecha</th><th>Venta</th><th>Total</th></tr></thead>
    <tbody>
      {comprasCliente.map(v => (
        <tr key={v.id}>
          <td>{fmtDate(v.fecha)}</td>
          <td>{v.num}</td>
          <td>{fmt(v.totalCUP)} CUP</td>
        </tr>
      ))}
    </tbody>
  </table>
</Modal>
```

---

### 23. **Gastos Deberían Mostrar Categorías con Colores**

**Mejora:**
```typescript
const categoriaColores = {
  'Salarios': '#3b82f6',
  'Alquiler': '#8b5cf6',
  'Electricidad': '#f59e0b',
  'Internet': '#06b6d4',
  'Combustible': '#ef4444',
  'Mantenimiento': '#10b981',
  'Otros': '#6b7280'
};

<td>
  <span className="badge" style={{ backgroundColor: categoriaColores[g.categoria] + '20', color: categoriaColores[g.categoria] }}>
    {g.categoria}
  </span>
</td>
```

---

### 24. **Anulaciones Deberían Mostrar Impacto en Inventario**

**Mejora:**
```typescript
// En detalle de anulación, mostrar qué productos se devolvieron
<div className="space-y-2">
  <p className="font-semibold">Productos devueltos al inventario:</p>
  {viewDetail.items.map((it, i) => (
    <div key={i} className="flex justify-between text-sm p-2 bg-green-50 rounded">
      <span>+{it.cantidad} {it.nombre}</span>
      <span className="text-green-600">Restaurado</span>
    </div>
  ))}
</div>
```

---

### 25. **Dashboard Debería Mostrar Productos Próximos a Agotarse**

**Mejora:**
```typescript
// Productos que se agotarán en X días según velocidad de venta
const productosCriticos = productos
  .map(p => {
    const ventasDiarias = /* calcular promedio */;
    const diasRestantes = ventasDiarias > 0 ? (p.stockTienda || 0) / ventasDiarias : Infinity;
    return { ...p, diasRestantes };
  })
  .filter(p => p.diasRestantes < 7 && p.diasRestantes > 0)
  .sort((a, b) => a.diasRestantes - b.diasRestantes);

<div className="card p-4">
  <h3>⚠️ Productos Críticos (se agotarán en menos de 7 días)</h3>
  {productosCriticos.map(p => (
    <div key={p.id} className="flex justify-between items-center py-2">
      <span>{p.nombre}</span>
      <span className="text-red-600 font-bold">{Math.round(p.diasRestantes)} días</span>
    </div>
  ))}
</div>
```

---

### 26. **Configuración Debería Tener Opción de Moneda Principal**

**Mejora:**
```typescript
// Permitir elegir si mostrar CUP o USD como principal
<div>
  <label>Moneda principal para mostrar</label>
  <select value={cfg.monedaPrincipal} onChange={e => setConfig('monedaPrincipal', e.target.value)}>
    <option value="CUP">CUP (Peso Cubano)</option>
    <option value="USD">USD (Dólar)</option>
  </select>
</div>
```

---

### 27. **Ventas Deberían Mostrar Método de Pago en Tabla**

**Mejora:**
```typescript
<thead>
  <tr>
    <th>#</th><th>Fecha</th><th>Cliente</th>
    <th>Método Pago</th> {/* NUEVO */}
    <th>CUP</th><th>USD</th><th>Estado</th><th></th>
  </tr>
</thead>
<tbody>
  {ventas.map(v => (
    <tr>
      <td>{v.num}</td>
      <td>{fmtDateTime(v.fecha)}</td>
      <td>{v.clienteNombre || '-'}</td>
      <td>
        <div className="text-xs">
          {v.pagos.efCUP > 0 && <span className="badge badge-ok">💵 {fmt(v.pagos.efCUP)}</span>}
          {v.pagos.tfCUP > 0 && <span className="badge badge-info">💳 {fmt(v.pagos.tfCUP)}</span>}
          {v.pagos.pagarCUP > 0 && <span className="badge badge-warn">📝 {fmt(v.pagos.pagarCUP)}</span>}
        </div>
      </td>
      <td>{fmt(v.totalCUP)}</td>
      <td>{fmt(v.totalUSD)}</td>
      <td>{v.estado}</td>
      <td>...</td>
    </tr>
  ))}
</tbody>
```

---

## 📊 RESUMEN DE PRIORIDADES

### 🔴 CRÍTICO (Corregir Inmediatamente)
1. Filtros de stock usan `p.stock` en lugar de `p.stockTienda`
2. Productos antiguos no tienen `stockTienda`/`stockAlmacen` (migración)
3. No hay validación de consistencia de stock

### 🟡 ALTA PRIORIDAD (Corregir Pronto)
4. Dashboard no muestra desglose de inventario por ubicación
5. Alertas de stock bajo no especifican ubicación
6. Exportación Excel no incluye stockTienda/stockAlmacen

### 🟢 MEDIA PRIORIDAD (Mejorar Cuando Sea Posible)
7. Métricas no muestran rotación de inventario
8. Compras no muestran resumen de destino
9. Faltan datos: historial de precios, caducidad, código de barras
10. Mejoras de representación visual

---

## 💡 RECOMENDACIONES FINALES

### Para Pequeños Negocios:

1. **Simplificar la interfaz inicial**
   - Mostrar solo lo esencial al principio
   - Opciones avanzadas ocultas en "Modo experto"

2. **Agregar tooltips explicativos**
   - Explicar qué es PEP, ganancia, etc.
   - Ayuda contextual en cada sección

3. **Crear tutorial interactivo**
   - Guía paso a paso para nuevos usuarios
   - Videos cortos de 30 segundos

4. **Agregar modo "solo lectura"**
   - Para empleados que solo pueden ver, no editar
   - Diferentes niveles de permisos

5. **Implementar notificaciones push**
   - Alertas de stock bajo en tiempo real
   - Recordatorios de cierre semanal

6. **Agregar exportación de reportes PDF**
   - Para imprimir y compartir
   - Formato profesional

7. **Implementar backup automático**
   - Respaldo diario automático
   - En carpeta local o nube

8. **Agregar modo offline completo**
   - Service Worker para funcionar sin internet
   - Sincronización cuando se reconecte

---

## ✅ CHECKLIST DE CORRECCIONES

- [ ] Corregir filtros de stock para usar `stockTienda`
- [ ] Crear script de migración para productos antiguos
- [ ] Agregar validación de consistencia de stock
- [ ] Mostrar desglose de inventario en Dashboard
- [ ] Especificar ubicación en alertas de stock bajo
- [ ] Incluir stockTienda/stockAlmacen en exportación Excel
- [ ] Agregar métricas de rotación de inventario
- [ ] Mostrar destino en tabla de compras
- [ ] Implementar historial de precios de compra
- [ ] Agregar campo de fecha de vencimiento
- [ ] Implementar código de barras
- [ ] Agregar sistema de unidades múltiples
- [ ] Crear reporte de productos más rentables
- [ ] Implementar presupuesto/objetivos de venta
- [ ] Agregar alertas de stock excesivo
- [ ] Mejorar representación visual con gráficos
- [ ] Agregar indicadores de color por ubicación
- [ ] Mostrar stock de almacén en POS como referencia
- [ ] Mostrar valor en transferencias
- [ ] Agregar tendencia en cierre semanal
- [ ] Crear ranking de productos rentables
- [ ] Mostrar historial de compras en clientes
- [ ] Agregar colores a categorías de gastos
- [ ] Mostrar impacto en inventario en anulaciones
- [ ] Agregar productos críticos en Dashboard
- [ ] Implementar opción de moneda principal
- [ ] Mostrar método de pago en tabla de ventas

---

**Total de problemas identificados:** 27
**Críticos:** 3
**Alta prioridad:** 3
**Media prioridad:** 21

**Tiempo estimado de corrección:** 40-60 horas de desarrollo
