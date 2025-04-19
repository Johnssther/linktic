# Microservicios de Productos e Inventario

Este proyecto contiene dos microservicios construidos con Node.js 20, Express y SQLite, que se comunican entre sí usando HTTP. Se implementa manejo de inventario y gestión de productos, siguiendo el estándar de respuesta [JSON:API](https://jsonapi.org).

---

## Microservicios

### 1.`products-ms`
- Gestiona productos con campos: `id`, `name`, `price`.
- Soporta operaciones CRUD completas.
- Devuelve respuestas en formato JSON:API.

### 2. `inventory-ms`
- Gestiona el inventario de productos: `productId`, `quantity`.
- Se comunica con `products-ms` para obtener la información del producto correspondiente.
- Expone una ruta especial para simular compras y actualizar el stock.

---

## Tecnologías utilizadas

- Node.js 20
- Express.js
- SQLite: se eligio por su simplicidad y portabilidad, aunque para hacer mas robustos los microservicios se sugiere usar postgreSQL ya que es una base de datos robusta. Mongo DB si se requiere sea un escalado mas horizontal que vertical.
- Docker + Docker Compose
- JSON:API como estándar de respuesta

---

## 🗂️ Estructura del proyecto

```
📁 raiz/
├── products-ms/
│   ├── src/
│   ├── Dockerfile
│   └── database.sqlite
│   └── .env
├── inventory-ms/
│   ├── src/
│   ├── Dockerfile
│   └── database.sqlite
│   └── .env
├── infra/
│   └── docker-compose.yml

└── README.md
```

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido (el archivo .env que se encuentra en cada microservicio es de ejemplo, se puede usar esa informacion):

env inventory-ms

```env
URI_PRODUCTS_MS=http://products:3000/api/
```

---

## 🐳 Docker: Ejecutar el proyecto

Luego de clonado el repositorio debes navegar a :

```bash
cd linktic/infra
```
Ejecutar
```bash
docker-compose up --build -d
```

Esto levantará:


- `products-ms` en [http://localhost:3000](http://localhost:3000)
- `inventory-ms` en [http://localhost:4000](http://localhost:4000)

Puedes verificar cada microservicio navegando a la pagina web:
- http://localhost:3000 y verificar el siguiente mensaje: "Welcome to the Products Microservice 🚀"
- y en la pagina http://localhost:4000 y verificar el siguiente mensaje: "Welcome to the Inventory Microservice 🚀"

---

## Endpoints destacados

### `products-ms`

- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`

### `inventory-ms`

- `GET /inventory/:id` – Consulta la cantidad y la información del producto
- `POST /inventory/purchase` – Simula una compra y reduce el stock

```json
{
  "productId": 1,
  "qty": 3
}
```

---

## 🧪 Formato de respuesta

Todos los endpoints devuelven datos en formato JSON:API. Ejemplo:

```json
{
  "data": {
    "type": "product",
    "id": "1",
    "attributes": {
      "name": "Café",
      "price": 8500
    }
  }
}
```

---

## 🧠 Mejoras futuras sugeridas

- Manejo de usuarios y autenticación
- Registro de historial de compras
- Tests automáticos
- Orquestación avanzada con API Gateway Kafka
- Despliegue en servicios como Railway, Vercel, Render o Fly.io

---

## ✨ Autor

John Alejandro Hernández

Proyecto desarrollado como ejemplo de arquitectura básica de microservicios en Node.js con Express y SQLite.
