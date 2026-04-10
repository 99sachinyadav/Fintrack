import json

from django.contrib.auth.models import User
from django.test import Client, TestCase


class SignupViewTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)

    def test_signup_creates_user(self):
        home_response = self.client.get("/")
        csrf_token = home_response.cookies["csrftoken"].value

        response = self.client.post(
            "/api/signup/",
            data=json.dumps(
                {
                    "username": "newuser",
                    "email": "newuser@example.com",
                    "password": "strongpass123",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_signup_rejects_duplicate_username(self):
        User.objects.create_user(
            username="existing",
            email="existing@example.com",
            password="strongpass123",
        )
        home_response = self.client.get("/")
        csrf_token = home_response.cookies["csrftoken"].value

        response = self.client.post(
            "/api/signup/",
            data=json.dumps(
                {
                    "username": "existing",
                    "email": "different@example.com",
                    "password": "strongpass123",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {"error": "Username already exists."},
        )
