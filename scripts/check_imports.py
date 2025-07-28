#!/usr/bin/env python3
"""
Import path consistency checker for FormMonkey project.
Ensures all imports use the correct shared module paths.
"""

import os
import re
import sys
from pathlib import Path

def check_import_consistency():
    """Check for consistent import paths across the project."""
    
    project_root = Path(__file__).parent.parent
    backend_dir = project_root / "backend"
    
    issues = []
    
    # Check for old backend.shared imports
    for py_file in backend_dir.rglob("*.py"):
        with open(py_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check for problematic import patterns
        problematic_patterns = [
            r'from backend\.shared',
            r'import backend\.shared',
            r'from \.shared',  # relative imports to shared
        ]
        
        for pattern in problematic_patterns:
            matches = re.findall(pattern, content)
            if matches:
                issues.append(f"{py_file}: Found problematic import pattern: {pattern}")
    
    # Check for correct shared imports
    correct_imports = []
    for py_file in backend_dir.rglob("*.py"):
        with open(py_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find correct import patterns
        correct_patterns = [
            r'from shared\.',
            r'import shared\.',
        ]
        
        for pattern in correct_patterns:
            matches = re.findall(pattern, content)
            if matches:
                correct_imports.append(f"{py_file}: ✅ Using correct shared import")
    
    return issues, correct_imports

if __name__ == "__main__":
    issues, correct = check_import_consistency()
    
    print("🔍 Import Path Consistency Check")
    print("=" * 40)
    
    if issues:
        print(f"❌ Found {len(issues)} issues:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("✅ No import path issues found!")
    
    print(f"\n✅ Found {len(correct)} correct imports")
    
    sys.exit(1 if issues else 0)
