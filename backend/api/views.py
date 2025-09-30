from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken, TokenError, AccessToken
from django.contrib.auth import get_user_model
from django.conf import settings
import requests
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import UploadedFileSerializer

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hello(request):
    return JsonResponse({"message": "Hello from Django API!"})

# Signup
@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    print(request)
    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=name, email=email, password=password)
    return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)


# Signin
@api_view(["POST"])
@permission_classes([AllowAny])
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

# Admin Signin
@api_view(["POST"])
@permission_classes([AllowAny])
def admin_signin(request):
    email = request.data.get("email")
    password = request.data.get("password")

    # Hardcoded admin credentials
    ADMIN_EMAIL = "admin@example.com"
    ADMIN_PASSWORD = "admin123"

    if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
        # Create a simple access token (no refresh)
        token = AccessToken()
        token["role"] = "admin"   # custom claim to mark admin

        return Response({
            "access": str(token),
        }, status=status.HTTP_200_OK)

    return Response({"error": "Invalid admin credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# Refresh token
@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):
    refresh_token = request.data.get("refresh")

    if not refresh_token:
        return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        refresh = RefreshToken(refresh_token)

        # Decode user id from the token
        user_id = refresh["user_id"]
        user = User.objects.get(id=user_id)

        new_refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(new_refresh) 
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except TokenError as e:
        return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout the user by blacklisting their refresh token.
    Expects a payload: { "refresh": "<refresh_token>" }
    """
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()  # requires 'rest_framework_simplejwt.token_blacklist' in INSTALLED_APPS
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

class FileUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        print("User:", request.user)
        print("Data:", request.data)
        serializer = UploadedFileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "File uploaded successfully", "file": serializer.data})
        print("Errors:", serializer.errors)
        return Response(serializer.errors, status=400)

