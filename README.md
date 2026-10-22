# DARKPATTERN-AI

A COMPLETE production-quality and research-grade system for automatically detecting, classifying, and localizing dark patterns in websites.

The system uses:
1. Website screenshots
2. DOM structure
3. Visible text
4. Computed CSS/style information
5. Cross-page state
6. Checkout/cart state
7. Machine learning
8. Rule-based detection
9. Multimodal/vision models

## Project Scope
This project is intended for academic research, experimentation, benchmarking, and a browser-extension demonstration. It rigorously tracks data, manages models, evaluates metrics properly (F1, Precision, Recall, etc.), and prevents data leakage across site-level splits.

## Architecture

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Recharts
- **Backend**: Python 3.11+, Flask, SQLAlchemy, Celery
- **Database**: MySQL 8+
- **Machine Learning**: PyTorch, scikit-learn, HuggingFace, OpenCV
- **Crawler**: Playwright (Python)
- **Deployment**: Docker, Docker Compose, Nginx

## Setup Instructions

1. **Prerequisites**: Ensure you have Docker, Docker Compose, and Node.js installed.
2. **Clone the repository**: `git clone <repository_url>`
3. **Environment Setup**: Copy `.env.example` to `.env` and fill in necessary details.
4. **Docker Setup**: Run `docker compose up --build -d` to start all services (MySQL, Redis, Backend, Frontend, MLflow).
5. **Database Migration**: Run `docker compose exec backend flask db upgrade`.
6. **Dataset Management**:
    - Download datasets: `python scripts/download_datasets.py`
    - Prepare datasets: `python scripts/prepare_datasets.py`
    - Validate datasets: `python scripts/validate_dataset.py`
    - Create split: `python scripts/create_site_split.py`
7. **Model Training**:
    - TF-IDF Baseline: `python -m ml.training.train_tfidf`
    - Transformer: `python -m ml.training.train_transformer`
    - Vision: `python -m ml.training.train_vision`
    - Multimodal: `python -m ml.training.train_multimodal`
8. **Evaluation**:
    - Run evaluation: `python -m ml.evaluation.evaluate_all`
    - Generate report: `python -m ml.evaluation.generate_report`

## Documentation
Please refer to the `docs/` directory for detailed documentation on architecture, datasets, annotation, and model cards.
