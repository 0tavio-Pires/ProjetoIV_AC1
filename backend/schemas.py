"""
schemas.py — o contrato da API.

O upload muda o contrato de saída, não o de entrada: `EventoCreate`
continua igual, porque o cartaz não é enviado junto com o JSON de criação.
Ele vai em uma requisição própria, com outro formato (multipart).
"""

from datetime import date

from pydantic import BaseModel, Field


class EventoCreate(BaseModel):
    """O que o cliente ENVIA no POST /eventos. Sem novidade em relação à Aula 06."""

    nome: str = Field(
        min_length=3,
        max_length=100,
        description="Nome do evento",
        examples=["Hackathon IBMEC"],
    )
    data: date = Field(
        description="Data do evento no formato AAAA-MM-DD",
        examples=["2026-09-12"],
    )
    local: str = Field(
        min_length=3,
        max_length=120,
        examples=["Auditório – Campus Barra"],
    )
    vagas: int = Field(
        ge=1,
        le=1000,
        description="Número de vagas (de 1 a 1000)",
        examples=[80],
    )


class EventoResponse(BaseModel):
    """
    O que a API DEVOLVE.

    `cartaz_url` é opcional e vem como null enquanto ninguém enviou imagem.
    O cliente usa esse campo direto no src de um <img>: quem busca o arquivo
    é o navegador, falando com o Blob Storage sem passar por esta API.
    """

    id: int
    nome: str
    data: date
    local: str
    vagas: int
    cartaz_url: str | None = None
