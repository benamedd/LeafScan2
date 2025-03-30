from flask import Flask, request, jsonify
import os

# Initialisation de l'application Flask
app = Flask(__name__)

@app.route('/')
def home():
    return "Bienvenue sur LeafScan AI"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        # Exemple de traitement - remplacer par votre logique réelle
        leaf_area = 1000
        lesion_area = 150
        severity = (lesion_area / leaf_area) * 100

        result_text = (
            f"Total Leaf Area: {leaf_area} pixels²\n"
            f"Lesion Area: {lesion_area} pixels²\n"
            f"Disease Severity: {severity:.2f}%"
        )

        return jsonify({
            'result': result_text,
            'image': 'data:image/png;base64,...'  # Remplacez par votre image encodée
        })

    return jsonify({'error': 'File processing failed'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
