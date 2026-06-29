from django.urls import path

from .views import ClientCreateView, GenerateReportView

urlpatterns = [
    path("client/", ClientCreateView.as_view(), name="client-create"),
    path("generate-report/", GenerateReportView.as_view(), name="generate-report"),
]
