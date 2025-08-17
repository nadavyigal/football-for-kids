#!/usr/bin/env python3

import requests
import json

# Supabase configuration
SUPABASE_URL = "https://alnvqylgaqutitlvahia.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbnZxeWxnYXF1dGl0bHZhaGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQxODIxNCwiZXhwIjoyMDcwOTk0MjE0fQ.SrhgfljiDBdZcgBV1P3cdbcHFOm96hRTkzj_GEuBYa4"

def test_connection():
    """Test basic connection to Supabase"""
    print("Testing Supabase connection...")
    
    try:
        # Test basic REST API connection
        headers = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}"
        }
        
        response = requests.get(f"{SUPABASE_URL}/rest/v1/", headers=headers)
        
        if response.status_code == 200:
            print("  - REST API connection: SUCCESS")
        else:
            print(f"  - REST API connection: FAILED (status: {response.status_code})")
            return False
        
        # Test if we can query the leagues table (if it exists)
        response = requests.get(f"{SUPABASE_URL}/rest/v1/leagues", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"  - Database query: SUCCESS")
            print(f"  - Found {len(data)} leagues in database")
            
            # Check for Hebrew text
            for league in data:
                if any(ord(char) >= 0x05D0 and ord(char) <= 0x05EA for char in league.get('name', '')):
                    print(f"  - Hebrew text verified: {league['name']}")
                    break
        elif response.status_code == 404:
            print("  - Database query: Tables not yet created (normal for fresh deployment)")
        else:
            print(f"  - Database query: FAILED (status: {response.status_code})")
            
        return True
        
    except Exception as e:
        print(f"  - Connection test failed: {str(e)}")
        return False

def main():
    print("Supabase Connection Test")
    print("=" * 30)
    
    if test_connection():
        print("\nConnection test completed successfully!")
        print("Your Supabase instance is ready for SQL deployment.")
    else:
        print("\nConnection test failed.")
        print("Please check your Supabase configuration.")

if __name__ == "__main__":
    main()