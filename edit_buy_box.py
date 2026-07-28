from zipfile import ZipFile, ZIP_DEFLATED
from xml.etree import ElementTree as ET
from pathlib import Path

SOURCE = Path('/Users/adityasharma/Downloads/SBG Website Write up.docx')
OUTPUT = Path('/Users/adityasharma/Developer/shopify-theme/SBG Website Write up - buy box revised.docx')
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W_T = '{%s}t' % NS['w']

replacement = {
    'More than elegance and grace, the One for All dress was designed to flatter every body type. It was created to solve a problem most women know too well: falling in love with a dress, only to realize it doesn\'t look the same on them as it does on the model, even in the right size. It was never your body shape, it was the shape of the dress.':
        'Designed to flatter every body type, the One for All dress brings ease, elegance, and movement to your wardrobe. Its thoughtful silhouette helps you feel at home in your shape—without comparing yourself to a model or a compiled average.',
    'This isn\'t simply a dress that fits. The combination of every cut, shape and proportion was designed to balance and compliment your natural shape. From the refined boat neckline that flatters the upper silhouette, to the softly flared sleeves that add elegance and balance at just the right length. The A-line skirt creates graceful movement while adding subtle volume through the lower half, bringing harmony across all body types.':
        'A refined boat neckline, softly flared sleeves, and an A-line skirt work together to create balance and graceful movement. Every detail is intentional, so the dress complements your natural shape instead of asking you to fit a standard one.',
    'Thoughtfully designed to work with your natural shape, the One for All takes the guesswork out of getting dressed, so you can spend less time questioning your clothes and more time feeling confident in them.':
        'Made for your natural shape, this is the dress to reach for when you want to feel comfortable, confident, and completely yourself.',
}

with ZipFile(SOURCE, 'r') as zin:
    document = ET.fromstring(zin.read('word/document.xml'))
    changed = 0
    for paragraph in document.findall('.//w:body/w:p', NS):
        text = ''.join(node.text or '' for node in paragraph.findall('.//w:t', NS))
        if text in replacement:
            nodes = paragraph.findall('.//w:t', NS)
            # Keep paragraph/run formatting intact while replacing only its text.
            nodes[0].text = replacement[text]
            for node in nodes[1:]:
                node.text = ''
            changed += 1
    if changed != 3:
        raise RuntimeError(f'Expected to replace 3 buy-box paragraphs, replaced {changed}')
    xml = ET.tostring(document, encoding='utf-8', xml_declaration=True)
    with ZipFile(OUTPUT, 'w', ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = xml if item.filename == 'word/document.xml' else zin.read(item.filename)
            zout.writestr(item, data)
print(OUTPUT)
