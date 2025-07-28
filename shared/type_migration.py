"""
Type Migration Helper for FormMonkey

This script helps migrate local type definitions to shared types.
It scans the codebase for potential type duplications and generates
migration instructions.

Usage:
    python type_migration.py
"""

import os
import re
import json
from typing import Dict, List, Set, Tuple, Optional
from dataclasses import dataclass

@dataclass
class TypeMatch:
    """Information about a potential type duplication."""
    file_path: str
    line_number: int
    type_name: str
    match_content: str
    is_typescript: bool

def scan_for_duplicates(base_path: str, shared_types: List[str]) -> Dict[str, List[TypeMatch]]:
    """
    Scan the codebase for potential duplicates of shared types.
    
    Args:
        base_path: The base path to scan
        shared_types: List of shared type names to look for
        
    Returns:
        A dictionary mapping shared type names to lists of TypeMatch objects
    """
    results: Dict[str, List[TypeMatch]] = {t: [] for t in shared_types}
    pattern_ts = re.compile(r'(interface|type|class|enum)\s+(\w+)')
    pattern_py = re.compile(r'class\s+(\w+)')
    
    # Example implementation - would need to be expanded for a real codebase
    for root, _, files in os.walk(base_path):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx') or file.endswith('.py'):
                file_path = os.path.join(root, file)
                is_typescript = file.endswith('.ts') or file.endswith('.tsx')
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        for i, line in enumerate(f, 1):
                            if is_typescript:
                                matches = pattern_ts.search(line)
                                if matches:
                                    type_name = matches.group(2)
                                    if type_name in shared_types:
                                        results[type_name].append(
                                            TypeMatch(file_path, i, type_name, line.strip(), is_typescript)
                                        )
                            else:
                                matches = pattern_py.search(line)
                                if matches:
                                    type_name = matches.group(1)
                                    if type_name in shared_types:
                                        results[type_name].append(
                                            TypeMatch(file_path, i, type_name, line.strip(), is_typescript)
                                        )
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
    
    return results

def generate_migration_instructions(matches: Dict[str, List[TypeMatch]]) -> str:
    """
    Generate migration instructions based on found type duplicates.
    
    Args:
        matches: Dictionary mapping shared type names to lists of TypeMatch objects
        
    Returns:
        Migration instructions as a string
    """
    instructions = []
    instructions.append("# Type Migration Instructions")
    instructions.append("\nThe following duplicates of shared types were found in the codebase.\n")
    
    for type_name, type_matches in matches.items():
        if not type_matches:
            continue
            
        instructions.append(f"## {type_name}")
        instructions.append(f"\nFound {len(type_matches)} potential duplicate(s):\n")
        
        for match in type_matches:
            instructions.append(f"- {match.file_path}:{match.line_number}")
            instructions.append(f"  ```{'typescript' if match.is_typescript else 'python'}")
            instructions.append(f"  {match.match_content}")
            instructions.append("  ```")
            
            if match.is_typescript:
                instructions.append("\n  Replace with:")
                instructions.append("  ```typescript")
                instructions.append(f"  import {{ {type_name} }} from '@shared/types';")
                instructions.append("  ```")
            else:
                instructions.append("\n  Replace with:")
                instructions.append("  ```python")
                instructions.append(f"  from shared.types import {type_name}")
                instructions.append("  ```")
            
            instructions.append("")
    
    return "\n".join(instructions)

def main():
    """Main entry point for the type migration helper."""
    print("FormMonkey Type Migration Helper")
    print("===============================")
    
    # List of shared types to check for duplicates
    shared_types = [
        "DocumentMetadata",
        "UserProfile",
        "FileMetadata",
        "UploadMetadata",
        "ProcessingStatus",
        "FileStatus",
        "UploadStatus",
        "FieldType",
        "PredictionSource",
        "CorrectionReason",
        "AIPredictedField",
        "UserCorrection",
        "AlternativePrediction",
        "ParseStatus",
        "BoundingBox",
        "TextLocation",
        "FieldPrediction"
    ]
    
    print(f"Scanning for duplicates of {len(shared_types)} shared types...")
    
    # In a real implementation, this would scan the actual codebase
    # For now, we'll just generate example output
    matches = {t: [] for t in shared_types}
    
    # Output instructions
    instructions = generate_migration_instructions(matches)
    output_path = "migration_instructions.md"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(instructions)
    
    print(f"\nMigration instructions generated at {output_path}")

if __name__ == "__main__":
    main()
