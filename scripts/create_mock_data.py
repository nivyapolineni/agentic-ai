import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

def create_mock_passport():
    # Create a blank white image
    width, height = 800, 500
    image = Image.new('RGB', (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)

    # Try to use a default font
    try:
        font = ImageFont.load_default()
    except:
        font = None

    # Add some mock text
    draw.text((50, 50), "PASSPORT", fill=(0, 0, 0), font=font)
    draw.text((50, 100), "Surname: DOE", fill=(0, 0, 0), font=font)
    draw.text((50, 130), "Given Names: JOHN", fill=(0, 0, 0), font=font)
    draw.text((50, 160), "Nationality: CAN", fill=(0, 0, 0), font=font)
    draw.text((50, 190), "Date of Birth: 01 JAN 1980", fill=(0, 0, 0), font=font)
    draw.text((50, 220), "Passport No: G12345678", fill=(0, 0, 0), font=font)

    # Add MRZ-like lines at the bottom
    mrz_line1 = "P<CANDOE<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    mrz_line2 = "G123456780CAN8001014M3101012<<<<<<<<<<<<<<02"

    draw.text((50, 400), mrz_line1, fill=(0, 0, 0), font=font)
    draw.text((50, 430), mrz_line2, fill=(0, 0, 0), font=font)

    os.makedirs('tests/assets', exist_ok=True)
    image.save('tests/assets/mock_passport.png')
    print("Mock passport created at tests/assets/mock_passport.png")

if __name__ == "__main__":
    create_mock_passport()
