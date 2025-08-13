from rest_framework import serializers


class UploadSerializer(serializers.Serializer):
    text = serializers.CharField(required=False, allow_blank=True)
    file = serializers.FileField(required=False)


class AskSerializer(serializers.Serializer):
    question = serializers.CharField()
