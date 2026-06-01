from pathlib import Path
path = Path('notes-hub.js')
text = path.read_text(encoding='utf-8')
print('length', len(text))
for i, ch in enumerate(text):
    if ord(ch) > 0x7f:
        print('non-ascii', repr(ch), 'at', i)
        break
else:
    print('ascii only')
for lineno, line in enumerate(text.splitlines(), 1):
    if '\u2028' in line or '\u2029' in line or '\ufeff' in line:
        print('special char line', lineno, repr(line))
        break
else:
    print('no line-special chars')
