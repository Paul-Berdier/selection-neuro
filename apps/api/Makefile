.PHONY: venv install run lint fmt migrate seed

venv:
	python -m venv .venv

install:
	. .venv/bin/activate && pip install -U pip && pip install -r requirements.txt

run:
	. .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

migrate:
	. .venv/bin/activate && alembic upgrade head

seed:
	. .venv/bin/activate && python -m app.scripts.seed