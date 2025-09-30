"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from api.views import hello
from django.conf import settings
from django.conf.urls.static import static
from api.views import signup, signin, refresh_token, logout_view, admin_signin, FileUploadView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hello/', hello),
    path("api/signup/", signup),
    path("api/signin/", signin),
    path("api/admin-signin/", admin_signin),
    path("api/token/refresh/", refresh_token),
    path("api/logout/", logout_view),
    path("upload/", FileUploadView.as_view(), name="file-upload"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
