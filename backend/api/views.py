# from django.shortcuts import render
from rest_framework.decorators import api_view
# Create your views here.
from django.http import JsonResponse

from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['GET'])
def hello(request):
    return JsonResponse({"message": "Hello from Django API!"})

# Signup
@api_view(["POST"])
def signup(request):
    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=name, email=email, password=password)
    return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)


# Signin
@api_view(["POST"])
def signin(request):
    email = request.data.get("email")
    password = request.data.get("password")

    user = authenticate(request, email=email, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)