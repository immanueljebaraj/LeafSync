import os
import torch
import cv2
import numpy as np
import albumentations as A
from albumentations.pytorch.transforms import ToTensorV2
import timm
import pandas as pd
import torch.nn as nn

# Define the device (GPU or CPU)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Define the relative path to classes.txt
CLASSES_FILE = os.path.join(os.path.dirname(__file__), 'InsectDataset', 'classes.txt')
print("Classes file path:", CLASSES_FILE)  # Debug statement

# Define the relative path to vit_best.pth
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'InsectDataset', 'vit_best.pth')


# Load class labels
def load_classes(file_path):
    with open(file_path, 'r') as f:
        label, name = [], []
        for line in f.readlines():
            label.append(int(line.split()[0]))
            name.append(' '.join(line.split()[1:]))
    return pd.DataFrame([label, name]).T.rename(columns={0: 'label', 1: 'name'})

# Load the trained model
def load_model(model_path, num_classes=102):
    model = InsectModel(num_classes=num_classes)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()
    return model

# Preprocess the image
def preprocess_image(image_path, transform):
    image = cv2.imread(image_path, cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).astype(np.float32)
    image /= 255.0
    image = transform(image=image)['image']
    image = image.unsqueeze(0).to(device)  # Add batch dimension
    return image

# Perform inference
def predict(image_path, model, transform, classes):
    image = preprocess_image(image_path, transform)
    with torch.no_grad():
        output = model(image)
        pred = output.softmax(1).argmax(1).item()
    return classes.loc[pred, 'name']

# Define the InsectModel class
class InsectModel(nn.Module):
    def __init__(self, num_classes):
        super(InsectModel, self).__init__()
        self.num_classes = num_classes
        self.model = timm.create_model('vit_base_patch16_224', pretrained=True, num_classes=num_classes)

    def forward(self, image):
        return self.model(image)

# Define the transforms for inference
def get_valid_transform():
    return A.Compose([
        A.Resize(224, 224),
        ToTensorV2()
    ])


classes = load_classes(CLASSES_FILE)
model = load_model(MODEL_PATH)
transform = get_valid_transform()