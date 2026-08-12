# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye power-ups especiales y tipos de asteroides únicos como la estrella fugaz.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Automatización de issues

El workflow `Triage new issues` usa reglas deterministas para clasificar
automáticamente los issues nuevos, añadir labels de tipo y prioridad, y agregar
información para su revisión sin modificar el texto original.

Para habilitarlo en GitHub:

1. Instala la GitHub App de OpenCode en este repositorio desde
   <https://github.com/apps/opencode-agent>.
2. Concede a la App estos permisos del repositorio:
   - **Issues: Read and write** para actualizar el cuerpo del issue y administrar labels.
   - **Contents: Read** para leer el repositorio durante la ejecución.
   - **Pull requests: Read and write** para que el workflow de comentarios pueda trabajar con PRs.
3. En `Settings > Secrets and variables > Actions`, crea el secreto
   `OPENCODE_API_KEY`.
4. En `Settings > Actions > General`, permite ejecutar GitHub Actions y verifica
   que las acciones de terceros estén habilitadas.

Los workflows usan el token efímero `${{ github.token }}` generado por cada
ejecución. No requieren crear `secrets.GITHUB_TOKEN`, PATs ni guardar
credenciales. En el workflow de OpenCode, esto evita temporalmente el bug de OIDC
[anomalyco/opencode#37823](https://github.com/anomalyco/opencode/issues/37823)
y se puede retirar cuando OpenCode despliegue la corrección.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |

Al cargar el juego aparece un selector de nave. Usa las flechas para cambiar
entre `CLASICA`, `NOVA` y `FANTASMA`, y confirma con `Enter` o `Espacio`.
La seleccion se guarda en el navegador y queda preseleccionada al volver a
cargar la pagina.

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |
| Estrella fugaz | 500 |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up de escudo que bloquea una colisión con un asteroide
- Power-up de triple disparo temporal
- Estrella fugaz en cada nivel: aparece tras un intervalo variable, se mueve rápido, desaparece tras unos segundos y no se fragmenta
