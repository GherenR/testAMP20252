import re
import json

def extract_clean_questions(content, section_name, start_page, end_page):
    """Extract questions from specific page range, trying to handle 2-column layout"""
    
    # Find the page range
    pages_text = []
    for page_num in range(start_page, end_page + 1):
        page_pattern = f'=== PAGE {page_num} ===(.+?)(?:=== PAGE {page_num + 1} ===|$)'
        match = re.search(page_pattern, content, re.DOTALL)
        if match:
            pages_text.append(match.group(1))
    
    full_text = '\n'.join(pages_text)
    return full_text

# Define page ranges for each TO
to_configs = {
    'TO 15': {
        'file': r'c:\Users\user\Downloads\PDF TO 15 PAHAMIFY 2025 @kstrophile.txt',
        'sections': {
            'Penalaran Umum': (1, 9),
            'Pengetahuan dan Pemahaman Umum': (10, 14),
            'Pemahaman Bacaan dan Menulis': (15, 19),
            'Pengetahuan Kuantitatif': (20, 23),
            'Literasi Bahasa Indonesia': (24, 34),
            'Literasi Bahasa Inggris': (35, 40),
            'Penalaran Matematika': (41, 45),
        }
    },
    'TO 13': {
        'file': r'c:\Users\user\Downloads\PDF TO 13 PAHAMIFY 2025 @kstrophile.txt',
        'sections': {
            'Penalaran Umum': (1, 7),
            'Pengetahuan dan Pemahaman Umum': (8, 12),
            'Pemahaman Bacaan dan Menulis': (13, 17),
            'Pengetahuan Kuantitatif': (18, 21),
            'Literasi Bahasa Indonesia': (22, 32),
            'Literasi Bahasa Inggris': (33, 39),
            'Penalaran Matematika': (40, 44),
        }
    },
    'TO 8': {
        'file': r'c:\Users\user\Downloads\PDF TO 8 PAHAMIFY 2025 @kstrophile.txt',
        'sections': {
            'Penalaran Umum': (1, 9),
            'Pengetahuan dan Pemahaman Umum': (10, 15),
            'Pemahaman Bacaan dan Menulis': (16, 22),
            'Pengetahuan Kuantitatif': (23, 27),
            'Literasi Bahasa Indonesia': (28, 40),
            'Literasi Bahasa Inggris': (41, 48),
            'Penalaran Matematika': (49, 52),
        }
    }
}

# Collect all questions
all_questions = {
    'TPS': {
        'Penalaran Umum': [],
        'Pengetahuan dan Pemahaman Umum': [],
        'Pemahaman Bacaan dan Menulis': [],
        'Pengetahuan Kuantitatif': [],
    },
    'Literasi': {
        'Literasi Bahasa Indonesia': [],
        'Literasi Bahasa Inggris': [],
        'Penalaran Matematika': [],
    }
}

# Process each TO
for to_name, config in to_configs.items():
    print(f"\n{'='*60}")
    print(f"Processing {to_name}")
    print(f"{'='*60}")
    
    with open(config['file'], 'r', encoding='utf-8') as f:
        content = f.read()
    
    for section_name, (start_page, end_page) in config['sections'].items():
        section_text = extract_clean_questions(content, section_name, start_page, end_page)
        
        # Determine category
        if section_name in ['Penalaran Umum', 'Pengetahuan dan Pemahaman Umum', 
                           'Pemahaman Bacaan dan Menulis', 'Pengetahuan Kuantitatif']:
            category = 'TPS'
        else:
            category = 'Literasi'
        
        # Store with source
        all_questions[category][section_name].append({
            'source': to_name,
            'text': section_text[:8000]  # Limit for display
        })
        
        print(f"  {section_name}: {len(section_text)} chars extracted")

# Output summary
print("\n" + "="*80)
print("SUMMARY: Question Bank Structure from Pahamify SNBT Tryouts")
print("="*80)

print("\n## TPS (Tes Potensi Skolastik)")
for subtest, sources in all_questions['TPS'].items():
    print(f"\n### {subtest}")
    for src in sources:
        print(f"  - {src['source']}: ~{len(src['text'])} chars")

print("\n## Literasi")
for subtest, sources in all_questions['Literasi'].items():
    print(f"\n### {subtest}")
    for src in sources:
        print(f"  - {src['source']}: ~{len(src['text'])} chars")

# Sample output: first 3 questions from TO 15 Penalaran Umum
print("\n" + "="*80)
print("SAMPLE: Penalaran Umum Questions (TO 15)")
print("="*80)
to15_pu = all_questions['TPS']['Penalaran Umum'][0]['text']
print(to15_pu[:5000])

print("\n" + "="*80)  
print("SAMPLE: Literasi Bahasa Inggris Questions (TO 15)")
print("="*80)
to15_lbi = all_questions['Literasi']['Literasi Bahasa Inggris'][0]['text']
print(to15_lbi[:5000])

print("\n" + "="*80)
print("SAMPLE: Penalaran Matematika Questions (TO 15)")
print("="*80)
to15_pm = all_questions['Literasi']['Penalaran Matematika'][0]['text']
print(to15_pm[:5000])
