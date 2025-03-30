from flask import Flask, request, jsonify, send_from_directory
import os

app = Flask(__name__, static_folder='static', static_url_path='')

# Configuration de base
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Route pour servir le frontend
@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

# Route API pour l'upload
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        # Sauvegarde temporaire
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        
        # Réponse factice (à remplacer par votre logique)
        return jsonify({
            'result': "Total Leaf Area: 1000 pixels²\nLesion Area: 200 pixels²\nDisease Severity: 20.00%",
            'image': '/static/placeholder.jpg'  # Image de test
        })

# Route pour servir les fichiers statiques
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
