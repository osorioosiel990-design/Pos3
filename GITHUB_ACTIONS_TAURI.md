# 🚀 Compilar .exe de Tauri con GitHub Actions (sin instalar nada en tu PC)

Este proyecto está configurado para que **GitHub Actions compile el instalador `.exe` (y `.msi`) de Windows en la nube**. Tú solo subes el código y descargas el resultado.

## ⚡ ¿Qué necesitas hacer en tu PC?

**NADA.** No necesitas instalar Node.js, Rust, Visual Studio Build Tools ni WebView2.

Solo necesitas:
1. Una cuenta de GitHub.
2. Subir (push) este repositorio a GitHub.

## 🔧 ¿Qué se configuró?

| Archivo | Qué hace |
|---------|----------|
| `.github/workflows/tauri.yml` | Workflow de GitHub Actions que compila en `windows-latest` |
| `src-tauri/tauri.conf.json` | Configuración de Tauri v2 (frontend → `dist/`, bundle Windows) |
| `package.json` | Scripts `build` y `tauri:build` listos para CI |
| `src-tauri/Cargo.toml` | Dependencias de Rust para Tauri v2 |

## ▶️ Cómo disparar la compilación

El workflow se ejecuta automáticamente cuando:

1. **Haces push a `main` o `master`**, o
2. **Haces clic en "Run workflow"** en la pestaña Actions de GitHub, o
3. **Creas un release** en GitHub.

## 📥 Cómo descargar el .exe compilado

1. Ve a tu repositorio en GitHub.
2. Haz clic en la pestaña **Actions**.
3. Selecciona el workflow **"Build Tauri Windows (.exe)"**.
4. Haz clic en el run (ejecución) más reciente.
5. En la parte derecha, busca la sección **Artifacts**.
6. Descarga `ferreteria-pro-windows`.
7. Dentro del zip encontrarás:
   - `src-tauri/target/release/bundle/nsis/*.exe` → **Instalador .exe**
   - `src-tauri/target/release/bundle/msi/*.msi` → Instalador .msi

## 🌐 Si tu internet es muy lento

El workflow usa caché para evitar descargar todo en cada ejecución:

- `actions/setup-node` con `cache: npm` → cachea `node_modules`.
- `swatinem/rust-cache@v2` → cachea el registro de Cargo y la carpeta `target/`.

La **primera vez** descargará dependencias de npm y crates de Rust. Las siguientes veces serán mucho más rápidas gracias al caché.

## ⚠️ Notas importantes

- No modifiques `node_modules/`, `dist/`, ni `src-tauri/target/` (están en `.gitignore`).
- Los instaladores se generan con el nombre del producto definido en `tauri.conf.json` (`Ferretería Suárez`).
- Si cambias la versión, actualízala en **ambos** archivos:
  - `src-tauri/tauri.conf.json` → `"version": "1.0.0"`
  - `src-tauri/Cargo.toml` → `version = "1.0.0"`
- El workflow sube los artefactos con retención de 30 días.

## 🛠️ Si el workflow falla

Revisa los logs en la pestaña **Actions** de GitHub. Errores comunes:

| Error | Posible causa |
|-------|---------------|
| `npm ci` falla | `package-lock.json` no coincide con `package.json`. Ejecuta `npm install` localmente y sube el `package-lock.json` actualizado. |
| `cargo build` falla | Faltan dependencias de sistema en el runner (raro en `windows-latest`). |
| No se encuentran `.exe` | El build de Tauri falló antes. Revisa los logs del paso "Compilar app de Tauri". |

---

**Resumen:** Sube tu código a GitHub → Actions compila el `.exe` en la nube → Tú descargas el artefacto. Sin instalar nada en tu PC.