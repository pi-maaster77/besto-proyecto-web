-- Crear una base de datos (si aún no existe)
CREATE DATABASE besto_proyecto;

-- Usar la base de datos recién creada
\c ;

-- Crear la tabla `articulos`
CREATE TABLE articulos (
    id SERIAL PRIMARY KEY,
    img VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE, 
    likes INT DEFAULT 0
);

CREATE TABLE likes (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    article_id INT REFERENCES articulos(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, article_id)
);

-- Crear la tabla `users`
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
    img VARCHAR(255)
);

CREATE TABLE comentario (
    id SERIAL PRIMARY KEY,
    comment VARCHAR(255) NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    article_id INT REFERENCES articulos(id) ON DELETE CASCADE,
    likes INT DEFAULT 0
);

CREATE TABLE comentario_likes (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    comment_id INT REFERENCES comentario(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, comment_id)
);

CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL
);

-- Crear un nuevo usuario en PostgreSQL (reemplaza 'server' y 'app_password' con los valores deseados)
CREATE USER server WITH PASSWORD --'contraseña'; -- modificar antes de usar

-- Otorgar permisos al usuario en la base de datos y tablas
GRANT CONNECT ON DATABASE besto_proyecto TO server;
GRANT USAGE ON SCHEMA public TO server;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO server;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO server;

-- Para asegurarte de que los permisos se otorguen también a nuevas tablas y secuencias en el futuro
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO server;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO server;