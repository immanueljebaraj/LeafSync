from django.shortcuts import render

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .model import predict, model, transform, classes

@csrf_exempt
def predict_insect(request):
    """
    Django view to handle image uploads and perform inference using the pre-trained model.
    """
    if request.method == 'POST':
        # Check if a file is provided in the request
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file provided'}, status=400)

        # Get the uploaded file
        file = request.FILES['file']
        image_path = 'temp_image.jpg'  # Temporary file to save the uploaded image

        # Save the uploaded file temporarily
        with open(image_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        try:
            # Perform inference using the model
            class_name = predict(image_path, model, transform, classes)
            return JsonResponse({'class': class_name})
        except Exception as e:
            # Handle any errors during inference
            return JsonResponse({'error': str(e)}, status=500)
        finally:
            # Clean up the temporary file
            import os
            if os.path.exists(image_path):
                os.remove(image_path)
    else:
        # Return an error for invalid request methods
        return JsonResponse({'error': 'Invalid request method'}, status=405)
