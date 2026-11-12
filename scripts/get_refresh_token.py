from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]

flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)

# authorization_prompt_message forces the script to print the link in your terminal
creds = flow.run_local_server(
    port=0,
    access_type="offline",
    prompt="consent",
    authorization_prompt_message="Please visit this URL to authorize this application: {url}",
)

print("\n--- Copy these to your .env ---")
print(f"GOOGLE_CLIENT_ID={creds.client_id}")
print(f"GOOGLE_CLIENT_SECRET={creds.client_secret}")
print(f"GOOGLE_REFRESH_TOKEN={creds.refresh_token}")