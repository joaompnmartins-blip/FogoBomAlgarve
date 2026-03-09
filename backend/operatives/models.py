from django.db import models

class Operative(models.Model):
    name = models.CharField(max_length=100)
    nif   = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    certification_level = models.CharField(max_length=50)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
