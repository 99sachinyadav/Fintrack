import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fintech.settings')
django.setup()

import cloudinary
import cloudinary.uploader
import sys

print("Cloud Name:", os.environ.get("CLOUDINARY_CLOUD_NAME"))
print("API Key:", os.environ.get("CLOUDINARY_API_KEY"))
print("API Secret:", os.environ.get("CLOUDINARY_API_SECRET"))

try:
    with open("test_upload.txt", "w") as f:
        f.write("Hello cloudinary")
    res = cloudinary.uploader.upload("test_upload.txt", resource_type="raw")
    print("SUCCESS!", res.get("secure_url"))
except Exception as e:
    print("UPLOAD FAILED EXCEPTION:", e)
    sys.exit(1)
