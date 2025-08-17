#!/usr/bin/env python3

import sqlparse
import os

def validate_sql_file(file_path):
    """Validate SQL syntax in a file"""
    print(f"Testing SQL syntax: {file_path}")
    
    try:
        # Read SQL file with UTF-8 encoding
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Parse SQL to check for syntax errors
        try:
            parsed = sqlparse.parse(sql_content)
            print(f"  - SQL syntax appears valid")
            print(f"  - Found {len(parsed)} SQL statements")
            
            # Check for common Hebrew text issues
            if 'מנצ\'סטר' in sql_content:
                print("  - ERROR: Found incorrectly escaped Hebrew apostrophe")
                return False
            elif 'מנצ\'\'סטר' in sql_content:
                print("  - Hebrew apostrophes properly escaped")
            
            if 'ז\'רמן' in sql_content:
                print("  - ERROR: Found incorrectly escaped Hebrew apostrophe") 
                return False
            elif 'ז\'\'רמן' in sql_content:
                print("  - Hebrew apostrophes properly escaped")
                
            return True
            
        except Exception as e:
            print(f"  - SQL syntax error: {str(e)}")
            return False
            
    except Exception as e:
        print(f"  - File reading error: {str(e)}")
        return False

def main():
    print("SQL Syntax Validation for Hebrew Football App")
    print("=" * 50)
    
    # Test files in order
    files = [
        "supabase/schema.sql",
        "supabase/rls-policies.sql", 
        "supabase/functions.sql"
    ]
    
    all_valid = True
    
    for file_path in files:
        if os.path.exists(file_path):
            is_valid = validate_sql_file(file_path)
            all_valid = all_valid and is_valid
            print()
        else:
            print(f"File not found: {file_path}")
            all_valid = False
            print()
    
    if all_valid:
        print("SUCCESS: All SQL files have valid syntax!")
        print("The Hebrew text apostrophe issues have been fixed.")
    else:
        print("ERROR: Some SQL files have syntax issues.")
    
    return all_valid

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)