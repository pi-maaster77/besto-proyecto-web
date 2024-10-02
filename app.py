import os
import psycopg2
import uuid
import json

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, send_file, request
from werkzeug.utils import secure_filename


load_dotenv()

# configuracion de flask
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

#configuracion de la base de datos
url = os.getenv("DATABASE_URL")
connection = psycopg2.connect(url)

# Parte encargada de manejar el home
@app.route("/")
def get_home():
    return render_template("index.html")

@app.route("/articles")
def get_articles():
    try:
        # No necesitas autocommit para una consulta SELECT
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT json_agg(json_build_object(
                    'id', id, 
                    'image', img, 
                    'title', title
                )) AS articulos
                FROM articulos;
            """)
            result = cursor.fetchone()  # Solo se espera una fila
            json_result = result[0] if result and result[0] else []  # Verificación de resultado nulo
            return jsonify(json_result), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Error en la transacción"}), 500


@app.route("/image")
def get_image():
    nombre = request.args.get('name')
    try:
        return send_file(f"uploads/{nombre}", mimetype='image/png')
    except Exception as e:
        print(e)
        return send_file(f"static/assets/404.png", mimetype='image/*')

@app.route("/likes")
def get_likes():
    with connection.cursor() as cursor:
        reqId = request.args.get('id')
        cursor.execute(f"SELECT likes FROM articulos WHERE id = {reqId}")
        result = cursor.fetchall()
        json_result = result[0][0]
        return jsonify(json_result)

# Parte encargada de manejar los comentarios

@app.route('/comment')
def get_comment():
    article_id = request.args.get('id')  # Cambié nombre a article_id para mayor claridad

    if article_id is None or article_id == '':
        return jsonify({"error": "El parámetro 'id' es requerido."}), 400

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT json_agg(json_build_object(
                    'text', c.comment, 
                    'user', u.username
                )) AS comentarios 
                FROM comentario c
                JOIN users u ON c.user_id = u.id  -- Join con la tabla de usuarios
                WHERE c.article_id = %s
            """, (article_id,))
            
            result = cursor.fetchone()
            json_result = result[0] if result else []  # Maneja caso en que no haya resultados
            return jsonify(json_result)
    except Exception as e:
        print(f"Error: {str(e)}")  # Muestra el error completo
        return jsonify({"error": "Error en la transacción"}), 500


@app.route('/comment', methods=['POST']) 
def post_comment():
    token = request.form.get('token').strip()  # Asegúrate de eliminar espacios en blanco
    article_id = request.form.get('article_id')
    comment = request.form.get('comment')

    # Verificar que se reciban todos los datos necesarios
    if not token or not article_id or not comment:
        return jsonify({"error": "Faltan datos requeridos"}), 400  # Código 400 si falta información

    try:
        with connection.cursor() as cursor:
            # Imprimir el token recibido para verificarlo
            print(f"Token recibido: {token}")

            # Verificar si el token es válido y obtener el user_id
            cursor.execute("SELECT user_id FROM tokens WHERE token = %s", (token,))
            result = cursor.fetchone()

            # Imprimir el resultado de la consulta para depuración
            print(f"Resultado de la consulta del token: {result}")

            if not result:
                return jsonify({"error": "Token inválido"}), 403  # Código 403 si el token no es válido

            user_id = result[0]

            # Insertar el comentario en la base de datos
            cursor.execute("""
                INSERT INTO comentario (comment, user_id, article_id) 
                VALUES (%s, %s, %s)
            """, (comment, user_id, article_id))

        connection.commit()  # Confirmar la transacción

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Error en la transacción: {str(e)}"}), 500  # Manejar el error correctamente

    return jsonify({'message': 'Comentario subido con éxito'}), 200  # Respuesta exitosa


# Parte encargada de manejar la subida de nuevos articulos

@app.route('/upload')
def get_upload():
    return render_template("upload.html")

@app.route('/upload', methods=['POST'])
def handle_upload():
    if 'image' not in request.files or 'title' not in request.form:
        print("Falta el archivo o el título")
        return "Falta el archivo o el título", 400

    file = request.files['image']
    title = request.form['title']

    if file.filename == '':
        print("No se seleccionó ningún archivo")
        return "No se seleccionó ningún archivo", 400

    if file and title:
        try:
            # Generar un nombre único utilizando UUID para evitar colisiones
            extension = os.path.splitext(file.filename)[1]  # Obtener la extensión original
            unique_id = str(uuid.uuid4())  # Generar un UUID único
            filename = secure_filename(f"{title}_{unique_id}{extension}")  # Asegurar el nombre
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)  # Guardar la imagen

            print(f"Imagen guardada correctamente: {filename}")

            # Ahora inserta el artículo en la base de datos con el nombre seguro de la imagen
            with connection.cursor() as cursor:
                query = "INSERT INTO articulos (title, img) VALUES (%s, %s)"
                cursor.execute(query, (title, filename))
                connection.commit()
                print(f"Artículo con título '{title}' y imagen '{filename}' insertado correctamente en la base de datos")

            return jsonify({"message": "Artículo subido con éxito", "title": title, "image": filename}), 200

        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"error": str(e)}), 500
        
# parte encargada del manejo de sesiones

@app.route("/login")
def get_login():
    return render_template("login.html")

@app.route("/login", methods=['POST'])
def handle_login():
    if 'user' not in request.form or 'passwd' not in request.form:
        return jsonify({"error": "Falta el usuario o la contraseña"}), 400
    
    username = request.form['user']
    passwd = request.form['passwd']
    try:
        # Obtener conexión a la base de datos
        with connection.cursor() as cursor:
            # Buscar usuario
            cursor.execute("SELECT id FROM users WHERE username=%s and password=%s", (username,passwd))
            result = cursor.fetchone()

            if result:  # Verificar contraseña
                user_id = result[0]
                token = str(uuid.uuid4())  # Generar token
                cursor.execute("INSERT INTO tokens (user_id, token) VALUES (%s, %s)", (user_id, token))  # Insertar token

                connection.commit()  # Confirmar los cambios en la base de datos
                return jsonify({
                    "message": "Inicio de sesión exitoso",
                    "token": token
                }), 200
            else:
                return jsonify({"message": "Usuario o contraseña incorrectos"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/logout", methods=["POST"])
def logout():
    print(request.mimetype)  # Verificar el tipo de contenido
    data = request.get_data(as_text=True)  # Obtener el cuerpo de la solicitud como texto

    # Intentar convertir el texto a JSON
    try:
        data = json.loads(data)  # Convertir el contenido de texto a un diccionario JSON
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format"}), 400

    # Obtener el token del JSON
    token = data.get("token")
    if not token:
        return jsonify({"error": "Token not provided"}), 400

    try:
        # Obtener conexión a la base de datos
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM tokens WHERE token=%s", (token,))  # Agregar paréntesis para una tupla
            connection.commit()  # Asegúrate de confirmar la transacción
    except Exception as e:
        print(e)
        return jsonify({"error": "Database error"}), 500  # Manejar el error de la base de datos

    print(token)  # Imprimir el token para depuración
    return jsonify({"token": token}), 200  # Devolver el token en la respuesta

@app.route("/username")
def get_username_root():
    token = request.args.get("token")
    
    if not token:
        return jsonify({"error": "Token no proporcionado"}), 400
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT u.username
                FROM users u
                JOIN tokens t ON u.id = t.user_id
                WHERE t.token = %s
            """, (token,))  # El token debe pasarse como una tupla (token,)
            result = cursor.fetchone()

            if result:
                return jsonify({"username": result[0]}), 200
            else:
                return jsonify({"error": "Token inválido o usuario no encontrado"}), 404

    except psycopg2.Error as e:  # Usa la excepción adecuada si es PostgreSQL, o usa Exception si es otra base de datos
        print(f"Error en la transacción: {e}")
        return jsonify({"error": "Error en la transacción"}), 500



# parte encargada del registro de usuarios

@app.route("/register")
def get_register():
    return render_template("register.html")

@app.route("/register", methods=['POST'])
def handle_register():
    if not 'user' in request.form or not 'passwd' in request.form:
        return jsonify({"error": "Falta el usuario o la contraseña"}), 400
    
    username = request.form['user']
    passwd = str(request.form['passwd'])
    print(username, passwd) 
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT username FROM users WHERE username=%s", (username,))
            result = cursor.fetchone()
            
            if result:
                return jsonify({"error": "El Usuario ya existe"}), 401
            
            cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, passwd))
            connection.commit()
            
            return jsonify({"message": "Registro exitoso"}), 200
    except Exception as e:
        print(f"Error en el registro: {e}")
        return jsonify({"error": "Ocurrió un error en el registro."}), 500


#parte de inicio del servidor
if __name__ == "__main__":
    app.run(debug=True, port=5000)
