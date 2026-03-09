from django.db import models
from parcels.models import FireParcel
from operatives.models import Operative


class FireAction(models.Model):
    """
    Pre-plan for a controlled burn action.
    Represents the planning stage: which parcel(s), who is responsible,
    indicative date, pre-fire notes and photos.
    """
    name            = models.CharField(max_length=200)
    responsible     = models.CharField(max_length=200, blank=True, default='')
    scheduled_date  = models.DateField()
    notes           = models.TextField(blank=True, default='')
    parcels         = models.ManyToManyField(FireParcel, related_name='fire_actions')
    created_at      = models.DateTimeField(auto_now_add=True)

    # Set to 'Pre-Plano' on create, updated to 'Executada' when a BurningPlan is saved.
    STATUS_CHOICES = [
        ('Pre-Plano', 'Pré-Plano'),
        ('Executada',  'Executada'),
    ]
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='Pre-Plano'
    )

    # Legacy field — kept so existing data is not lost
    execution_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.scheduled_date})"


class BurningPlan(models.Model):
    """
    Plano Operacional de Queima — the full operational record
    of an executed controlled burn, linked to a FireAction pre-plan.
    One pre-plan -> at most one BurningPlan (OneToOne).
    """

    # ── Link to pre-plan ──────────────────────────────────────────────────
    pre_plan       = models.OneToOneField(
        FireAction, on_delete=models.PROTECT, related_name='burningplan'
    )
    execution_date = models.DateField()

    # ── Team ─────────────────────────────────────────────────────────────
    operatives = models.ManyToManyField(
        Operative, related_name='burning_plans', blank=True
    )
    num_men    = models.IntegerField(null=True, blank=True)

    # Vehicles stored as JSON: {"VFCI": 2, "VFCM": 1, "Outro": "1 ATV"}
    vehicles   = models.TextField(blank=True, default='{}')

    # ── Problems identified (semicolon-separated) ─────────────────────────
    problems   = models.TextField(blank=True, default='')

    # ── Fuel moisture ─────────────────────────────────────────────────────
    fuel_superficial = models.CharField(max_length=20, blank=True, default='')
    fuel_manta_f     = models.CharField(max_length=20, blank=True, default='')
    fuel_manta_h     = models.CharField(max_length=20, blank=True, default='')

    # ── Meteorology ───────────────────────────────────────────────────────
    weather_state       = models.CharField(max_length=80, blank=True, default='')
    wind_speed_beaufort = models.CharField(max_length=10, blank=True, default='')
    wind_speed_kmh      = models.CharField(max_length=20, blank=True, default='')
    wind_direction      = models.CharField(max_length=20, blank=True, default='')

    FIRE_CONDUCT_CHOICES = [
        ('1', '1 - Contra o vento / contra o declive'),
        ('2', '2 - Por linhas sucessivas'),
        ('3', '3 - Perimetral'),
        ('4', '4 - De flanco'),
        ('5', '5 - Outro'),
    ]
    fire_conduct       = models.CharField(
        max_length=2, choices=FIRE_CONDUCT_CHOICES, blank=True, default=''
    )
    fire_conduct_other = models.TextField(blank=True, default='')

    # ── Effects & efficiency ──────────────────────────────────────────────
    burn_effects    = models.TextField(blank=True, default='')
    burn_efficiency = models.TextField(blank=True, default='')

    # ── Extra notes ───────────────────────────────────────────────────────
    notes      = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Plano de Queima — {self.pre_plan.name} ({self.execution_date})"
