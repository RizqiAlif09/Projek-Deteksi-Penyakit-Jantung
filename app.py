from flask import Flask, render_template, request
import pickle
import pandas as pd
import numpy as np

app = Flask(__name__)

# Load the pre-trained Random Forest model, scaler, and encoder
model = pickle.load(open('model/model_heart.pkl', 'rb'))
scaler = pickle.load(open('model/scaler_heart.pkl', 'rb'))
encoder = pickle.load(open('model/encoder_heart.pkl', 'rb'))

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/aplikasi")
def aplikasi():
    return render_template("aplikasi.html")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input values from the form
        age = int(request.form['age'])
        sex = request.form['sex']
        chest_pain_type = request.form['chest_pain_type']
        resting_bp = int(request.form['resting_bp'])
        cholesterol = int(request.form['cholesterol'])
        fasting_bs = int(request.form['fasting_bs'])
        resting_ecg = request.form['resting_ecg']
        max_hr = int(request.form['max_hr'])
        exercise_angina = request.form['exercise_angina']
        oldpeak = float(request.form['oldpeak'])
        st_slope = request.form['st_slope']

        # Prepare input data in the same format as the training data
        input_data = {
            'Age': age,
            'Sex': sex,
            'ChestPainType': chest_pain_type,
            'RestingBP': resting_bp,
            'Cholesterol': cholesterol,
            'FastingBS': fasting_bs,
            'RestingECG': resting_ecg,
            'MaxHR': max_hr,
            'ExerciseAngina': exercise_angina,
            'Oldpeak': oldpeak,
            'ST_Slope': st_slope
        }

        # Convert input data to DataFrame for preprocessing
        user_input_df = pd.DataFrame([input_data])

        # One-Hot Encoding the categorical features (Sex, ChestPainType, RestingECG, ExerciseAngina, ST_Slope)
        user_input_encoded = encoder.transform(user_input_df[['Sex', 'ChestPainType', 'RestingECG', 'ExerciseAngina', 'ST_Slope']])
        encoded_df = pd.DataFrame(user_input_encoded, columns=encoder.get_feature_names_out())

        # Concatenate the encoded features with the rest of the numeric features
        user_input_df = user_input_df.drop(columns=['Sex', 'ChestPainType', 'RestingECG', 'ExerciseAngina', 'ST_Slope'])
        user_input_df = pd.concat([user_input_df, encoded_df], axis=1)

        # Scaling the numeric features
        user_input_scaled = scaler.transform(user_input_df)

        # Predict using the Random Forest model
        user_prediction = model.predict(user_input_scaled)
        user_probabilities = model.predict_proba(user_input_scaled)
        heart_disease_probability = user_probabilities[0][1] * 100

        # Display the prediction result
        if user_prediction[0] == 0:
            hasil_prediksi = "Tidak ada penyakit jantung"
            nilai_kepercayaan = 100 - heart_disease_probability
        else:
            hasil_prediksi = "Ada penyakit jantung"
            nilai_kepercayaan = heart_disease_probability

        return render_template('aplikasi.html', hasil_prediksi=hasil_prediksi, nilai_kepercayaan=round(nilai_kepercayaan, 2), error_text=None)

    except Exception as e:
        # Handle invalid inputs or errors
        error_text = str(e)
        return render_template('aplikasi.html', hasil_prediksi=None, nilai_kepercayaan=None, error_text=error_text)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
