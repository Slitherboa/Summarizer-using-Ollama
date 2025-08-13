from typing import Any, Dict

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status

from .serializers import UploadSerializer, AskSerializer
from .pdf_utils import extract_text_from_pdf
from .llama import summarize_text, answer_question


@csrf_exempt
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def upload_view(request):
    serializer = UploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    text = serializer.validated_data.get('text') or ''
    file = request.FILES.get('file')

    if file and not text:
        extracted = extract_text_from_pdf(file)
        if not extracted:
            return Response({'error': 'Failed to extract text from PDF.'}, status=status.HTTP_400_BAD_REQUEST)
        text = extracted

    if not text:
        return Response({'error': 'Provide either a PDF file or non-empty text.'}, status=status.HTTP_400_BAD_REQUEST)

    # Store in session for Q&A
    request.session['last_document_text'] = text

    try:
        summary = summarize_text(text)
    except Exception as e:
        return Response({'error': f'LLM error: {e}'}, status=status.HTTP_502_BAD_GATEWAY)

    return Response({'summary': summary})


@csrf_exempt
@api_view(['POST'])
@parser_classes([JSONParser])
def ask_view(request):
    serializer = AskSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    context_text = request.session.get('last_document_text')
    if not context_text:
        return Response({'error': 'No document in session. Upload text or PDF first.'}, status=status.HTTP_400_BAD_REQUEST)

    question = serializer.validated_data['question']
    try:
        answer = answer_question(context_text, question)
    except Exception as e:
        return Response({'error': f'LLM error: {e}'}, status=status.HTTP_502_BAD_GATEWAY)

    return Response({'answer': answer})
