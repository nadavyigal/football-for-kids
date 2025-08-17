#!/usr/bin/env python3

import os
import re

def validate_sql_file(file_path):
    """Validate SQL syntax focusing on Hebrew text escaping"""
    print(f"Validating: {file_path}")
    
    try:
        # Read SQL file with UTF-8 encoding
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        issues = []
        
        # Check for incorrectly escaped Hebrew apostrophes
        if re.search(r'מנצ\'[^\']\s*סטר', content):
            issues.append("Found incorrectly escaped apostrophe in Manchester City (מנצ'סטר)")
        
        if re.search(r'ז\'[^\']\s*רמן', content):
            issues.append("Found incorrectly escaped apostrophe in PSG (ז'רמן)")
        
        # Check for properly escaped apostrophes
        manchester_fixed = re.search(r'מנצ\'\'סטר', content)
        psg_fixed = re.search(r'ז\'\'רמן', content)
        
        # Basic SQL syntax checks
        if content.count('(') != content.count(')'):
            issues.append("Unmatched parentheses")
        
        if content.count("'") % 2 != 0:
            issues.append("Unmatched single quotes")
        
        # Check for valid Hebrew encoding
        try:
            content.encode('utf-8')
        except UnicodeEncodeError:
            issues.append("Hebrew text encoding issues")
        
        if issues:
            print(f"  ISSUES FOUND:")
            for issue in issues:
                print(f"    - {issue}")
            return False
        else:
            print(f"  VALID: No syntax issues found")
            if manchester_fixed or psg_fixed:
                print(f"  - Hebrew apostrophes properly escaped")
            return True
            
    except Exception as e:
        print(f"  ERROR: {str(e)}")
        return False

def main():
    print("SQL Validation - Hebrew Football Prediction App")
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
    
    print("=" * 50)
    if all_valid:
        print("SUCCESS: All SQL files validated successfully!")
        print("Ready for deployment to Supabase.")
    else:
        print("ERROR: Validation failed for some files.")
    
    return all_valid

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)