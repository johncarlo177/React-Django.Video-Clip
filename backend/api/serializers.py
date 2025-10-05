from rest_framework import serializers
from .models import DropboxUpload

class DropboxUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = DropboxUpload
        fields = '__all__' 
