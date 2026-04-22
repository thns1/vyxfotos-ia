import json
import base64
import os

def try_decode(content):
    for enc in ['utf-16', 'utf-8-sig', 'utf-8', 'latin-1']:
        try:
            return content.decode(enc)
        except:
            continue
    return None

try:
    with open('resultado_fidelidade.json', 'rb') as f:
        content = f.read()
    
    text = try_decode(content)
    if not text:
        raise Exception("Não foi possível decodificar o arquivo JSON.")
        
    data = json.loads(text.strip().lstrip('\ufeff'))
    
    if data.get('success'):
        base64_str = data['data']['output_url'].split(',')[1]
        image_data = base64.b64decode(base64_str)
        target_path = r'C:\Users\User\.gemini\antigravity\brain\7117b080-2687-476f-8826-4c1f0e38035d\fidelidade_executivo.jpg'
        
        with open(target_path, 'wb') as f_img:
            f_img.write(image_data)
        print(f'✅ SUCESSO!')
    else:
        print(f'❌ Erro no JSON: {data.get("error")}')
except Exception as e:
    print(f'❌ Erro ao processar: {e}')
