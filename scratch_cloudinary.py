from fintech.settings import *
import cloudinary
import cloudinary.uploader
import sys

try:
    # A dummy pixel or something, wait we just want to see if cloudinary throws config errors
    print("Cloudinary account:", cloudinary.config().cloud_name)
    sys.exit(0)
except Exception as e:
    print("Error:", e)
    sys.exit(1)
