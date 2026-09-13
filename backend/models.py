"""
models.py — a tabela, agora com um endereço para o cartaz.

A única mudança em relação à Aula 06 é a última coluna. Repare no que ela
NÃO é: não é a imagem, não é binário, não é base64. É texto — o endereço
de um arquivo que mora fora do banco.
"""

from datetime import date

from sqlalchemy import Date, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Evento(Base):
    """Esta classe vira a tabela `eventos` no banco."""

    __tablename__ = "eventos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    data: Mapped[date] = mapped_column(Date, nullable=False)
    local: Mapped[str] = mapped_column(String(120), nullable=False)
    vagas: Mapped[int] = mapped_column(Integer, nullable=False)

    # nullable=True de propósito: o evento nasce sem cartaz e ganha um
    # depois. Exigir imagem no momento da criação seria uma decisão de
    # produto, e ninguém pediu isso.
    #
    # 500 caracteres porque a URL carrega o nome da conta, o container e
    # o nome do blob — e, se um dia virar link com SAS, cresce bastante.
    cartaz_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<Evento id={self.id} nome={self.nome!r}>"
