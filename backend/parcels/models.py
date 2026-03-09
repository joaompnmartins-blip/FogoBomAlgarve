# parcels/models.py
from django.contrib.gis.db import models

class FireParcel (models.Model):
    name = models.CharField(max_length=100)
    concelho = models.CharField(max_length=100, blank=True, default='')
    vegetation_type = models.CharField(
        max_length=20, 
        choices=[('matos', 'Matos'), ('pinhal', 'Pinhal'), ('eucaliptal', 'Eucaliptal'), ('misto', 'Misto')],
        default='matos'
    )
    infrastructure = models.CharField(
        max_length=50, 
        choices=[('non_existing', 'Inexistente'), ('existing','Operacional'), ('req_maintenance','Manutenção necessária'), ('no_info','Sem informação')],
        default='no_info'
    )
    owner_info = models.CharField(
        max_length=20,
        choices=[('yes', 'Sim'),('no','Não')],
        default='no'
    )
    resp_name =models.CharField(max_length=100,blank=True, null=True)
    resp_email = models.EmailField(blank=True, null=True)
    geometry = models.PolygonField(srid=4326)
    area_ha = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_burned_date = models.DateField(null=True, blank=True)
