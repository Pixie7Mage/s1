from django.http import HttpResponse

from rest_framework import status

from rest_framework.response import Response

from rest_framework.views import APIView



from .report_generator import generate_report

from .serializers import ClientPayloadSerializer





class ClientCreateView(APIView):

    """Accept client profile JSON, validate, and echo back (no persistence)."""



    def post(self, request):

        serializer = ClientPayloadSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)





class GenerateReportView(APIView):

    """Accept full client JSON and return a Word document download."""



    def post(self, request):

        serializer = ClientPayloadSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data



        doc_bytes = generate_report(data)

        name = data.get("personal", {}).get("full_name", "Financial").replace(" ", "_")

        filename = f"{name}_Report.docx"



        response = HttpResponse(

            doc_bytes,

            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        )

        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        return response


