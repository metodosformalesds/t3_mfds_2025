import pytest
from app.api.v1.endpoints.perfil_proveedor import AlertaResultadoSchema, AlertaResultadoBodySchema
from pydantic import ValidationError


def test_alerta_resultado_schema_valid():
    data = {"logro": True, "id_publicacion": 123}
    schema = AlertaResultadoSchema(**data)
    assert schema.logro is True
    assert schema.id_publicacion == 123


def test_alerta_resultado_schema_invalid_missing_logro():
    data = {"id_publicacion": 1}
    with pytest.raises(ValidationError):
        AlertaResultadoSchema(**data)


def test_alerta_resultado_body_schema_valid():
    data = {"proveedor_id": 10, "logro": False}
    schema = AlertaResultadoBodySchema(**data)
    assert schema.proveedor_id == 10
    assert schema.logro is False


def test_alerta_resultado_body_schema_invalid_missing_proveedor():
    data = {"logro": True}
    with pytest.raises(ValidationError):
        AlertaResultadoBodySchema(**data)
