#!/usr/bin/env python3
"""Comprueba una demo antes de pasarla a revisión/publicación.

Uso:  python3 check_demo.py <ruta/a/index.html> [--repo <ruta-al-repo>] [--strict]

Revisa lo que suele fallar al publicar en un repo público servido como estático:
  · placeholders {{…}} sin sustituir
  · fuente Montserrat, viewport, lang="es", <title>
  · logo MBC (vector oficial) en cabecera
  · nota de datos ficticios / fines pedagógicos
  · scripts y hojas externas: solo hosts permitidos (fonts.googleapis, cdnjs, jsdelivr, unpkg con aviso)
  · nada por http://; nada de localhost; sin rutas absolutas C:\\ o /Users/
  · tamaño del fichero
  · si se pasa --repo: la demo existe en demos/catalog.js y su carpeta coincide con `ruta`
Sale con código 1 si hay errores (con --strict, también si hay avisos).
"""
import argparse, os, re, sys

ALLOWED_HOSTS = ('fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net')
WARN_HOSTS = ('unpkg.com',)
LOGO_SIGNATURE = 'viewBox="0 0 3860.17 856.07"'
FICTICIO_RE = re.compile(r'fictici|ilustrativ|fines pedag', re.I)
LIMIT_BYTES = 2_000_000


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--repo')
    ap.add_argument('--strict', action='store_true')
    a = ap.parse_args()
    path = os.path.abspath(a.html)
    if not os.path.isfile(path):
        sys.exit(f'No existe {path}')
    html = open(path, encoding='utf-8', errors='replace').read()
    errors, warns, ok = [], [], []

    def check(cond, msg_ok, msg_fail=None, level='error'):
        (ok if cond else (errors if level == 'error' else warns)).append(msg_ok if cond else (msg_fail or msg_ok))

    ph = sorted(set(re.findall(r'\{\{[A-Z_]+\}\}', html)))
    check(not ph, 'Sin placeholders pendientes', 'Placeholders sin sustituir: ' + ', '.join(ph))
    check('<html lang="es"' in html, 'lang="es" en <html>', 'Falta lang="es" en <html>')
    check('name="viewport"' in html, 'meta viewport presente', 'Falta <meta name="viewport">')
    t = re.search(r'<title>(.*?)</title>', html, re.S)
    check(bool(t and t.group(1).strip()), '<title> con contenido', '<title> vacío o ausente')
    check('Montserrat' in html, 'Fuente Montserrat referenciada', 'No se referencia Montserrat (¿prototipo con marca propia? entonces ignora)', 'warn')
    check(LOGO_SIGNATURE in html, 'Logo MBC oficial (vector) presente', 'No aparece el logo MBC oficial (usa el vector de references/design-system.md)', 'warn')
    check(bool(FICTICIO_RE.search(html)), 'Nota de datos ficticios / fines pedagógicos presente', 'Falta la nota de datos ficticios / fines pedagógicos (pie de página)')
    ext = re.findall(r'(?:src|href)="(https?://[^"]+)"', html)
    insecure = [u for u in ext if u.startswith('http://')]
    check(not insecure, 'Sin recursos cargados por http://', 'Recursos por http:// (usa https): ' + ', '.join(insecure))
    check('localhost' not in html and '127.0.0.1' not in html, 'Sin referencias a localhost', 'Aparece localhost/127.0.0.1 (¿resto de un build de desarrollo?)', 'warn')
    check(not re.search(r'[A-Z]:\\\\|/Users/|/home/[a-z]+/', html), 'Sin rutas locales absolutas', 'Hay rutas locales absolutas (C:\\, /Users/, /home/)')

    bad = [u for u in ext if u.startswith('https://') and not any(h in u for h in ALLOWED_HOSTS + WARN_HOSTS)]
    warn_hosts = [u for u in ext if any(h in u for h in WARN_HOSTS)]
    check(not bad, 'Recursos externos dentro de la lista permitida', 'Recursos externos fuera de la lista permitida: ' + ', '.join(bad))
    check(not warn_hosts, 'Sin dependencias en unpkg', 'Dependencia en unpkg (sin red cae a fallback; mejor empaquetar): ' + ', '.join(warn_hosts), 'warn')

    size = os.path.getsize(path)
    check(size < LIMIT_BYTES, f'Tamaño {size/1024:.0f} KB (< {LIMIT_BYTES//1_000_000} MB)', f'Tamaño {size/1024:.0f} KB — supera {LIMIT_BYTES//1_000_000} MB, revisa assets embebidos', 'warn')

    meta = dict(re.findall(r'<meta name="demo:(\w+)" content="([^"]*)"', html))
    if meta:
        ok.append('Metadatos demo: ' + ', '.join(f'{k}={v}' for k, v in meta.items()))
    else:
        warns.append('Sin metadatos <meta name="demo:tipo|slug|version"> (opcionales, útiles para el catálogo)')

    if a.repo:
        cat = os.path.join(os.path.abspath(a.repo), 'demos', 'catalog.js')
        slug = os.path.basename(os.path.dirname(path))
        if not os.path.isfile(cat):
            errors.append('No existe demos/catalog.js en el repo')
        else:
            txt = open(cat, encoding='utf-8').read()
            m = re.search(r"slug:\s*'%s'.*?ruta:\s*'([^']+)'" % re.escape(slug), txt, re.S)
            if not m:
                errors.append(f'La demo {slug} no está registrada en demos/catalog.js')
            else:
                ok.append(f'Registrada en catalog.js (ruta {m.group(1)})')
                est = re.search(r"slug:\s*'%s'.*?estado:\s*'(\w+)'" % re.escape(slug), txt, re.S)
                if est and est.group(1) == 'borrador':
                    warns.append("estado: 'borrador' en el catálogo — cámbialo a 'revision' o 'publicada' antes del PR")

    for m in ok: print('  ✓', m)
    for m in warns: print('  !', m)
    for m in errors: print('  ✗', m)
    print(f'\n{len(ok)} ok · {len(warns)} avisos · {len(errors)} errores')
    sys.exit(1 if errors or (a.strict and warns) else 0)


if __name__ == '__main__':
    main()
