#!/usr/bin/env python3
"""
FormMonkey Project Analyzer
Generates a comprehensive analysis of the project structure and codebase
"""

import os
import ast
import json
from pathlib import Path
from typing import Dict, List, Set, Any
import re

class ProjectAnalyzer:
    def __init__(self, root_path: str = "."):
        self.root_path = Path(root_path)
        self.analysis = {
            "structure": {},
            "dependencies": {},
            "api_endpoints": [],
            "components": [],
            "todos": [],
            "issues": [],
            "type_usage": {},
            "integration_points": [],
            "ml_implementations": {},
        }
        
    def analyze(self):
        """Run complete project analysis"""
        print("🔍 Analyzing FormMonkey project...")
        
        # 1. Map project structure
        self.analysis["structure"] = self.map_structure()
        
        # 2. Analyze Python files
        self.analyze_python_files()
        
        # 3. Analyze TypeScript/React files
        self.analyze_typescript_files()
        
        # 4. Find dependencies
        self.analyze_dependencies()
        
        # 5. Extract TODOs and FIXMEs
        self.extract_todos()
        
        # 6. Generate summary report
        return self.generate_report()
    
    def map_structure(self) -> Dict[str, Any]:
        """Create a tree structure of the project"""
        def build_tree(path: Path, ignore_patterns: Set[str] = {".git", "__pycache__", "node_modules", ".pytest_cache"}):
            tree = {}
            
            for item in sorted(path.iterdir()):
                if item.name in ignore_patterns:
                    continue
                    
                if item.is_dir():
                    tree[f"📁 {item.name}"] = build_tree(item, ignore_patterns)
                else:
                    # Include file size and type
                    size = item.stat().st_size
                    tree[f"📄 {item.name}"] = f"{size:,} bytes"
            
            return tree
        
        return build_tree(self.root_path)
    
    def analyze_python_files(self):
        """Analyze all Python files for patterns and issues"""
        python_files = list(self.root_path.rglob("*.py"))
        
        for file_path in python_files:
            if "__pycache__" in str(file_path):
                continue
                
            try:
                content = file_path.read_text()
                
                # Parse AST
                tree = ast.parse(content)
                
                # Extract API endpoints (FastAPI)
                if "routers" in str(file_path):
                    self.extract_api_endpoints(tree, file_path)
                
                # Find ML-related functions
                if "ml_integration" in str(file_path) or "ai" in str(file_path):
                    self.extract_ml_functions(tree, file_path)
                
                # Analyze type usage
                self.analyze_type_imports(content, file_path)
                
                # Find integration points
                self.find_integration_points(content, file_path)
                
            except Exception as e:
                self.analysis["issues"].append({
                    "file": str(file_path),
                    "error": f"Failed to parse: {str(e)}"
                })
    
    def analyze_typescript_files(self):
        """Analyze TypeScript/TSX files"""
        ts_files = list(self.root_path.rglob("*.ts")) + list(self.root_path.rglob("*.tsx"))
        
        for file_path in ts_files:
            if "node_modules" in str(file_path):
                continue
                
            try:
                content = file_path.read_text()
                
                # Extract React components
                if file_path.suffix == ".tsx":
                    components = re.findall(r'(?:export\s+)?(?:const|function)\s+(\w+).*?:\s*(?:React\.)?FC', content)
                    self.analysis["components"].extend([{
                        "name": comp,
                        "file": str(file_path.relative_to(self.root_path))
                    } for comp in components])
                
                # Analyze imports
                self.analyze_type_imports(content, file_path)
                
            except Exception as e:
                self.analysis["issues"].append({
                    "file": str(file_path),
                    "error": f"Failed to read: {str(e)}"
                })
    
    def extract_api_endpoints(self, tree: ast.AST, file_path: Path):
        """Extract FastAPI endpoints from router files"""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                for decorator in node.decorator_list:
                    if isinstance(decorator, ast.Attribute):
                        if decorator.attr in ["get", "post", "put", "delete", "patch"]:
                            # Extract route path
                            if decorator.value and hasattr(decorator.value, 'id'):
                                endpoint = {
                                    "method": decorator.attr.upper(),
                                    "function": node.name,
                                    "file": str(file_path.relative_to(self.root_path))
                                }
                                self.analysis["api_endpoints"].append(endpoint)
    
    def extract_ml_functions(self, tree: ast.AST, file_path: Path):
        """Extract ML-related functions"""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                if any(keyword in node.name.lower() for keyword in ["predict", "ml", "ai", "model"]):
                    self.analysis["ml_implementations"][node.name] = {
                        "file": str(file_path.relative_to(self.root_path)),
                        "async": isinstance(node, ast.AsyncFunctionDef),
                        "args": [arg.arg for arg in node.args.args]
                    }
    
    def analyze_type_imports(self, content: str, file_path: Path):
        """Track type imports and usage"""
        # Python imports
        if file_path.suffix == ".py":
            imports = re.findall(r'from shared\.types import (.+)', content)
            types_used = []
            for imp in imports:
                types_used.extend([t.strip() for t in imp.split(",")])
        
        # TypeScript imports
        else:
            imports = re.findall(r'import.*?{(.+?)}.*?from.*?[\'"].*?types.*?[\'"]', content)
            types_used = []
            for imp in imports:
                types_used.extend([t.strip() for t in imp.split(",")])
        
        if types_used:
            rel_path = str(file_path.relative_to(self.root_path))
            self.analysis["type_usage"][rel_path] = types_used
    
    def find_integration_points(self, content: str, file_path: Path):
        """Find integration points between modules"""
        # Look for cross-module imports
        if "import" in content:
            if "ml_integration" in content and "ai_assistance" in str(file_path):
                self.analysis["integration_points"].append({
                    "type": "ML → AI Service",
                    "file": str(file_path.relative_to(self.root_path))
                })
            elif "master_profile" in content and "ai_assistance" in str(file_path):
                self.analysis["integration_points"].append({
                    "type": "Profile → AI Service",
                    "file": str(file_path.relative_to(self.root_path))
                })
    
    def analyze_dependencies(self):
        """Analyze project dependencies"""
        # Backend dependencies
        req_file = self.root_path / "backend" / "requirements.txt"
        if req_file.exists():
            self.analysis["dependencies"]["backend"] = req_file.read_text().strip().split("\n")
        
        # Frontend dependencies
        package_json = self.root_path / "frontend" / "package.json"
        if package_json.exists():
            pkg_data = json.loads(package_json.read_text())
            self.analysis["dependencies"]["frontend"] = {
                "dependencies": list(pkg_data.get("dependencies", {}).keys()),
                "devDependencies": list(pkg_data.get("devDependencies", {}).keys())
            }
    
    def extract_todos(self):
        """Extract all TODOs and FIXMEs from codebase"""
        patterns = [r'#\s*TODO:?\s*(.+)', r'//\s*TODO:?\s*(.+)', r'#\s*FIXME:?\s*(.+)', r'//\s*FIXME:?\s*(.+)']
        
        for file_path in self.root_path.rglob("*"):
            if file_path.is_file() and file_path.suffix in [".py", ".ts", ".tsx", ".js"]:
                try:
                    content = file_path.read_text()
                    for pattern in patterns:
                        matches = re.findall(pattern, content, re.IGNORECASE)
                        for match in matches:
                            self.analysis["todos"].append({
                                "file": str(file_path.relative_to(self.root_path)),
                                "todo": match.strip()
                            })
                except:
                    pass
    
    def generate_report(self) -> str:
        """Generate comprehensive analysis report"""
        report = []
        report.append("# 📊 FormMonkey Project Analysis Report\n")
        report.append(f"Generated from: {self.root_path.absolute()}\n")
        
        # Project structure summary
        report.append("## 📁 Project Structure\n")
        report.append("```")
        report.append(self._format_tree(self.analysis["structure"]))
        report.append("```\n")
        
        # API Endpoints
        if self.analysis["api_endpoints"]:
            report.append("## 🌐 API Endpoints\n")
            for endpoint in self.analysis["api_endpoints"]:
                report.append(f"- **{endpoint['method']}** `{endpoint['function']}` in {endpoint['file']}")
            report.append("")
        
        # ML Implementations
        if self.analysis["ml_implementations"]:
            report.append("## 🤖 ML/AI Functions\n")
            for func, details in self.analysis["ml_implementations"].items():
                async_tag = "async " if details["async"] else ""
                report.append(f"- **{async_tag}{func}**({', '.join(details['args'])}) in {details['file']}")
            report.append("")
        
        # Type Usage Analysis
        if self.analysis["type_usage"]:
            report.append("## 📝 Type Usage\n")
            type_counts = {}
            for file, types in self.analysis["type_usage"].items():
                for t in types:
                    type_counts[t] = type_counts.get(t, 0) + 1
            
            sorted_types = sorted(type_counts.items(), key=lambda x: x[1], reverse=True)
            for type_name, count in sorted_types[:10]:
                report.append(f"- **{type_name}**: used in {count} files")
            report.append("")
        
        # Integration Points
        if self.analysis["integration_points"]:
            report.append("## 🔗 Integration Points\n")
            for point in self.analysis["integration_points"]:
                report.append(f"- {point['type']} in {point['file']}")
            report.append("")
        
        # TODOs
        if self.analysis["todos"]:
            report.append("## 📋 TODOs and FIXMEs\n")
            for todo in self.analysis["todos"][:10]:  # First 10
                report.append(f"- {todo['file']}: {todo['todo']}")
            if len(self.analysis["todos"]) > 10:
                report.append(f"- ... and {len(self.analysis['todos']) - 10} more")
            report.append("")
        
        # Issues
        if self.analysis["issues"]:
            report.append("## ⚠️ Issues Found\n")
            for issue in self.analysis["issues"]:
                report.append(f"- {issue['file']}: {issue['error']}")
            report.append("")
        
        # Dependencies Summary
        if self.analysis["dependencies"]:
            report.append("## 📦 Dependencies\n")
            if "backend" in self.analysis["dependencies"]:
                report.append(f"**Backend**: {len(self.analysis['dependencies']['backend'])} packages")
            if "frontend" in self.analysis["dependencies"]:
                fe_deps = self.analysis["dependencies"]["frontend"]
                report.append(f"**Frontend**: {len(fe_deps.get('dependencies', []))} runtime, {len(fe_deps.get('devDependencies', []))} dev")
            report.append("")
        
        # Save detailed analysis
        analysis_file = self.root_path / "project_analysis.json"
        with open(analysis_file, "w") as f:
            json.dump(self.analysis, f, indent=2, default=str)
        report.append(f"\n💾 Detailed analysis saved to: {analysis_file}")
        
        return "\n".join(report)
    
    def _format_tree(self, tree: Dict, indent: int = 0) -> str:
        """Format tree structure for display"""
        lines = []
        for key, value in tree.items():
            lines.append("  " * indent + key)
            if isinstance(value, dict):
                lines.append(self._format_tree(value, indent + 1))
            elif isinstance(value, str):
                lines.append("  " * (indent + 1) + f"└─ {value}")
        return "\n".join(lines)


if __name__ == "__main__":
    # Run analysis
    analyzer = ProjectAnalyzer(".")  # Assumes running from project root
    report = analyzer.analyze()
    
    # Save report
    with open("PROJECT_ANALYSIS.md", "w") as f:
        f.write(report)
    
    print(report)
    print("\n✅ Analysis complete! See PROJECT_ANALYSIS.md for the full report.")