from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import FinanceIntelligence

class InsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        intelligence = FinanceIntelligence(request.user)
        insights = intelligence.get_insights()
        return Response(insights)
