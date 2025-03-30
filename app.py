from flask import Flask, request, jsonify, render_template
import os
import cv2
import numpy as np
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    # Vérification du fichier
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier envoyé'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'Aucun fichier sélectionné'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Chargement et traitement de l'image
            img = cv2.imread(filepath)
            
            # Exemple de calcul (à remplacer par votre algorithme)
            leaf_area = np.count_nonzero(img)  # Exemple simplifié
            lesion_area = leaf_area * 0.2      # Exemple: 20% de lésion
            severity = (lesion_area / leaf_area) * 100 if leaf_area > 0 else 0
            
            # Préparation des résultats
            result_text = (
                f"Total Leaf Area: {leaf_area:.2f} pixels²\n"
                f"Lesion Area: {lesion_area:.2f} pixels²\n"
                f"Disease Severity: {severity:.2f}%"
            )
            
            # Sauvegarde de l'image traitée (exemple)
            processed_img_path = os.path.join(app.config['UPLOAD_FOLDER'], 'processed_' + filename)
            cv2.imwrite(processed_img_path, img)
            
            return jsonify({
                'result': result_text,
                'image': processed_img_path  # Ou conversion en base64
            })
            
        except Exception as e:
            return jsonify({'error': f'Erreur de traitement: {str(e)}'}), 500
            
    return jsonify({'error': 'Type de fichier non autorisé'}), 400

if __name__ == '__main__':
    # Création du dossier upload s'il n'existe pas
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
