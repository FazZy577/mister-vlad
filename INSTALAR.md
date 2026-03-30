# 🚀 INSTALAR MISTER — GitHub + Netlify (10 minutos, gratis)

Netlify Drop no ejecuta el servidor. Necesitas conectarlo a GitHub.
No necesitas saber programar. Sigue estos pasos exactos.

---

## PASO 1 — Crear cuenta en GitHub (2 min)

1. Ve a https://github.com
2. Pulsa "Sign up"
3. Pon un email, contraseña y nombre de usuario
4. Verifica el email

---

## PASO 2 — Crear repositorio (1 min)

1. Pulsa el botón verde "+ New repository" (arriba a la derecha)
2. Nombre: `mister-vlad`
3. Marca "Public"
4. Pulsa "Create repository"

---

## PASO 3 — Subir los archivos (3 min)

En la página de tu repositorio vacío:
1. Pulsa "uploading an existing file" (enlace en el centro)
2. Arrastra TODOS estos archivos y carpetas:
   - index.html
   - manifest.json
   - netlify.toml
   - sw.js
   - test.html
   - La carpeta `netlify/` entera (con functions/ai.js dentro)
3. Escribe en el cuadro de abajo: "Primera versión"
4. Pulsa "Commit changes"

---

## PASO 4 — Conectar a Netlify (3 min)

1. Ve a https://netlify.com
2. Crea cuenta gratis (puedes usar "Continue with GitHub")
3. Pulsa "Add new site" → "Import an existing project"
4. Elige "GitHub"
5. Autoriza Netlify a acceder a tu GitHub
6. Selecciona el repositorio `mister-vlad`
7. En "Build settings" deja todo como está
8. Pulsa "Deploy site"

---

## PASO 5 — Abrir en el móvil (1 min)

1. Netlify te da un link tipo `https://abc123.netlify.app`
2. Abre ese link en Chrome del móvil
3. Primero prueba `https://tu-url.netlify.app/test.html`
4. Pulsa "Test las 3 a la vez" — deberías ver ✅ en las 3
5. Si funciona, ve a la app principal y ya tienes tus entrenos

---

## ¿Por qué GitHub y no Netlify Drop?

Netlify Drop solo sirve archivos HTML/CSS/JS estáticos.
Las funciones del servidor (netlify/functions/ai.js) solo funcionan
cuando Netlify está conectado a un repositorio de GitHub.
Es la única forma de hacer llamadas a las APIs sin que el móvil las bloquee.

---

## Si algo falla

Mándame una foto de la pantalla de test.html y te digo exactamente qué arreglar.
