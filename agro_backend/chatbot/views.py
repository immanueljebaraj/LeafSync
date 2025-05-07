from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from groq import Groq
import os
from dotenv import load_dotenv
load_dotenv() 


@api_view(['POST'])
def ask_groq(request):
    try:
        question = request.data.get('question')
        if not question:
            return Response({'error': 'No question provided'}, status=400)
        
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        chat_response = client.chat.completions.create(
            messages=[
                {"role": "user", "content": question}
            ],
            model="llama-3.3-70b-versatile"
        )

        return Response({'response': chat_response.choices[0].message.content})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


#endpoints
#Groq: http://localhost:8000/api/groq/ask-groq/