#!/bin/bash

# Script para aplicar el fix de scroll-snap a todos los archivos HTML de textos

for file in $(find /workspace/textos -name "*.html"); do
  echo "Procesando: $file"
  
  # Verificar si ya tiene el nuevo CSS de body
  if grep -q "position: fixed; width: 100%;" "$file"; then
    echo "  -> Ya tiene el fix, saltando..."
    continue
  fi
  
  # Reemplazar CSS del body
  sed -i 's/html { scroll-behavior: smooth; }/html, body {\n      margin: 0;\n      padding: 0;\n      overflow: hidden;\n      height: 100%;\n      position: fixed;\n      width: 100%;\n    }/' "$file"
  
  # Reemplazar CSS de reading-scroll
  sed -i 's/\.reading-scroll {[^}]*}/.reading-scroll {\n      position: fixed;\n      top: 44px;\n      left: 0;\n      right: 0;\n      bottom: 0;\n      overflow-y: scroll;\n      scroll-snap-type: y mandatory;\n      -webkit-overflow-scrolling: touch;\n      overscroll-behavior-y: contain;\n    }/' "$file"
done

echo "Listo!"
