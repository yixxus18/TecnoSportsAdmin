# Estructura de la Base de Datos - API de Partidos con Quinelas y Usuarios

Esta es la  estructura de la base de datos para la API de TecnoSportsAdmin, que maneja partidos de fútbol, quinelas (pools), usuarios y predicciones. La base de datos está diseñada para permitir a los usuarios crear y unirse a quinelas mediante códigos de invitación, hacer predicciones semanales sobre partidos y mantener clasificaciones por quinela.

## Tablas Principales

### 0. Tabla: `roles`
Almacena los roles necesarios en la aplicacion.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único del usuario     | PRIMARY KEY, AUTO_INCREMENT  |
| name           | VARCHAR(255)  | Nombre del rol                      | NOT NULL                     |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |

### 1. Tabla: `users`
Almacena la información de los usuarios registrados en la plataforma.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único del usuario     | PRIMARY KEY, AUTO_INCREMENT  |
| name           | VARCHAR(255)  | Nombre completo del usuario         | NOT NULL                     |
| email          | VARCHAR(255)  | Correo electrónico                  | UNIQUE, NOT NULL             |
| password       | VARCHAR(255)  | Contraseña hasheada                 | NOT NULL                     |
| is_active      | BOOLEAN       | Si el usuario esta activo           | DEFAULT TRUE                 |
| rol_id          | INTEGER       | Id del rol                          | FOREIGN KEY -> roles(id), NOT NULL |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |

### 2. Tabla: `teams`
Almacena la información de los equipos de fútbol participantes.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único del equipo      | PRIMARY KEY, AUTO_INCREMENT  |
| name           | VARCHAR(255)  | Nombre del equipo                   | UNIQUE, NOT NULL             |
| logo_url       | VARCHAR(500)  | URL del logo del equipo             | NULL                         |
| is_active      | BOOLEAN       | Si el equipo está activo            | DEFAULT TRUE                 |
| confederation_id | INTEGER     | Id de la confederacion perteneciente | FOREIGN KEY -> confederations(id), NOT NULL |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |

### 2.1 Tabla: `confederations`
Almacena la información de las confederaciones.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único de la confederacion     | PRIMARY KEY, AUTO_INCREMENT  |
| name           | VARCHAR(255)  | Nombre de la confederacion          | UNIQUE, NOT NULL             |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |

### 3. Tabla: `matches`
Almacena la información de los partidos de fútbol programados.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único del partido     | PRIMARY KEY, AUTO_INCREMENT  |
| home_team_id   | INTEGER       | ID del equipo local                 | FOREIGN KEY -> teams(id), NOT NULL |
| away_team_id   | INTEGER       | ID del equipo visitante             | FOREIGN KEY -> teams(id), NOT NULL |
| match_date     | TIMESTAMP     | Fecha y hora del partido            | NOT NULL                     |
| week_number    | INTEGER       | Número de semana del torneo         | NOT NULL                     |
| score_home     | numeric       | Marcador local (e.g., 2)            | NULL                         |
| score_away     | numeric       | Marcador visitante (e.g., 1)        | NULL                         |
| status         | VARCHAR(20)   | Estado del partido (pending, en juego, finished) | DEFAULT 'pending'           |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |

### 4. Tabla: `pools` (Quinelas)
Almacena la información de las quinelas creadas por los usuarios.

| Campo              | Tipo          | Descripción                          | Restricciones                  |
|--------------------|---------------|--------------------------------------|-------------------------------|
| id                 | INTEGER       | Identificador único de la quinela   | PRIMARY KEY, AUTO_INCREMENT  |
| name               | VARCHAR(255)  | Nombre de la quinela                | NOT NULL                     |
| description        | TEXT          | Descripción de la quinela           | NULL                         |
| creator_id         | INTEGER       | ID del usuario creador              | FOREIGN KEY -> users(id), NOT NULL |
| invitation_code    | VARCHAR(10)   | Código de invitación único          | UNIQUE, NOT NULL             |
| max_participants   | INTEGER       | Número máximo de participantes      | DEFAULT 20                   |
| is_close           | BOOLEAN       | Si la quinela cerrada               | DEFAULT FALSE                |
| is_active          | BOOLEAN       | Si la quinela está activa           | DEFAULT TRUE                 |
| start_date         | TIMESTAMP     | Fecha que se creo la quiniela       | DEFAULT CURRENT_TIMESTAMP    |
| end_date           | TIMESTAMP     | Fecha que terminara la quiniela     | NULL                         |
| created_at         | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at         | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |
<!-- Recordatorio: Calcular la fecha final para la quiniela -->
<!-- Se agrego si la quiniela esta cerrada, por defecto en false, el creador
     de la quiniela podra cerrarla si se realizaron las prediciones o un dia antes de que
     empiezen los encuentros.
 -->

### 5. Tabla: `pool_participants`
Relaciona usuarios con quinelas a las que se han unido.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único de la participación | PRIMARY KEY, AUTO_INCREMENT  |
| pool_id        | INTEGER       | ID de la quinela                     | FOREIGN KEY -> pools(id), NOT NULL |
| user_id        | INTEGER       | ID del usuario participante          | FOREIGN KEY -> users(id), NOT NULL |
| joined_at      | TIMESTAMP     | Fecha de unión                       | DEFAULT CURRENT_TIMESTAMP    |

### 6. Tabla: `predictions`
Almacena las predicciones de los usuarios para los partidos.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único de la predicción| PRIMARY KEY, AUTO_INCREMENT  |
| user_id        | INTEGER       | ID del usuario que predice          | FOREIGN KEY -> users(id), NOT NULL |
| match_id       | INTEGER       | ID del partido                      | FOREIGN KEY -> matches(id), NOT NULL |
# Estructura de la Base de Datos - API de Partidos con Quinelas y Usuarios

Esta es la  estructura de la base de datos para la API de TecnoSportsAdmin, que maneja partidos de fútbol, quinelas (pools), usuarios y predicciones. La base de datos está diseñada para permitir a los usuarios crear y unirse a quinelas mediante códigos de invitación, hacer predicciones semanales sobre partidos y mantener clasificaciones por quinela.

## Tablas Principales

### 0. Tabla: `roles`
Almacena los roles necesarios en la aplicacion.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único del usuario     | PRIMARY KEY, AUTO_INCREMENT  |
| name           | VARCHAR(255)  | Nombre del rol                      | NOT NULL                     |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |

### 1. Tabla: `users`
Almacena la información de los usuarios registrados en la plataforma.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único del usuario     | PRIMARY KEY, AUTO_INCREMENT  |
| name           | VARCHAR(255)  | Nombre completo del usuario         | NOT NULL                     |
| email          | VARCHAR(255)  | Correo electrónico                  | UNIQUE, NOT NULL             |
| password       | VARCHAR(255)  | Contraseña hasheada                 | NOT NULL                     |
| is_active      | BOOLEAN       | Si el usuario esta activo           | DEFAULT TRUE                 |
| rol_id          | INTEGER       | Id del rol                          | FOREIGN KEY -> roles(id), NOT NULL |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |

### 2. Tabla: `teams`
Almacena la información de los equipos de fútbol participantes.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único del equipo      | PRIMARY KEY, AUTO_INCREMENT  |
| name           | VARCHAR(255)  | Nombre del equipo                   | UNIQUE, NOT NULL             |
| logo_url       | VARCHAR(500)  | URL del logo del equipo             | NULL                         |
| is_active      | BOOLEAN       | Si el equipo está activo            | DEFAULT TRUE                 |
| confederation_id | INTEGER     | Id de la confederacion perteneciente | FOREIGN KEY -> confederations(id), NOT NULL |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |

### 2.1 Tabla: `confederations`
Almacena la información de las confederaciones.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único de la confederacion     | PRIMARY KEY, AUTO_INCREMENT  |
| name           | VARCHAR(255)  | Nombre de la confederacion          | UNIQUE, NOT NULL             |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |

### 3. Tabla: `matches`
Almacena la información de los partidos de fútbol programados.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único del partido     | PRIMARY KEY, AUTO_INCREMENT  |
| home_team_id   | INTEGER       | ID del equipo local                 | FOREIGN KEY -> teams(id), NOT NULL |
| away_team_id   | INTEGER       | ID del equipo visitante             | FOREIGN KEY -> teams(id), NOT NULL |
| match_date     | TIMESTAMP     | Fecha y hora del partido            | NOT NULL                     |
| week_number    | INTEGER       | Número de semana del torneo         | NOT NULL                     |
| score_home     | numeric       | Marcador local (e.g., 2)            | NULL                         |
| score_away     | numeric       | Marcador visitante (e.g., 1)        | NULL                         |
| status         | VARCHAR(20)   | Estado del partido (pending, en juego, finished) | DEFAULT 'pending'           |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |

### 4. Tabla: `pools` (Quinelas)
Almacena la información de las quinelas creadas por los usuarios.

| Campo              | Tipo          | Descripción                          | Restricciones                  |
|--------------------|---------------|--------------------------------------|-------------------------------|
| id                 | INTEGER       | Identificador único de la quinela   | PRIMARY KEY, AUTO_INCREMENT  |
| name               | VARCHAR(255)  | Nombre de la quinela                | NOT NULL                     |
| description        | TEXT          | Descripción de la quinela           | NULL                         |
| creator_id         | INTEGER       | ID del usuario creador              | FOREIGN KEY -> users(id), NOT NULL |
| invitation_code    | VARCHAR(10)   | Código de invitación único          | UNIQUE, NOT NULL             |
| max_participants   | INTEGER       | Número máximo de participantes      | DEFAULT 20                   |
| is_close           | BOOLEAN       | Si la quinela cerrada               | DEFAULT FALSE                |
| is_active          | BOOLEAN       | Si la quinela está activa           | DEFAULT TRUE                 |
| start_date         | TIMESTAMP     | Fecha que se creo la quiniela       | DEFAULT CURRENT_TIMESTAMP    |
| end_date           | TIMESTAMP     | Fecha que terminara la quiniela     | NULL                         |
| created_at         | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |
| updated_at         | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |
<!-- Recordatorio: Calcular la fecha final para la quiniela -->
<!-- Se agrego si la quiniela esta cerrada, por defecto en false, el creador
     de la quiniela podra cerrarla si se realizaron las prediciones o un dia antes de que
     empiezen los encuentros.
 -->

### 5. Tabla: `pool_participants`
Relaciona usuarios con quinelas a las que se han unido.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único de la participación | PRIMARY KEY, AUTO_INCREMENT  |
| pool_id        | INTEGER       | ID de la quinela                     | FOREIGN KEY -> pools(id), NOT NULL |
| user_id        | INTEGER       | ID del usuario participante          | FOREIGN KEY -> users(id), NOT NULL |
| joined_at      | TIMESTAMP     | Fecha de unión                       | DEFAULT CURRENT_TIMESTAMP    |

### 6. Tabla: `predictions`
Almacena las predicciones de los usuarios para los partidos.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único de la predicción| PRIMARY KEY, AUTO_INCREMENT  |
| user_id        | INTEGER       | ID del usuario que predice          | FOREIGN KEY -> users(id), NOT NULL |
| match_id       | INTEGER       | ID del partido                      | FOREIGN KEY -> matches(id), NOT NULL |
| pool_id        | INTEGER       | ID de la quinela                    | FOREIGN KEY -> pools(id), NOT NULL |
| prediction     | VARCHAR(20)   | Predicción (home, draw, away)       | NOT NULL                     |
| points         | INTEGER       | Puntos obtenidos (calculados)       | DEFAULT 0                    |
| created_at     | TIMESTAMP     | Fecha de creación de la predicción  | DEFAULT CURRENT_TIMESTAMP    |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |

### 7. Tabla: `leaderboard`
Almacena la clasificación de usuarios por quinela.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único de la entrada   | PRIMARY KEY, AUTO_INCREMENT  |
| pool_id        | INTEGER       | ID de la quinela                    | FOREIGN KEY -> pools(id), NOT NULL |
| user_id        | INTEGER       | ID del usuario                      | FOREIGN KEY -> users(id), NOT NULL |
| total_points   | INTEGER       | Puntos totales acumulados           | DEFAULT 0                    |
| position       | INTEGER       | Posición en la clasificación        | NULL                         |
| updated_at     | TIMESTAMP     | Fecha de última actualización       | DEFAULT CURRENT_TIMESTAMP    |
<!-- Recordatorio: Hacer tabla en mongodb -->

### 8. Tabla: `favorites`
Almacena los partidos favoritos de los usuarios para recibir notificaciones.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único                 | PRIMARY KEY, AUTO_INCREMENT  |
| user_id        | INTEGER       | ID del usuario                      | FOREIGN KEY -> users(id), NOT NULL |
| match_id       | INTEGER       | ID del partido                      | FOREIGN KEY -> matches(id), NOT NULL |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |

### 9. Tabla: `notifications`
Almacena las notificaciones para los usuarios.

| Campo          | Tipo          | Descripción                          | Restricciones                  |
|----------------|---------------|--------------------------------------|-------------------------------|
| id             | INTEGER       | Identificador único                 | PRIMARY KEY, AUTO_INCREMENT  |
| user_id        | INTEGER       | ID del usuario                      | FOREIGN KEY -> users(id), NOT NULL |
| title          | VARCHAR(255)  | Título de la notificación           | NOT NULL                     |
| message        | TEXT          | Mensaje de la notificación          | NOT NULL                     |
| is_read        | BOOLEAN       | Si la notificación fue leída        | DEFAULT FALSE                |
| created_at     | TIMESTAMP     | Fecha de creación                   | DEFAULT CURRENT_TIMESTAMP    |

## Relaciones

- **Usuarios y Quinelas**: Un usuario puede crear múltiples quinelas y unirse a varias mediante códigos de invitación.
- **Predicciones**: Las predicciones se hacen al inicio de la semana para todos los partidos de esa semana. Solo participantes de la quinela pueden predecir.
- **Clasificación**: Se calcula automáticamente basada en los puntos de las predicciones correctas (ej. 3 puntos por acierto exacto, 1 por resultado correcto).
- **Partidos**: Los partidos están asociados a semanas, permitiendo predicciones semanales.
- **Invitaciones**: Los códigos de invitación son únicos por quinela y permiten unirse sin invitación directa.
- **Favoritos**: Los usuarios pueden marcar partidos como favoritos para recibir notificaciones.
- **Notificaciones**: Se generan automáticamente cuando un partido favorito está por comenzar o ha comenzado.