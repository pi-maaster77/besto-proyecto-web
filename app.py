import os
import psycopg2
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, send_file, request
from flask_cors import CORS

# Cargamos las variables de entorno desde el archivo .env
load_dotenv()

# Creamos una instancia de la aplicación Flask
app = Flask(__name__)
# Habilitamos CORS (Cross-Origin Resource Sharing) para la aplicación
CORS(app)

# Obtenemos la URL de la base de datos desde las variables de entorno
url = os.getenv("DATABASE_URL")
# Establecemos la conexión a la base de datos
connection = psycopg2.connect(url)
print("Conexión exitosa")

# Configuración de la carpeta de subida
app.config['UPLOAD_FOLDER'] = 'uploads'

# Crea la carpeta de subidas si no existe
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route("/articles")
def route():
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

@app.route("/image")
def data():
    nombre = request.args.get('nombre')
    try:
        return send_file(f"uploads/{nombre}", mimetype='image/png')
    except Exception as e:
        print(e)
        return send_file(f"images/404.png", mimetype='image/*')

@app.route("/likes")
def get_likes():
    with connection.cursor() as cursor:
        reqId = request.args.get('id')
        cursor.execute(f"SELECT likes FROM articulos WHERE id = {reqId}")
        result = cursor.fetchall()
        json_result = result[0][0]
        return jsonify(json_result)
    
@app.route('/upload')
def uploader():
    return render_template("crear.html")


@app.route('/upload', methods=['POST'])
def upload_file():
    # Verifica que el archivo de imagen y el título están en la solicitud
    if 'image' not in request.files or 'title' not in request.form:
        print("Falta el archivo o el título")
        return "Falta el archivo o el título", 400

    # Obtenemos el archivo de imagen y el título
    file = request.files['image']
    title = request.form['title']

    if file.filename == '':
        print("No se seleccionó ningún archivo")
        return "No se seleccionó ningún archivo", 400

    if file and title:
        # Guardamos el archivo en la carpeta de subida
        filename = file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        print(f"Archivo subido con éxito: {filename}")

        # Guardamos el título y la imagen en la base de datos
        try:
            with connection.cursor() as cursor:
                query = "INSERT INTO articulos (img, title) VALUES (%s, %s)"
                cursor.execute(query, (filename, title))
                connection.commit()
                return jsonify({"message": "Artículo subido con éxito", "title": title, "image": filename}), 200
        except Exception as e:
            print(e)
            return jsonify({"error": str(e)}), 500

@app.route("/login", methods=['POST'])
def iniciar_sesion():
    if not 'user' in request.form or not 'passwd' in request.form:
        return "Falta el usuario o la contraseña", 400
    
    username = request.form['user']
    passwd = request.form['passwd']  # Contraseña hasheada desde el cliente

    try:
        with connection.cursor() as cursor:
            # Usamos una consulta parametrizada
            sql = "SELECT username FROM users WHERE username=%s AND password=%s"
            cursor.execute(sql, (username, passwd))  # Comparación con contraseña hasheada

            result = cursor.fetchone()
            if result:
                return jsonify({"message": "Inicio de sesión exitoso"})
            else:
                return jsonify({"message": "Usuario o contraseña incorrectos"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/register", methods=['POST'])
def registro():
    if not 'user' in request.form or not 'passwd' in request.form:
        return "Falta el usuario o la contraseña", 400
    
    username = request.form['user']
    passwd = str(request.form['passwd'])  # Contraseña hasheada desde el cliente
    print(username, passwd)
    try:
        with connection.cursor() as cursor:
            # Usamos una consulta parametrizada
            sql = "SELECT username FROM users WHERE username=%s"
            cursor.execute(sql, (username,))  # Comparación con contraseña hasheada
            result = cursor.fetchone()
            if result:
                return jsonify({"message": "El Usuario ya existe"}), 401
            else:
                sql = "INSERT INTO users (username, password) VALUES (%s, %s)"
                cursor.execute(sql, (username, passwd))  # Insertar el nuevo usuario
                connection.commit()  # No olvides hacer commit para que se guarden los cambios
                return jsonify({"message": "Registro exitoso"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
