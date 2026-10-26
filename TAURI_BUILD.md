# 🚀 Compilar Ferretería Suárez con Tauri

## 📋 Requisitos Previos

### 1. Instalar Node.js
- Descargar desde: https://nodejs.org/
- Versión recomendada: LTS (18.x o superior)

### 2. Instalar Rust
**Windows:**
```powershell
winget install Rustlang.Rustup
```

**macOS/Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 3. Instalar Dependencias del Sistema

**Windows:**
- Instalar [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Seleccionar "Desktop development with C++"
- Instalar [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

**macOS:**
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

## 🔧 Instalación

### 1. Instalar dependencias del proyecto
```bash
npm install
```

### 2. Instalar Tauri CLI
```bash
npm install -g @tauri-apps/cli
```

### 3. Generar iconos (opcional pero recomendado)
Coloca un icono PNG de 1024x1024 en `public/icon.png` y ejecuta:
```bash
npx tauri icon public/icon.png
```

## 🏃 Desarrollo

### Modo desarrollo con hot-reload
```bash
npm run tauri:dev
```

Esto abrirá la aplicación en una ventana nativa con recarga automática.

## 📦 Compilar para Distribución

### Compilar instalador
```bash
npm run tauri:build
```

### Archivos generados

Los instaladores se generan en `src-tauri/target/release/bundle/`:

**Windows:**
- `msi/Ferretería Suárez_1.0.0_x64_en-US.msi` (Instalador)
- `nsis/Ferretería Suárez_1.0.0_x64-setup.exe` (Instalador alternativo)

**macOS:**
- `dmg/Ferretería Suárez_1.0.0_x64.dmg`

**Linux:**
- `deb/ferreteria-suarez_1.0.0_amd64.deb` (Debian/Ubuntu)
- `appimage/ferreteria-suarez_1.0.0_amd64.AppImage` (Universal)

## 📊 Características de la App Compilada

### Tamaño
- **Windows**: ~8-12 MB
- **macOS**: ~10-15 MB
- **Linux**: ~8-12 MB

### Ventajas sobre Electron
- ✅ 10x más pequeño
- ✅ 4x menos memoria RAM
- ✅ Inicio 3x más rápido
- ✅ Usa WebView nativo del sistema

### Funcionalidades
- ✅ 100% offline
- ✅ Datos encriptados con AES-256
- ✅ IndexedDB para almacenamiento local
- ✅ Acceso a sistema de archivos para respaldos
- ✅ Notificaciones nativas
- ✅ Sin dependencias externas

## 🔄 Actualizar Versión

1. Editar `src-tauri/tauri.conf.json`:
```json
"package": {
  "version": "1.0.1"
}
```

2. Editar `src-tauri/Cargo.toml`:
```toml
[package]
version = "1.0.1"
```

3. Compilar nuevamente:
```bash
npm run tauri:build
```

## 🐛 Solución de Problemas

### Error: "WebView2 not found" (Windows)
Instalar WebView2 Runtime desde:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Error: "rustc not found"
Verificar que Rust esté instalado:
```bash
rustc --version
```

Si no está instalado, seguir las instrucciones de instalación de Rust arriba.

### Error: "webkit2gtk not found" (Linux)
```bash
sudo apt install libwebkit2gtk-4.0-dev
```

### La app no carga en desarrollo
Verificar que el servidor Vite esté corriendo en el puerto 3000:
```bash
npm run dev
```

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run tauri:dev          # Modo desarrollo con hot-reload

# Compilación
npm run tauri:build        # Compilar instalador para distribución

# Solo frontend
npm run build              # Compilar solo el frontend (sin Tauri)
npm run dev                # Servidor de desarrollo web

# Información
npm run tauri info         # Mostrar información del sistema
```

## 🎯 Estructura del Proyecto

```
ferreteria-suarez/
├── src/                    # Código fuente React
│   ├── App.tsx            # Componente principal
│   ├── lib/
│   │   └── db.ts          # Base de datos IndexedDB
│   └── index.css          # Estilos
├── src-tauri/             # Código Rust de Tauri
│   ├── src/
│   │   └── main.rs        # Punto de entrada Rust
│   ├── Cargo.toml         # Dependencias Rust
│   ├── tauri.conf.json    # Configuración Tauri
│   └── build.rs           # Script de build
├── dist/                  # Build del frontend
├── package.json           # Dependencias Node.js
└── TAURI_BUILD.md         # Esta guía
```

## ✅ Checklist Final

Antes de distribuir:

- [ ] Node.js instalado (`node --version`)
- [ ] Rust instalado (`rustc --version`)
- [ ] Dependencias del sistema instaladas
- [ ] `npm install` ejecutado
- [ ] `npm run tauri:dev` funciona correctamente
- [ ] Iconos generados (opcional)
- [ ] Versión actualizada en `tauri.conf.json` y `Cargo.toml`
- [ ] `npm run tauri:build` genera instaladores sin errores
- [ ] Instaladores probados en sistema limpio

## 📚 Recursos Adicionales

- [Documentación oficial de Tauri](https://tauri.app/v1/guides/)
- [API Reference](https://tauri.app/v1/api/)
- [Comunidad de Tauri](https://discord.com/invite/tauri)

## 🎉 ¡Listo!

Una vez compilado, tendrás un instalador nativo de ~10MB que:
- Se instala como cualquier aplicación de Windows/Mac/Linux
- Funciona 100% offline
- No requiere navegador ni servidor
- Los datos se guardan localmente con encriptación
- Se puede distribuir fácilmente
