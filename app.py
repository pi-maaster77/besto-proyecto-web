import os
import psycopg2
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, send_file, request
from werkzeug.utils import secure_filename
import uuid

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
        connection.autocommit = True

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT json_agg(json_build_object(
                    'id', id, 
                    'image', img, 
                    'title', title
                    )) AS articulos 
                FROM articulos;
            """)
            result = cursor.fetchall()
            json_result = result[0][0]
            return jsonify(json_result)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Error en la transacción"})

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
    nombre = request.args.get('id')
    
    if nombre is None or nombre == '':
        return jsonify({"error": "El parámetro 'id' es requerido."}), 400

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT json_agg(json_build_object(
                    'text', comment, 
                    'user', user
                )) AS comentario 
                FROM comentario 
                WHERE article_id = %s;
            """, (nombre,))
            
            result = cursor.fetchone()
            json_result = result[0] if result else []
            return jsonify(json_result)
    except Exception as e:
        print(f"Error: {str(e)}")  # Muestra el error completo
        return jsonify({"error": "Error en la transacción"}), 500

@app.route('/comment', methods=['POST']) 
def post_comment():
    # Verificar que se reciban todos los datos necesarios
    token = request.form.get('token')  # Usar .get para evitar KeyError
    article_id = request.form.get('article_id')
    comment = request.form.get('comment')

    if not token or not article_id or not comment:
        return jsonify({"error": "Faltan datos requeridos"}), 400  # Código de error 400 si falta información

    print(token, article_id, comment)

    try:
        with connection.cursor() as cursor:
            # Insertar el comentario en la base de datos
            cursor.execute("""
                INSERT INTO comentario (comment, user_id, article_id) 
                VALUES (%s, %s, %s)
            """, 
            (comment, 5, article_id))  # Cambia '5' por el ID real del usuario, si corresponde

        connection.commit()  # Asegúrate de confirmar la transacción

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500  # Devuelve el error en caso de fallo

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
        
# parte encargada de inicio de sesion

@app.route("/login")
def get_login():
    return render_template("login.html")

@app.route("/login", methods=['POST'])
def handle_login():
    if not 'user' in request.form or not 'passwd' in request.form:
        return "Falta el usuario o la contraseña", 400
    
    username = request.form['user']
    passwd = request.form['passwd']

    try:
        with connection.cursor() as cursor:
            sql = "SELECT username FROM users WHERE username=%s AND password=%s"
            cursor.execute(sql, (username, passwd))

            result = cursor.fetchone()
            if result:
                return jsonify({"message": "Inicio de sesión exitoso"})
            else:
                return jsonify({"message": "Usuario o contraseña incorrectos"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
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
            sql = "SELECT username FROM users WHERE username=%s"
            cursor.execute(sql, (username,))
            result = cursor.fetchone()
            
            if result:
                return jsonify({"error": "El Usuario ya existe"}), 401
            
            sql = "INSERT INTO users (username, password) VALUES (%s, %s)"
            cursor.execute(sql, (username, passwd))
            connection.commit()
            
            return jsonify({"message": "Registro exitoso"}), 200
    except Exception as e:
        print(f"Error en el registro: {e}")
        return jsonify({"error": "Ocurrió un error en el registro."}), 500


#parte de inicio del servidor
if __name__ == "__main__":
    app.run(debug=True, port=5000)
