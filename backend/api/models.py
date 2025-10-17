from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    video_credits = models.IntegerField(default=0)

class DropboxUpload(models.Model):
    userId = models.IntegerField(default=0)
    username = models.CharField(max_length=100)
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    dropbox_path = models.CharField(max_length=255, null=True, blank=True)
    dropbox_link = models.URLField(null=True, blank=True)
    transcription_job_id = models.CharField(max_length=255, null=True, blank=True)
    transcript_text = models.TextField(null=True, blank=True)
    keywords = models.TextField(null=True, blank=True)
    stock_clips = models.TextField(null=True, blank=True)
    zip_link = models.URLField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} - {self.file_name}"