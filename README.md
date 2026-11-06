# AI-Powered Student Mental Health Score Predictor

A full-stack machine learning web app that predicts a student's **mental health score (0–10)** from social media usage and lifestyle habits. A scikit-learn Random Forest pipeline is served by **FastAPI**, with a custom dark glassmorphism interface built in pure **HTML, CSS and JavaScript**.

> Educational project. The score is a statistical estimate and **not** a medical diagnosis.

## Screenshot

<p align="center">
  <img src="images/ui-preview.jpeg" alt="AI-Powered Student Mental Health Score Predictor interface" width="420">
</p>

## Features

- **ML prediction API** with strict request validation (Pydantic)
- **Premium UI**: dark/light theme, animated hero, particles, glass cards, floating-label form
- **Animated result**: counting score, circular gauge, colour-coded tiers
- **Personalised recommendations** based on the score and the user's own inputs (sleep, screen time, activity, stress)
- Client-side form validation, toast notifications, loading overlay, scroll progress bar, FAQ and custom 404 page
- Fully responsive, with no frontend frameworks or libraries

## Tech stack

| Layer | Tools |
|---|---|
| Machine learning | Python, pandas, NumPy, scikit-learn, joblib |
| Backend | FastAPI, Pydantic, Uvicorn |
| Frontend | HTML5, CSS3, vanilla JavaScript (Fetch API) |

## The model

- **Data:** 5,000 student records, 12 input features, target `Mental_Health_Score`
- **Cleaning:** removed duplicates, clipped negative physical activity values
- **Feature engineering:** `Country` has 111 unique values, so it is grouped into the top 10 countries plus `Other`
- **Preprocessing (`ColumnTransformer`):**
  - `Study_Hours` (skewed): `log1p` then standard scaling
  - Other numeric columns: standard scaling
  - `Stress_Level`: ordinal encoding (Low < Medium < High < Very High)
  - Other categorical columns: one-hot encoding
- **Models compared** (70/30 train-test split):

| Model | Test R² | Test MAE | Test RMSE |
|---|---|---|---|
| Linear Regression | 0.740 | 0.536 | 0.676 |
| **Random Forest (default), deployed** | **0.878** | **0.347** | **0.463** |
| Random Forest (tuned, RandomizedSearchCV) | 0.859 | 0.377 | 0.498 |

The full pipeline (preprocessing and model) is saved as a single `Mental_Health_Model.pkl`, so the API receives raw inputs and applies exactly the training transformations.

**Limitations:** the default Random Forest fits the training data much more closely (train R² 0.98) than the test data (0.88), so some overfitting is present. The training data covers students aged 18–24, so predictions outside that range are less reliable.

## API

`POST /predict`

```json
{
  "age": 20,
  "gender": "Female",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 4.5,
  "daily_unlocks": 80,
  "study_hours": 5,
  "physical_activity_hours": 1,
  "sleep_hours_per_night": 7,
  "stress_level": "Medium"
}
```

Response:

```json
{ "predicted_mental_health_score": 7.84 }
```

Interactive docs are available at `/docs` while the server is running.

## Project structure

```
├── project.py                  # FastAPI app: serves the UI and /predict
├── Mental_Health_Model.pkl     # trained scikit-learn pipeline
├── Mental_Health_Score_Project.ipynb   # EDA, preprocessing, training, evaluation
├── requirements.txt
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    └── js/app.js
```

## Run locally

```bash
git clone https://github.com/gajjuds9370-stack/AI-Powered-Mental-Health-Score-Predictor.git
cd AI-Powered-Mental-Health-Score-Predictor

python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
uvicorn project:app --reload
```

Open **http://127.0.0.1:8000**.

> The model was saved with a specific scikit-learn version. If loading fails, install the version used for training.

## Future improvements

- Cross-validated model comparison with gradient boosting
- Feature importance and per-prediction explanations (SHAP)
- Docker image and cloud deployment
- Unit tests for the API

## Disclaimer

This project is for learning and demonstration. It is not a clinical tool. If you or someone you know is struggling, please contact a qualified mental health professional.
