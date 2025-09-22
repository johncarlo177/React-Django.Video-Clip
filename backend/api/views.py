# from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse

@api_view(['GET'])
def hello(request):
    return JsonResponse({"message": "Hello from Django API!"})