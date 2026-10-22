# 🚀 INSTALAR FerreteríaPRO - Guía Paso a Paso

## ⚠️ ¿Por qué sale el error "vite no se reconoce"?

**Respuesta corta:** Porque falta instalar las dependencias del proyecto.

**Respuesta larga:** Este proyecto usa Node.js y necesita instalar paquetes (como Vite, React, etc.) antes de poder ejecutarse.

---

## ✅ SOLUCIÓN RÁPIDA (3 minutos)

### **Paso 1: Instalar Node.js**

1. Ve a: **https://nodejs.org/**
2. Descarga la versión **LTS** (botón verde grande)
3. Ejecuta el instalador
4. **IMPORTANTE:** Deja todas las opciones por defecto
5. **CIERRA** todas las ventanas de CMD/PowerShell
6. **ABRE** una nueva ventana de CMD

**Verificar que se instaló:**
```bash
node --version
```
Debe mostrar algo como: `v20.11.0` o similar

---

### **Paso 2: Ejecutar el Script Automático**

1. Ve a la carpeta del proyecto
2. **Doble clic** en: **`TODO_EN_UNO.bat`**

Este script hará TODO automáticamente:
- ✅ Verifica Node.js
- ✅ Instala dependencias (tarda 2-5 minutos)
- ✅ Genera el HTML portable
- ✅ Te pregunta si quieres copiarlo al escritorio

**Cuando termine, tendrás:**
- `dist/index.html` → Tu aplicación portable

---

### **Paso 3: Usar la Aplicación**

**Opción A: Abrir directamente**
```
Doble clic en: dist/index.html
```

**Opción B: Copiar a USB**
```
1. Copia dist/index.html
2. Pégalo en tu USB
3. Renómbralo a "FerreteríaPRO.html"
4. Llévalo a cualquier Windows
5. Doble clic para abrir
```

**Opción C: Copiar al escritorio**
```
1. Copia dist/index.html
2. Pégalo en tu escritorio
3. Renómbralo a "FerreteríaPRO.html"
4. Doble clic para abrir
```

---

## 🎯 ¿Qué es lo que obtienes?

Un **archivo HTML único** (`index.html`) que:

- ✅ **Se abre con doble clic** en cualquier Windows
- ✅ **No requiere instalación** de nada
- ✅ **Funciona 100% offline**
- ✅ **Los datos se guardan** en el navegador local (IndexedDB)
- ✅ **Se puede copiar** a USB, email, nube, etc.
- ✅ **Tamaño:** ~1-2 MB

---

## 📋 Resumen Visual

```
┌─────────────────────────────────────────┐
│  PASO 1: Instalar Node.js              │
│  https://nodejs.org/ → Descargar LTS   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  PASO 2: Ejecutar TODO_EN_UNO.bat      │
│  (Instala dependencias + genera HTML)  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  PASO 3: Usar dist/index.html          │
│  (Doble clic → ¡Funciona!)             │
└─────────────────────────────────────────┘
```

---

## ❓ Preguntas Frecuentes

### **¿Tengo que hacer esto cada vez que uso la app?**
**NO.** Solo la primera vez. Después, solo abre `dist/index.html`.

### **¿Puedo borrar la carpeta del proyecto después?**
**SÍ.** Una vez generado `dist/index.html`, puedes borrar todo lo demás. Solo necesitas ese archivo HTML.

### **¿Los datos se pierden si muevo el archivo?**
**NO.** Los datos se guardan en el navegador (IndexedDB) de cada computadora. Si mueves el HTML a otra PC, empezarás con datos vacíos.

### **¿Puedo hacer respaldo de los datos?**
**SÍ.** Dentro de la app, ve a "Respaldo" → "Exportar JSON Cifrado" o "Exportar Excel".

### **¿Funciona en Windows 7/8/10/11?**
**SÍ.** Funciona en cualquier Windows con un navegador moderno (Chrome, Firefox, Edge).

### **¿Necesito internet para usar la app?**
**NO.** Una vez generado el HTML, funciona 100% offline.

---

## 🆘 Solución de Problemas

### **Error: "Node.js no está instalado"**
→ Instala Node.js desde https://nodejs.org/

### **Error: "vite no se reconoce"**
→ Ejecuta `TODO_EN_UNO.bat` que instala todo automáticamente

### **Error: "npm install falla"**
→ Posibles soluciones:
1. Verifica tu conexión a internet
2. Ejecuta como administrador
3. Usa un mirror de npm:
   ```bash
   npm config set registry https://registry.npmmirror.com
   npm install
   ```

### **El archivo HTML se ve en blanco**
→ Abre la consola del navegador (F12) y busca errores

---

## 📞 ¿Necesitas ayuda?

1. Lee: **`SOLUCION_PROBLEMAS.md`**
2. Lee: **`GUIA_RAPIDA.md`**
3. Lee: **`COMO_ABRIR.md`**

---

## ✅ Checklist Final

Antes de empezar, verifica:

- [ ] Node.js instalado (`node --version` funciona)
- [ ] Carpeta del proyecto descargada
- [ ] Conexión a internet (solo para la instalación inicial)
- [ ] 2-5 minutos de tiempo libre

**Después de ejecutar `TODO_EN_UNO.bat`:**

- [ ] Se creó la carpeta `node_modules`
- [ ] Se creó la carpeta `dist`
- [ ] Existe el archivo `dist/index.html`
- [ ] Puedes abrir `dist/index.html` con doble clic

---

## 🎉 ¡Listo!

Una vez que ejecutes `TODO_EN_UNO.bat` y se genere `dist/index.html`, tendrás tu aplicación portable que:

- Se copia a cualquier Windows
- Se abre con doble clic
- Funciona sin instalar nada
- Es 100% offline

**¡Disfruta FerreteríaPRO!**
