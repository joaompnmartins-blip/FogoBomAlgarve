# gradio_app/services.py
import json
from django.contrib.gis.geos import GEOSGeometry
from parcels.models import FireParcel
from operatives.models import FireOperative
from fire_actions.models import FireAction

def create_parcel(name, vegetation, risk, geometry_json):
    geom = GEOSGeometry(json.dumps(geometry_json), srid=4326)
    return FireParcel.objects.create(
        name=name,
        vegetation_type=vegetation,
        risk_level=risk,
        geometry=geom
    )

def list_operatives():
    return [
        (op.id, str(op)) for op in FireOperative.objects.filter(status="Active")
    ]

def create_fire_action(parcel_id, operative_ids, burn_date, objective):
    action = FireAction.objects.create(
        parcel_id=parcel_id,
        burn_date=burn_date,
        objective=objective
    )
    action.operatives.set(operative_ids)
    return action
