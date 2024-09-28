import os
import psycopg2
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, send_file, request
from flask_cors import CORS

load_dotenv()

# configuracion de flask
app = Flask(__name__)
CORS(app)
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
        return send_file(f"images/404.png", mimetype='image/*')

@app.route("/likes")
def get_likes():
    with connection.cursor() as cursor:
        reqId = request.args.get('id')
        cursor.execute(f"SELECT likes FROM articulos WHERE id = {reqId}")
        result = cursor.fetchall()
        json_result = result[0][0]
        return jsonify(json_result)

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
        filename = file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        print(f"Archivo subido con éxito: {filename}")

        try:
            with connection.cursor() as cursor:
                query = "INSERT INTO articulos (img, title) VALUES (%s, %s)"
                cursor.execute(query, (filename, title))
                connection.commit()
                return jsonify({"message": "Artículo subido con éxito", "title": title, "image": filename}), 200
        except Exception as e:
            print(e)
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
