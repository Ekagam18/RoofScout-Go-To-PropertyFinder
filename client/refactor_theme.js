const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');

    // Skip files that don't have theme state definitions
    if (!content.includes("localStorage.getItem('rs-theme')") &&
        !content.includes('localStorage.getItem("rs-theme")') &&
        !filepath.includes("Navbar.jsx")) {
        return;
    }

    if (content.includes('useTheme') && content.includes('hooks/useTheme')) {
        return;
    }

    // Add import
    const importStatement = "import { useTheme } from '../hooks/useTheme';\n";
    if (!content.includes("hooks/useTheme")) {
        content = content.replace(/(import.*?;?\n)/, `$1${importStatement}`);
    }

    // Replace State
    const pattern1 = /const \[theme, setTheme\] = useState\(\(\) => \{[^}]*localStorage\.getItem\(['"]rs-theme['"]\)[^}]*\}\);/gs;
    content = content.replace(pattern1, 'const [theme, setTheme] = useTheme();');

    const pattern1_short = /const \[theme, setTheme\] = useState\(\(\) => localStorage\.getItem\(['"]rs-theme['"]\) \|\| ['"]light['"]\);/g;
    const pattern1_short2 = /const \[theme, setTheme\] = useState\(\(\) => {\s*try { return localStorage\.getItem\(['"]rs-theme['"]\) \|\| ['"]light['"]; } catch { return ['"]light['"]; }\s*}\);/g;
    content = content.replace(pattern1_short, 'const [theme, setTheme] = useTheme();');
    content = content.replace(pattern1_short2, 'const [theme, setTheme] = useTheme();');

    const pattern_other = /const \[theme, setTheme\] = useState\(\s*\(\) => localStorage\.getItem\(['"]rs-theme['"]\) \|\| ['"]light['"]\s*\);/g;
    content = content.replace(pattern_other, 'const [theme, setTheme] = useTheme();');

    // Replace useEffect manipulating classes
    const pattern2 = /useEffect\(\(\) => \{\s*const root = document\.documentElement;\s*theme === ['"]dark['"] \? root\.classList\.add\(['"]dark['"]\) : root\.classList\.remove\(['"]dark['"]\);\s*(?:try \{ localStorage\.setItem\(['"]rs-theme['"], theme\); \} catch \{ \})?\s*\}, \[theme\]\);/gs;
    content = content.replace(pattern2, '');

    // Replace straight local storage setter useEffect
    const pattern3 = /useEffect\(\(\) => \{\s*try \{ localStorage\.setItem\(['"]rs-theme['"], theme\); \} catch \{\}\s*\}, \[theme\]\);/gs;
    const pattern3b = /useEffect\(\(\) => \{\s*try \{ localStorage\.setItem\(['"]rs-theme['"], theme\); \} catch \{ \}\s*\}, \[theme\]\);/gs;
    const pattern3c = /useEffect\(\(\) => \{\s*localStorage\.setItem\(['"]rs-theme['"], theme\);\s*\}, \[theme\]\);/gs;

    content = content.replace(pattern3, '');
    content = content.replace(pattern3b, '');
    content = content.replace(pattern3c, '');

    if (filepath.includes("Navbar.jsx")) {
        const navPattern1 = /const \[darkMode, setDarkMode\] = useState\(\(\) => \{[\s\S]*?\}\);/;
        const navRepl1 = "const [theme, setTheme] = useTheme();\n  const darkMode = theme === 'dark';\n  const setDarkMode = (val) => setTheme(val ? 'dark' : 'light');";
        content = content.replace(navPattern1, navRepl1);

        const navPattern2 = /useEffect\(\(\) => \{\s*if \(darkMode\)[\s\S]*?\}\}, \[darkMode\]\);/;
        content = content.replace(navPattern2, '');
    }

    fs.writeFileSync(filepath, content, 'utf-8');
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        let filepath = path.join(dir, file);
        let stat = fs.statSync(filepath);
        if (stat && stat.isDirectory()) {
            walk(filepath);
        } else if (file.endsWith('.jsx')) {
            processFile(filepath);
        }
    });
}

walk(srcDir);
console.log("Done refactoring theme");
