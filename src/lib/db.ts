// IndexedDB + Crypto + Storage utilities for Ferretería Suárez

const DB_NAME = 'ferreteriasuarez';
const DB_VERSION = 3;

export interface Producto {
  id?: number; nombre: string; codigo: string; categoria: string; unidad: string;
  compraCUP: number; compraUSD: number; ventaCUP: number; ventaUSD: number;
  pep: number; pepUSD: number; 
  stock: number; // Stock total (tienda + almacén) - mantenido por compatibilidad
  stockTienda: number; // Stock en tienda (disponible para venta)
  stockAlmacen: number; // Stock en almacén (reserva)
  min: number; foto: string; creado: number;
  precioFijoCUP?: boolean;
  precioFijoUSD?: boolean;
  loteActual?: number;
  fechaVencimiento?: number;
  codigoBarras?: string;
}

export interface LoteCompra {
  id?: number;
  productoId: number;
  cantidad: number;
  cantidadRestante: number; // Para FIFO
  precioCompraCUP: number;
  precioCompraUSD: number;
  fecha: number;
  proveedor: string;
  nota: string;
  destino: 'tienda' | 'almacen';
  factura?: string;
}

export interface CierreDiario {
  id?: number;
  fecha: number; // timestamp del día
  ventasIds: number[];
  totalVentasCUP: number;
  totalVentasUSD: number;
  costoVentasCUP: number; // Inversión (PEP × cantidad)
  costoVentasUSD: number;
  gananciaBrutaCUP: number;
  gananciaBrutaUSD: number;
  cajaCUP: number;
  cajaUSD: number;
  // Desglose de pagos
  efectivoCUP: number;
  efectivoUSD: number;
  transferenciaCUP: number;
  transferenciaUSD: number;
  creditoCUP: number;
  creditoUSD: number;
  tasaUsada: number;
  creado: number;
}

export interface Transferencia {
  id?: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  unidad: string;
  desde: 'tienda' | 'almacen';
  hacia: 'tienda' | 'almacen';
  nota: string;
  fecha: number;
  creado: number;
}

export interface Lote {
  id?: number;
  productoId: number;
  cantidad: number;
  precioCompraCUP: number;
  precioCompraUSD: number;
  fecha: number;
  proveedor: string;
  nota: string;
  stockRestante: number;
}

export interface Compra {
  id?: number; productoId: number; productoNombre: string; productoCodigo: string;
  cantidad: number; unidad: string; precioUnitCUP: number; precioUnitUSD: number;
  totalCUP: number; totalUSD: number; nota: string; fecha: number; creado: number;
  loteId?: number; proveedor?: string;
}

export interface VentaItem {
  productoId: number; nombre: string; codigo: string; cantidad: number; unidad: string;
  precioCUP: number; precioUSD: number; subtotalCUP: number; subtotalUSD: number;
  pep: number; pepUSD: number; loteId?: number;
}

export interface Venta {
  id?: number; num: string; fecha: number; items: VentaItem[]; descuento: number;
  totalCUP: number; totalUSD: number;
  pagos: {
    efCUP: number; tfCUP: number; pagarCUP: number;
    efUSD: number; tfUSD: number; pagarUSD: number;
  };
  clienteId: number | null; clienteNombre: string; estado: 'pagada' | 'anulada';
  pagarMasTardeCUP: number; pagarMasTardeUSD: number;
}

export interface Cliente {
  id?: number; nombre: string; telefono: string; email: string; direccion: string;
  notas: string; saldoCUP: number; saldoUSD: number; compras: number; ultimaCompra: number; creado: number;
}

export interface Gasto {
  id?: number; concepto: string; categoria: string; fecha: number; nota: string;
  montoCUP: number; montoUSD: number; creado: number;
}

export interface Anulacion {
  id?: number; ventaId: number; num: string; fechaAnulacion: number; fechaOriginal: number;
  totalCUP: number; totalUSD: number; motivo: string; detalle: string;
  estado: 'pendiente' | 'revertida'; items: VentaItem[]; auditado: number | null;
}

export interface Tasa { id?: number; fecha: number; anterior: number; nueva: number; }

export interface CierreSemanal {
  id?: number;
  semanaInicio: number;
  semanaFin: number;
  ventasIds: number[];
  totalVentasCUP: number;
  totalVentasUSD: number;
  gananciaBrutaCUP: number;
  gananciaBrutaUSD: number;
  totalGastosCUP: number;
  totalGastosUSD: number;
  gananciaNetaCUP: number;
  gananciaNetaUSD: number;
  inversionInventarioCUP: number;
  inversionInventarioUSD: number;
  accionista1: number;
  accionista2: number;
  dependienta: number;
  accionista2Neto: number;
  cajaCUP: number;
  cajaUSD: number;
  tasaUsada: number;
  creado: number;
}

export interface Config { key: string; value: any; }

const DEFAULT_CONFIG: Record<string, any> = {
  tasa: 350, tema: 'auto', size: 'md',
  biz: 'Ferretería Suárez', addr: '', phone: '', nit: '',
  pctDependienta: 0,
  accionista1Nombre: 'Accionista 1',
  accionista2Nombre: 'Accionista 2',
  dependientaNombre: 'Dependienta',
  actualizarPreciosConTasa: false,
  usarLotes: true,
  metodoFifo: true,
  monedaPrincipal: 'CUP',
  mostrarEquivalentes: true,
  permitirPreciosNegociables: false,
  redondeo: 0,
  unidades: ['Unidad','Caja','Metro','Kilo','Litro','Paquete','Rollos','Juego'],
  categorias: ['Herramientas','Tornillería','Plomería','Electricidad','Pintura','Construcción','Jardín','Otros'],
  units: ['Unidad','Caja','Metro','Kilo','Litro','Paquete','Rollos','Juego'],
  cats: ['Herramientas','Tornillería','Plomería','Electricidad','Pintura','Construcción','Jardín','Otros'],
  // Visibilidad de métricas
  mostrarCajaCUP: true,
  mostrarCajaUSD: true,
  mostrarGanancia: true,
  mostrarInversion: true,
  mostrarInventarioPorUbicacion: true,
  mostrarDesglosePagos: true,
  mostrarCierreDia: true,
  mostrarDistribucionGanancias: true,
};

let db: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('productos')) d.createObjectStore('productos', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('lotes')) d.createObjectStore('lotes', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('compras')) d.createObjectStore('compras', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('ventas')) d.createObjectStore('ventas', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('clientes')) d.createObjectStore('clientes', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('gastos')) d.createObjectStore('gastos', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('anulaciones')) d.createObjectStore('anulaciones', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('config')) d.createObjectStore('config', { keyPath: 'key' });
      if (!d.objectStoreNames.contains('tasas')) d.createObjectStore('tasas', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('cierres')) d.createObjectStore('cierres', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('cierresDiarios')) d.createObjectStore('cierresDiarios', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('lotesCompra')) d.createObjectStore('lotesCompra', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('transferencias')) d.createObjectStore('transferencias', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('logs')) d.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

export async function dbGetAll<T>(store: string): Promise<T[]> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbGet<T>(store: string, id: number): Promise<T | undefined> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbAdd<T>(store: string, item: T): Promise<number> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readwrite');
    const req = tx.objectStore(store).add(item);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function dbPut<T>(store: string, item: T): Promise<number> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(item);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function dbDelete(store: string, id: number): Promise<void> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbClear(store: string): Promise<void> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readwrite');
    const req = tx.objectStore(store).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getConfig(): Promise<Record<string, any>> {
  const items = await dbGetAll<Config>('config');
  const cfg: Record<string, any> = { ...DEFAULT_CONFIG };
  items.forEach(i => { cfg[i.key] = i.value; });
  if (!cfg.unidades && cfg.units) cfg.unidades = cfg.units;
  if (!cfg.categorias && cfg.cats) cfg.categorias = cfg.cats;
  return cfg;
}

export async function setConfig(key: string, value: any): Promise<void> {
  await dbPut<Config>('config', { key, value });
}

export async function initDefaultConfig(): Promise<void> {
  const existing = await dbGetAll<Config>('config');
  if (existing.length === 0) {
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
      await dbPut<Config>('config', { key, value });
    }
  }
}

export const Storage = {
  available: false,
  memory: {} as Record<string, string>,
  init() { try { localStorage.setItem('_test', '1'); localStorage.removeItem('_test'); this.available = true; } catch { this.available = false; } },
  getItem(key: string): string | null { return this.available ? localStorage.getItem(key) : (this.memory[key] || null); },
  setItem(key: string, value: string) { if (this.available) localStorage.setItem(key, value); else this.memory[key] = value; },
  removeItem(key: string) { if (this.available) localStorage.removeItem(key); else delete this.memory[key]; }
};

const MASTER_KEY = '123+3210@';
let cryptoKey: CryptoKey | null = null;

export async function deriveKey(): Promise<CryptoKey> {
  if (cryptoKey) return cryptoKey;
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(MASTER_KEY), 'PBKDF2', false, ['deriveKey']);
  cryptoKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode('ferreteriasuarez_salt_v3'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
  return cryptoKey;
}

export const encryptData = async (dataToEncrypt: string): Promise<string> => {
  const key = await deriveKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(dataToEncrypt));
  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
};

export const decryptData = async (b64: string): Promise<string> => {
  const key = await deriveKey();
  const combined = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(decrypted);
};

export function verifyMasterKey(input: string): boolean { return input === MASTER_KEY; }

export interface License { plan: string; days: number; start: number; expires: number; active: boolean; }

export function getLicense(): License | null {
  const raw = Storage.getItem('fp_license');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveLicense(lic: License) { Storage.setItem('fp_license', JSON.stringify(lic)); }
export function isLicenseValid(): boolean { const lic = getLicense(); if (!lic || !lic.active) return false; if (lic.days === 0) return true; return Date.now() < lic.expires; }
export function clearLicense() { Storage.removeItem('fp_license'); }

export function fmt(n: number, dec = 2): string { return n.toLocaleString('es-CU', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
export function fmtDate(ts: number): string { return new Date(ts).toLocaleDateString('es-CU'); }
export function fmtDateTime(ts: number): string { return new Date(ts).toLocaleString('es-CU'); }
export function genVentaNum(): string { return 'V-' + Date.now().toString(36).toUpperCase(); }

export const toUSD = (cup: number, tasa: number) => tasa > 0 ? cup / tasa : 0;
export const toCUP = (usd: number, tasa: number) => usd * tasa;
export const numVal = (v: number | undefined | null) => v === undefined || v === null || v === 0 ? '' : v;

export function getWeekRange(date: Date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 5);
  end.setHours(23, 59, 59, 999);
  return { start: start.getTime(), end: end.getTime(), startStr: fmtDate(start.getTime()), endStr: fmtDate(end.getTime()) };
}
