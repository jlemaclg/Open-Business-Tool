#!/usr/bin/env python3
"""Protege una demo con contraseña cifrando el HTML (D13 · demos de cliente en repo público).

Uso:
  python3 tools/proteger-demo.py _private/<slug>/index.html demos/<slug>/index.html --password "frase secreta"
  python3 tools/proteger-demo.py _private/<slug>/index.html demos/<slug>/index.html   (pide la contraseña sin eco)

Qué hace
  · Deriva una clave AES-256 de la contraseña con PBKDF2-HMAC-SHA256 (600.000 iteraciones, sal aleatoria).
  · Cifra el HTML completo con AES-GCM (IV aleatorio, etiqueta de autenticidad).
  · Escribe una página de desbloqueo (identidad MBC) que lleva dentro sal + IV + contenido cifrado en base64
    y descifra en el navegador con WebCrypto. Sin backend, sin build, sin dependencias en el sitio.

Qué NO hace
  · No oculta que la demo existe (la URL y el tamaño del fichero son visibles).
  · No protege contra quien tenga la contraseña: compártela fuera de banda y rota regenerando el fichero.

Reglas del repo
  · La versión en claro vive en `_private/` (ignorado por git). NUNCA se commitea: el historial es público y permanente.
  · En `demos/catalog.js` la entrada lleva `acceso: 'protegida'`; título y resumen del catálogo se ven sin contraseña,
    así que también deben ser anonimizados.

Requisito en el equipo que ejecuta el script: `pip install cryptography` (solo para cifrar; el sitio no lo necesita).
"""
import argparse, base64, getpass, os, secrets, sys, hashlib

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:  # pragma: no cover
    sys.exit("Falta el paquete 'cryptography' (pip install cryptography). Solo hace falta para cifrar; el sitio no lo usa.")

ITER = 600_000

UNLOCK_TEMPLATE = r"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<meta name="demo:acceso" content="protegida">
<title>__TITULO__ · acceso restringido</title>
<link rel="icon" href="../../assets/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{--navy:#003478;--navy-deep:#001F4D;--accent:#147AFF;--accent-soft:#E7F1FF;--bg:#F3F5F9;--panel:#fff;--text:#101B33;--text-dim:rgba(16,27,51,.62);--text-faint:rgba(16,27,51,.42);--line:rgba(16,27,51,.12);--bad:#D93025;--sans:'Montserrat','Segoe UI',Arial,Helvetica,sans-serif;}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{min-height:100%;background:var(--bg);color:var(--text);font-family:var(--sans)}
  body{display:flex;align-items:center;justify-content:center;padding:24px}
  .card{width:100%;max-width:460px;background:var(--panel);border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,31,77,.08)}
  .head{background:linear-gradient(135deg,var(--navy),var(--navy-deep));color:#fff;padding:22px 26px;display:flex;align-items:center;justify-content:space-between;gap:16px;position:relative;overflow:hidden}
  .head::after{content:"";position:absolute;right:-50px;top:-70px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(20,122,255,.55),transparent 70%)}
  .head>*{position:relative;z-index:1}
  .eyebrow{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.7);margin-bottom:6px}
  .head h1{font-size:15px;font-weight:800;line-height:1.3}
  .mbc{height:22px;width:auto;flex:0 0 auto}
  .body{padding:24px 26px 22px}
  .body p{font-size:12.5px;line-height:1.55;color:var(--text-dim);margin-bottom:16px}
  label{display:block;font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--text-faint);margin-bottom:6px}
  .row{display:flex;gap:8px}
  input{flex:1;font-family:var(--sans);font-size:14px;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;outline:none;color:var(--text)}
  input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(20,122,255,.18)}
  button{font-family:var(--sans);font-size:13px;font-weight:700;color:#fff;background:var(--navy);border:none;border-radius:10px;padding:10px 16px;cursor:pointer}
  button:hover{background:var(--navy-deep)} button[disabled]{opacity:.6;cursor:wait}
  .err{display:none;margin-top:10px;font-size:12px;font-weight:600;color:var(--bad)}
  .foot{margin-top:18px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:10.5px;color:var(--text-faint);line-height:1.4}
  .foot a{color:var(--navy);font-weight:700;text-decoration:none}
</style>
</head>
<body>
<div class="card">
  <div class="head">
    <div><div class="eyebrow">Demo de cliente · acceso con contraseña</div><h1>__TITULO__</h1></div>
    <svg class="mbc" viewBox="0 0 3860.17 856.07" xmlns="http://www.w3.org/2000/svg" fill="#fff" role="img" aria-label="MBC"><path d="M418.06 0 626.07 488.07 701.67 492.29 910.14 0 1328.21 0 1328.21 856.07 1100.17 856.07 1100.17 192.01 1048.6 192.48 830.28 684.35 496.03 682.1 280.46 194.49 228.04 192.01 228.04 856.07 0 856.07 0 0 418.06 0Z"/><path d="M3139.84 201 3860.17 201 3860.17 0 3148.64 0C3148.13 0 3147.62 0.01 3147.11 0.02 2906.1 1.66 2724.88 176.94 2724.88 428.03 2724.88 679.12 2905.48 852.72 3144.73 856.01 3145.07 856.01 3145.42 856.02 3145.76 856.03 3145.9 856.03 3146.05 856.03 3146.19 856.03 3147 856.04 3147.81 856.06 3148.63 856.06L3860.16 856.06 3860.16 655.06 3141.03 655.06C3033.15 651.52 2947.27 567.26 2947.27 428.02 2947.27 288.78 3029.79 204.6 3139.84 200.98Z"/><path d="M1485.95 0 2304.74 0C2482.07 0 2588.46 94.17 2588.46 231.14 2588.46 311.86 2550.55 384.01 2463.72 407.24L2463.72 426.81C2560.33 441.49 2614.14 508.75 2614.14 618.81 2614.14 765.56 2516.3 856.06 2334.08 856.06L1485.94 856.06 1485.94 0ZM2292.51 335.09C2345.1 335.09 2373.23 305.74 2373.23 259.27 2373.23 212.8 2345.1 183.45 2292.51 183.45L1706.08 183.45 1706.08 335.1 2292.51 335.1ZM2299.84 672.62C2357.32 672.62 2386.67 646.94 2386.67 595.57 2386.67 544.2 2357.32 518.52 2299.84 518.52L1706.08 518.52 1706.08 672.61 2299.84 672.61Z"/></svg>
  </div>
  <div class="body">
    <p>Material de propuesta con uso restringido. El contenido está cifrado en el servidor y se descifra en tu navegador con la contraseña que te ha facilitado el equipo.</p>
    <form id="f" autocomplete="off">
      <label for="pw">Contraseña</label>
      <div class="row"><input id="pw" type="password" autofocus autocomplete="current-password" required><button id="b" type="submit">Abrir demo</button></div>
      <div class="err" id="err">Contraseña incorrecta.</div>
    </form>
    <div class="foot"><span>Demo autocontenida · datos ficticios<br>© Minsait — Indra Sistemas, S.A.</span><a href="../index.html">← Biblioteca de demos</a></div>
  </div>
</div>
<script>
(function(){
  var SALT='__SALT__', IV='__IV__', DATA='__DATA__', ITER=__ITER__;
  var b64=function(s){ var b=atob(s), a=new Uint8Array(b.length); for(var i=0;i<b.length;i++) a[i]=b.charCodeAt(i); return a; };
  var f=document.getElementById('f'), pw=document.getElementById('pw'), btn=document.getElementById('b'), err=document.getElementById('err');
  f.addEventListener('submit', function(e){
    e.preventDefault(); err.style.display='none'; btn.disabled=true; btn.textContent='Descifrando…';
    var enc=new TextEncoder();
    crypto.subtle.importKey('raw', enc.encode(pw.value), 'PBKDF2', false, ['deriveKey'])
      .then(function(k){ return crypto.subtle.deriveKey({name:'PBKDF2', salt:b64(SALT), iterations:ITER, hash:'SHA-256'}, k, {name:'AES-GCM', length:256}, false, ['decrypt']); })
      .then(function(key){ return crypto.subtle.decrypt({name:'AES-GCM', iv:b64(IV)}, key, b64(DATA)); })
      .then(function(buf){ var html=new TextDecoder().decode(buf); document.open(); document.write(html); document.close(); })
      .catch(function(){ err.style.display='block'; btn.disabled=false; btn.textContent='Abrir demo'; pw.select(); });
  });
})();
</script>
</body>
</html>
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('origen', help='HTML en claro (normalmente bajo _private/, ignorado por git)')
    ap.add_argument('destino', help='HTML cifrado a escribir (normalmente demos/<slug>/index.html)')
    ap.add_argument('--password', help='contraseña; si se omite se pide sin eco')
    ap.add_argument('--titulo', help='título público de la página de desbloqueo (anonimizado); por defecto el <title> del origen')
    a = ap.parse_args()

    html = open(a.origen, encoding='utf-8').read()
    pw = a.password or getpass.getpass('Contraseña: ')
    if len(pw) < 10:
        sys.exit('La contraseña debe tener al menos 10 caracteres.')
    titulo = a.titulo
    if not titulo:
        import re
        m = re.search(r'<title>(.*?)</title>', html, re.S | re.I)
        titulo = (m.group(1).strip() if m else 'Demo')

    salt = secrets.token_bytes(16)
    iv = secrets.token_bytes(12)
    key = hashlib.pbkdf2_hmac('sha256', pw.encode('utf-8'), salt, ITER, dklen=32)
    ct = AESGCM(key).encrypt(iv, html.encode('utf-8'), None)

    esc = lambda s: s.replace('&', '&amp;').replace('<', '&lt;')
    out = (UNLOCK_TEMPLATE
           .replace('__TITULO__', esc(titulo))
           .replace('__SALT__', base64.b64encode(salt).decode())
           .replace('__IV__', base64.b64encode(iv).decode())
           .replace('__DATA__', base64.b64encode(ct).decode())
           .replace('__ITER__', str(ITER)))
    os.makedirs(os.path.dirname(os.path.abspath(a.destino)), exist_ok=True)
    open(a.destino, 'w', encoding='utf-8', newline='\n').write(out)
    print(f'ok · {a.destino} ({len(out)//1024} KB cifrados) · título público: {titulo}')
    print('Recuerda: el fichero de origen no se commitea; comparte la contraseña fuera de banda.')


if __name__ == '__main__':
    main()
