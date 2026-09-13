"""
database.py — a fundação da conexão com o banco.

Idêntico ao da Aula 06. Nada aqui muda por causa do upload: arquivo não é
assunto de banco de dados.

    engine        a conexão com o banco
    SessionLocal  a fábrica de sessões (uma por requisição)
    Base          a classe que todos os modelos herdam
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./eventos.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    """Classe base dos modelos. É por ela que o SQLAlchemy descobre as tabelas."""


def get_db():
    """Entrega uma sessão para a rota e garante que ela seja fechada."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
