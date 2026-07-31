import os
import gradio as gr
import torch
import spaces
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

# -----------------------------------------------------------------------------
# 1. KONFIGURASI ENVIRONMENT & KREDENSIAL
# -----------------------------------------------------------------------------
MODEL_NAME = os.getenv("HF_MODEL_REPO_ID", "Mthala/mbert-resolv-ai")
HF_TOKEN = os.getenv("HF_TOKEN", None)
API_SECRET = os.getenv("API_SECRET_KEY", "secret-key-resolv-dev")

classifier = None

# Konvensi 5 Kelas Kategori sesuai Project Hub
ID_TO_LABEL = {
    0: "Billing inquiry",
    1: "Cancellation request",
    2: "Product inquiry",
    3: "Refund request",
    4: "Technical issue"
}

# -----------------------------------------------------------------------------
# 2. LOAD MODEL MBERT DARI REPOSITORI PRIVAT
# -----------------------------------------------------------------------------
def load_mbert():
    global classifier
    print(f"🔄 Sedang memuat model AI dan Tokenizer dari Hub: {MODEL_NAME}...") 
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, token=HF_TOKEN)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, token=HF_TOKEN)
        classifier = pipeline("text-classification", model=model, tokenizer=tokenizer)
        print("✅ Model mBERT dan Tokenizer BERHASIL dimuat ke memori!")
    except Exception as e:
        print(f"⚠️ Peringatan: Gagal memuat model dari {MODEL_NAME}: {e}")

# Load saat kontainer menyapa
load_mbert()

# -----------------------------------------------------------------------------
# 3. FUNGSI INFERENSI (WEB UI & OTOMATIS JADI REST API /predict)
# -----------------------------------------------------------------------------
@spaces.GPU
def predict_complaint(teks_keluhan: str, api_key: str = ""):
    # PERBAIKAN: Validasi API Key yang sesungguhnya!
    if api_key != API_SECRET:
        return "⚠️ Error: Akses Ditolak! API Key tidak valid atau kosong.", 0.0

    if not classifier:
        return "⚠️ Error: Model AI belum tersambung ke memori atau gagal diunduh", 0.0
    
    if not teks_keluhan or not teks_keluhan.strip():
        return "⚠️ Error: Teks keluhan tidak boleh kosong", 0.0
        
    try:
        result = classifier(teks_keluhan)
        raw_label = str(result[0]["label"]).strip()
        
        # Terjemahkan format keluaran default HF (misal: "LABEL_2" atau "2") ke nama kategori
        if raw_label.startswith("LABEL_"):
            try:
                idx = int(raw_label.replace("LABEL_", ""))
                label = ID_TO_LABEL.get(idx, f"Class {raw_label}")
            except:
                label = raw_label
        elif raw_label.isdigit():
            label = ID_TO_LABEL.get(int(raw_label), raw_label)
        else:
            label = raw_label
            
        score = round(float(result[0]["score"]), 4)
        return label, score
    except Exception as e:
        return f"⚠️ Error inferensi AI: {e}", 0.0

# Fungsi untuk tombol Wake Up dari Admin Dashboard (Endpoint /wake)
def wake_service():
    if classifier is not None:
        return "🟢 STATUS ONLINE: Resolv.ai ML Service is Awake and Ready! (mBERT Loaded)"
    return "🟡 STATUS AWAKE: Service ON, but AI Model failed to load."

# -----------------------------------------------------------------------------
# 4. MEMBANGUN ANTARMUKA GRADIO 5 MURNI (100% ANTI-CRASH DI HF SPACES)
# -----------------------------------------------------------------------------
with gr.Blocks(title="Resolv.ai mBERT Classifier", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🛠️ Resolv.ai — mBERT Complaint Classifier")
    gr.Markdown(
        "Backend AI Resmi untuk analisis & klasifikasi otomatis keluhan konsumen **Resolv.ai**.\n"
        "Beroperasi dengan arsitektur **Murni Gradio 5 (Free Tier)** yang dijamin stabil 100% tanpa risiko crash."
    )
    
    with gr.Tab("🔍 Uji Coba Klasifikasi AI"):
        with gr.Row():
            with gr.Column():
                input_text = gr.Textbox(
                    label="Teks Keluhan Konsumen (Bahasa Indonesia)",
                    placeholder="Contoh: Internet wifi rumah saya putus nyala terus dari kemarin, tolong segera perbaiki!",
                    lines=4
                )
                input_api = gr.Textbox(
                    label="API Secret Key (Wajib diisi untuk tes manual maupun Next.js)", 
                    type="password", 
                    placeholder="Masukkan secret key..."
                )
                btn_predict = gr.Button("🔥 Prediksi Kategori Sekarang", variant="primary", size="lg")
            
            with gr.Column():
                output_cat = gr.Textbox(label="Kategori Prediksi (Output mBERT)")
                output_conf = gr.Number(label="Confidence Score (0.0 - 1.0)")
                
        # Mendaftarkan fungsi sebagai endpoint API resmi bernama '/predict'
        btn_predict.click(
            fn=predict_complaint, 
            inputs=[input_text, input_api], 
            outputs=[output_cat, output_conf],
            api_name="predict"
        )

    with gr.Tab("🛡️ Service Health Check & Wake Up"):
        gr.Markdown("Endpoint ini dicolek oleh tombol **'Wake Up AI Service'** di Dashboard Admin Resolv.ai (Next.js).")
        btn_wake = gr.Button("⚡ Wake Up Service (Check Status)", variant="secondary")
        output_status = gr.Textbox(label="Status Kesiapan Server", lines=2)
        
        # Mendaftarkan fungsi sebagai endpoint API resmi bernama '/wake'
        btn_wake.click(
            fn=wake_service,
            inputs=[],
            outputs=[output_status],
            api_name="wake"
        )

if __name__ == "__main__":
    demo.launch()