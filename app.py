from flask import Flask, request, jsonify
import os
import cv2
import numpy as np

app = Flask(__name__)

# Configuration minimale
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Vérification basique du fichier
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Sauvegarde temporaire
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)

        # Traitement d'image minimal (exemple)
        img = cv2.imread(filename)
        if img is None:
            return jsonify({'error': 'Invalid image file'}), 400

        # Calculs factices (à remplacer par votre logique)
        height, width = img.shape[:2]
        leaf_area = width * height
        lesion_area = int(leaf_area * 0.1)  # 10% de lésion
        severity = 10.0  # 10%

        # Construction de la réponse
        response = {
            'result': f"Total Leaf Area: {leaf_area} pixels²\n"
                     f"Lesion Area: {lesion_area} pixels²\n"
                     f"Disease Severity: {severity}%",
            'image': filename  # Dans un cas réel, encodez en base64
        }
        
        return jsonify(response)

    except Exception as e:
        # Log l'erreur complète pour le débogage
        app.logger.error(f"Error processing file: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
