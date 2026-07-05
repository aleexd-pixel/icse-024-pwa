#!/usr/bin/env python3
"""
Script para aplicar el fix de scroll-snap tipo TikTok a todos los archivos HTML de textos.
Reemplaza el CSS y JavaScript para que funcione como la implementación especificada.
"""

import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Reemplazar CSS del body - bloquear scroll del body
    old_body_css = r'html \{ scroll-behavior: smooth; \}\s*body \{'
    new_body_css = '''html, body { 
      margin: 0; 
      padding: 0; 
      overflow: hidden; 
      height: 100%; 
      position: fixed; 
      width: 100%; 
    }
    body {'''
    
    if re.search(old_body_css, content):
        content = re.sub(old_body_css, new_body_css, content)
        print(f"  [CSS] Body actualizado")
    
    # 2. Reemplazar CSS de .reading-scroll
    old_scroll_css = r'\.reading-scroll \{\s*height:[^;]+;[^}]+\}'
    new_scroll_css = '''.reading-scroll {
      position: fixed;
      top: 44px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: scroll;
      scroll-snap-type: y mandatory;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
    }'''
    
    if re.search(old_scroll_css, content):
        content = re.sub(old_scroll_css, new_scroll_css, content, flags=re.DOTALL)
        print(f"  [CSS] reading-scroll actualizado")
    
    # 3. Reemplazar CSS de .reading-chunk
    old_chunk_css = r'\.reading-chunk \{\s*scroll-snap-align:[^;]+;[^}]+\}'
    new_chunk_css = '''.reading-chunk {
      scroll-snap-align: start;
      scroll-snap-stop: always;
      width: 100%;
      padding: 1.25rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      overflow: hidden;
      position: relative;
    }'''
    
    if re.search(old_chunk_css, content):
        content = re.sub(old_chunk_css, new_chunk_css, content, flags=re.DOTALL)
        print(f"  [CSS] reading-chunk actualizado")
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Procesar todos los archivos HTML en /workspace/textos
total = 0
modified = 0

for root, dirs, files in os.walk('/workspace/textos'):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            total += 1
            print(f"Procesando: {filepath}")
            if process_file(filepath):
                modified += 1

print(f"\n=== RESUMEN ===")
print(f"Total archivos: {total}")
print(f"Modificados: {modified}")
print(f"Sin cambios: {total - modified}")
