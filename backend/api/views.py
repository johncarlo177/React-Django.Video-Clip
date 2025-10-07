import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, TokenError, AccessToken
from django.contrib.auth import get_user_model
from openai import OpenAI
import dropbox
import json
from django.conf import settings
from .serializers import DropboxUploadSerializer
from .models import User, DropboxUpload

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
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_dropbox_token(request):
    # Initialize Dropbox with refresh token
    dbx = dropbox.Dropbox(
        oauth2_refresh_token=settings.DROPBOX_REFRESH_TOKEN,
        app_key=settings.DROPBOX_APP_KEY,
        app_secret=settings.DROPBOX_APP_SECRET,
    )

    # Force refresh by making a lightweight call
    account = dbx.users_get_current_account()
    short_lived_token = dbx._oauth2_access_token  # internal property holding the active token

    return JsonResponse({'access_token': short_lived_token})

@api_view(["POST"])
@permission_classes([IsAuthenticated])  # or AllowAny if no login required
def save_upload_info(request):
    data = request.data
    user = request.user
    DropboxUpload.objects.create(
        userId=user.id,
        username=user.username,
        file_name=data.get("file_name"),
        dropbox_path=data.get("dropbox_path"),
        dropbox_link=data.get("dropbox_link"),
    )
    return Response({"message": "Upload info saved successfully"}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def list_videos(request):
    videos = DropboxUpload.objects.all().order_by('-uploaded_at')
    serializer = DropboxUploadSerializer(videos, many=True)
    return Response(serializer.data)

import dropbox
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import DropboxUpload

@api_view(['DELETE'])
def delete_video(request, video_id):
    try:
        video = DropboxUpload.objects.get(id=video_id)

        # Initialize Dropbox client
        dbx = dropbox.Dropbox(
            oauth2_refresh_token=settings.DROPBOX_REFRESH_TOKEN,
            app_key=settings.DROPBOX_APP_KEY,
            app_secret=settings.DROPBOX_APP_SECRET
        )

        # Delete file from Dropbox
        if video.dropbox_path:
            try:
                dbx.files_delete_v2(video.dropbox_path)
            except dropbox.exceptions.ApiError as e:
                # File may not exist, log error but continue
                print("Dropbox delete error:", e)

        # Delete from database
        video.delete()

        return Response({"message": "Video deleted successfully."})

    except DropboxUpload.DoesNotExist:
        return Response({"error": "Video not found."}, status=404)
 

@api_view(['POST'])
def transcribe_video(request, video_id):
    import requests
    from django.conf import settings

    try:
        video = DropboxUpload.objects.get(id=video_id)

        # Use Dropbox preview link
        video_url = video.dropbox_link
        if "?dl=1" in video_url:
            video_url = video_url.replace("?dl=1", "?dl=0")
        elif not video_url.endswith("?dl=0"):
            video_url += "?dl=0"

        headers = {
            "Authorization": f"Bearer {settings.HAPPY_SCRIBE_API_KEY}",
            "Content-Type": "application/json",
        }

        data = {
            "transcription": {
                "name": f"Transcription for {video.file_name}",
                "language": "en-GB",  # adjust if needed
                "tmp_url": video_url,
                "is_subtitle": False,
                # Optional: include if your account requires it
                "organization_id": settings.HAPPY_SCRIBE_ORGANIZATION_ID,
                # "folder_id": "521",
                # "tags": ["To do", "video_transcription"],
            }
        }

        response = requests.post(
            "https://www.happyscribe.com/api/v1/transcriptions",
            headers=headers,
            json=data
        )

        if response.status_code in [200, 201]:
            transcription_job = response.json()
            video.transcription_job_id = transcription_job["id"]
            video.save()
            return Response({"message": "Transcription started", "job": transcription_job})
        else:
            return Response({"error": response.text}, status=response.status_code)

    except DropboxUpload.DoesNotExist:
        return Response({"error": "Video not found"}, status=404)

@api_view(['GET'])
def check_transcription_status(request, job_id):
    headers = {
        "Authorization": f"Bearer {settings.HAPPY_SCRIBE_API_KEY}",
        "Content-Type": "application/json",
    }

    # Get transcription job info
    res = requests.get(
        f"https://www.happyscribe.com/api/v1/transcriptions/{job_id}",
        headers=headers
    )

    if res.status_code != 200:
        return Response({"error": res.text}, status=res.status_code)

    job_data = res.json()
    state = job_data.get("state")

    transcript_text = None
    download_url = job_data.get("_links", {}).get("self", {}).get("downloadUrl")

    if state in ["done", "automatic_done"] and download_url:
        # Download transcript file
        txt_res = requests.get(download_url)
        if txt_res.status_code == 200:
            transcript_json = json.loads(txt_res.text)
            words = []
            for speaker_block in transcript_json:
                for word_obj in speaker_block.get("words", []):
                    words.append(word_obj["text"])
            # Join all words into a single string
            transcript_text = "".join(words).replace(" ,", ",").replace(" .", ".").strip()

            video = DropboxUpload.objects.filter(transcription_job_id=job_id).first()
            if video:
                video.transcript_text = transcript_text
                video.save(update_fields=["transcript_text"])
                print(f"✅ Transcript saved for video: {video.file_name}")
    return Response({
        "state": state,
        "transcript": transcript_text
    })



def extract_keywords(transcript_text):
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = f"""
    Extract 10-15 key topics and keywords from this transcript:
    ---
    {transcript_text[:8000]}  # truncate if long
    """
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
