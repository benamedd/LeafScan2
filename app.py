@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        # Traitement de l'image et calcul des valeurs
        leaf_area = 1000  # Exemple - remplacer par votre calcul réel
        lesion_area = 150  # Exemple - remplacer par votre calcul réel
        severity = (lesion_area / leaf_area) * 100  # Exemple de calcul

        # Chaîne formatée CORRECTE sur plusieurs lignes
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
