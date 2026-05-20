import os
import re

src_dir = r"c:\Users\HP\Downloads\Be-RoofScout\Be-RoofScout\roofscout_react\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip files that don't have theme state definitions
    if "localStorage.getItem('rs-theme')" not in content and 'localStorage.getItem("rs-theme")' not in content and "setTheme(" not in content and "Navbar.jsx" not in filepath:
        return

    # Check if we already imported useTheme
    if "useTheme" in content and "hooks/useTheme" in content:
        return

    # Add the import
    import_statement = "import { useTheme } from '../hooks/useTheme';\n"
    if "hooks/useTheme" not in content:
        # Replace the first import with import + useTheme
        content = re.sub(r'^(import.*?;\n)', r'\1' + import_statement, content, count=1)

    # 1. Replace rs-theme useState block in pages
    # Matches: const [theme, setTheme] = useState(() => { try { return localStorage.getItem('rs-theme') || 'light'; } catch { return 'light'; } });
    # And its variants with newlines
    pattern1 = r'const \[theme, setTheme\] = useState\(\(\) => \{[^}]*localStorage\.getItem\([\'"]rs-theme[\'"]\)[^}]*\}\);'
    content = re.sub(pattern1, 'const [theme, setTheme] = useTheme();', content, flags=re.DOTALL)
    
    # Also the concise variant: const [theme, setTheme] = useState(() => localStorage.getItem('rs-theme') || 'light');
    pattern1_short = r'const \[theme, setTheme\] = useState\(\(\) => localStorage\.getItem\([\'"]rs-theme[\'"]\) \|\| [\'"]light[\'"]\);'
    content = re.sub(pattern1_short, 'const [theme, setTheme] = useTheme();', content)

    # 2. Remove useEffect that adds/removes 'dark' class manually
    pattern2 = r'useEffect\(\(\) => \{\s*const root = document\.documentElement;\s*theme === \'?dark\'? \? root\.classList\.add\(\'?dark\'?\) : root\.classList\.remove\(\'?dark\'?\);\s*(?:try \{ localStorage\.setItem\([\'"]rs-theme[\'"], theme\); \} catch \{ \})?\s*\}, \[theme\]\);'
    content = re.sub(pattern2, '', content, flags=re.DOTALL)
    
    # Also remove useEffect setting local storage manually if it was separate
    pattern3 = r'useEffect\(\(\) => \{\s*try \{ localStorage\.setItem\([\'"]rs-theme[\'"], theme\); \} catch \{ \}\s*\}, \[theme\]\);'
    content = re.sub(pattern3, '', content, flags=re.DOTALL)

    # Navbar specifically
    if "Navbar.jsx" in filepath:
        # Replace its darkMode state
        nav_pattern1 = r'const \[darkMode, setDarkMode\] = useState\(\(\) => \{.*?\}\);'
        nav_repl1 = "const [theme, setTheme] = useTheme();\n  const darkMode = theme === 'dark';\n  const setDarkMode = (val) => setTheme(val ? 'dark' : 'light');"
        content = re.sub(nav_pattern1, nav_repl1, content, flags=re.DOTALL)

        # Remove its useEffect
        nav_pattern2 = r'useEffect\(\(\) => \{\s*if \(darkMode\).*?\}\}, \[darkMode\]\);'
        content = re.sub(nav_pattern2, '', content, flags=re.DOTALL)

        if "import { useTheme }" not in content:
           content = re.sub(r'^(import.*?;\n)', r'\1import { useTheme } from "../hooks/useTheme";\n', content, count=1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Done refactoring theme")
