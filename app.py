import logging
from flask import Flask, render_template, request
import joblib
import pandas as pd

app = Flask(__name__)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

MODEL_PATH = 'model/model_heart.pkl'
SCALER_PATH = 'model/scaler_heart.pkl'
ENCODER_PATH = 'model/encoder_heart.pkl'

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    encoder = joblib.load(ENCODER_PATH)
    logging.info("Model, scaler, dan encoder berhasil dimuat.")
except Exception as e:
    logging.error(f"Gagal memuat model atau preprocessing files: {e}")
    model, scaler, encoder = None, None, None

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/aplikasi")
def aplikasi():
    return render_template("aplikasi.html")

def preprocess_input(data):
    """Preprocessing input data."""
    try:
        # One-Hot Encoding the categorical features
        user_input_encoded = encoder.transform(data[['Sex', 'ChestPainType', 'RestingECG', 'ExerciseAngina', 'ST_Slope']])
        encoded_df = pd.DataFrame(user_input_encoded, columns=encoder.get_feature_names_out())

        # Drop original categorical features and concatenate encoded ones
        data = data.drop(columns=['Sex', 'ChestPainType', 'RestingECG', 'ExerciseAngina', 'ST_Slope'])
        processed_data = pd.concat([data, encoded_df], axis=1)

        # Scale numeric features
        scaled_data = scaler.transform(processed_data)

        return scaled_data
    except Exception as e:
        logging.error(f"Error in preprocessing: {e}")
        raise ValueError("Terjadi kesalahan dalam proses preprocessing data.")

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not scaler or not encoder:
        error_text = "Model atau preprocessing files tidak tersedia. Hubungi administrator."
        return render_template('aplikasi.html', hasil_prediksi=None, nilai_kepercayaan=None, error_text=error_text)

    try:
        input_data = {
            'Age': int(request.form['age']),
            'Sex': request.form['sex'],
            'ChestPainType': request.form['chest_pain_type'],
            'RestingBP': int(request.form['resting_bp']),
            'Cholesterol': int(request.form['cholesterol']),
            'FastingBS': int(request.form['fasting_bs']),
            'RestingECG': request.form['resting_ecg'],
            'MaxHR': int(request.form['max_hr']),
            'ExerciseAngina': request.form['exercise_angina'],
            'Oldpeak': float(request.form['oldpeak']),
            'ST_Slope': request.form['st_slope']
        }

        user_input_df = pd.DataFrame([input_data])

        user_input_scaled = preprocess_input(user_input_df)

        user_prediction = model.predict(user_input_scaled)
        user_probabilities = model.predict_proba(user_input_scaled)
        heart_disease_probability = user_probabilities[0][1] * 100

        if user_prediction[0] == 0:
            hasil_prediksi = "Tidak ada penyakit jantung"
            nilai_kepercayaan = 100 - heart_disease_probability
        else:
            hasil_prediksi = "Ada penyakit jantung"
            nilai_kepercayaan = heart_disease_probability

        return render_template(
            'aplikasi.html',
            hasil_prediksi=hasil_prediksi,
            nilai_kepercayaan=round(nilai_kepercayaan, 2),
            error_text=None
        )
    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        error_text = "Terjadi kesalahan dalam memproses data. Pastikan semua input sudah benar."
        return render_template('aplikasi.html', hasil_prediksi=None, nilai_kepercayaan=None, error_text=error_text)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
