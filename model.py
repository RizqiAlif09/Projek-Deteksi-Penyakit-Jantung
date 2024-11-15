import pickle

# Load pre-trained model
def load_model():
    model = pickle.load(open('model/model_heart.pkl', 'rb'))
    return model

# Load preprocessor (scaler and encoder)
def load_preprocessor():
    # Memuat scaler dan encoder
    scaler = pickle.load(open('model/scaler_heart.pkl', 'rb'))
    encoder = pickle.load(open('model/encoder_heart.pkl', 'rb'))
    return scaler, encoder