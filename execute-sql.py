#!/usr/bin/env python3

import requests
import json
import time

# Supabase configuration
SUPABASE_URL = "https://alnvqylgaqutitlvahia.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbnZxeWxnYXF1dGl0bHZhaGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQxODIxNCwiZXhwIjoyMDcwOTk0MjE0fQ.SrhgfljiDBdZcgBV1P3cdbcHFOm96hRTkzj_GEuBYa4"

def execute_sql_file(file_path, description):
    print(f"\n🚀 Executing: {description}")
    print(f"📄 File: {file_path}")
    
    try:
        # Read SQL file
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Split into statements (simple approach)
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip() and not stmt.strip().startswith('--')]
        
        print(f"📝 Found {len(statements)} SQL statements")
        
        success_count = 0
        
        for i, statement in enumerate(statements):
            if not statement:
                continue
                
            print(f"   Executing statement {i+1}/{len(statements)}...")
            
            # Try multiple API endpoints
            endpoints = [
                f"{SUPABASE_URL}/rest/v1/rpc/sql",
                f"{SUPABASE_URL}/rest/v1/rpc/query", 
                f"{SUPABASE_URL}/sql"
            ]
            
            executed = False
            for endpoint in endpoints:
                try:
                    headers = {
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
                        "apikey": SERVICE_ROLE_KEY
                    }
                    
                    # Try different payload formats
                    payloads = [
                        {"query": statement},
                        {"sql": statement},
                        statement
                    ]
                    
                    for payload in payloads:
                        if isinstance(payload, str):
                            headers["Content-Type"] = "application/sql"
                            response = requests.post(endpoint, headers=headers, data=payload)
                        else:
                            headers["Content-Type"] = "application/json"
                            response = requests.post(endpoint, headers=headers, json=payload)
                        
                        if response.status_code == 200:
                            success_count += 1
                            executed = True
                            break
                    
                    if executed:
                        break
                        
                except Exception as e:
                    continue
            
            if not executed:
                print(f"   ⚠️  Statement {i+1} could not be executed via API")
            
            # Small delay between statements
            time.sleep(0.2)
        
        print(f"✅ {description} completed: {success_count}/{len(statements)} statements executed")
        return success_count > 0
        
    except Exception as e:
        print(f"❌ Error executing {description}: {str(e)}")
        return False

def main():
    print("🎯 Football Prediction League - Backend Deployment")
    print("=================================================")
    
    # Deploy files in order
    files = [
        ("supabase/schema.sql", "Database Schema Creation"),
        ("supabase/rls-policies.sql", "Row Level Security Policies"), 
        ("supabase/functions.sql", "Database Functions and Procedures")
    ]
    
    total_success = 0
    
    for file_path, description in files:
        if execute_sql_file(file_path, description):
            total_success += 1
    
    print(f"\n📊 Deployment Summary: {total_success}/{len(files)} files processed")
    
    if total_success > 0:
        print("\n✅ Some SQL files were processed successfully!")
    else:
        print("\n⚠️  API deployment was not successful.")
    
    print("\n📝 Manual deployment recommended:")
    print("1. Copy contents of each SQL file")
    print("2. Paste into Supabase SQL Editor")
    print("3. Execute in order: schema.sql → rls-policies.sql → functions.sql")
    print("\n🌐 Supabase Dashboard: https://supabase.com/dashboard/project/alnvqylgaqutitlvahia")

if __name__ == "__main__":
    main()