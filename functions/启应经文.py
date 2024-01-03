from .helper import *

"""
第六部分 启应经文
"""


def partSix(prs, verseLines):
    firstSlide = newSlide(prs, '启应经文')
    chunks = parseVerses(verseLines, isQiYing=True)
    fullNames = '\n'.join([chunk[0] for chunk in chunks])
    newCenterBox(firstSlide, fullNames)

    for chunk in chunks:
        abbrName = chunk[1]
        verses = chunk[2]
        groups = verseGroup(verses, isQiYing=True)
        title = '启应经文（' + abbrName + '）'
        for group in groups:
            slide = newSlide(prs, title)
            if len(group) < 2:
                verse = ''.join(group)
                content = divide_verse_evenly(verse)
            else:
                content = group
            txBox = addTextBox(slide, 1.82, 4.5, 21.75, 14.55)

            p = txBox.text_frame.paragraphs[0]
            text = content[0]
            # newline every 15 characters
            substrings = [text[i:i+15] for i in range(0, len(text), 15)]
            newLine = '\n    '
            p.text = '启：' + newLine.join(substrings)
            setFont(p, 34, isBlue=True)

            p = txBox.text_frame.add_paragraph()
            text = content[1]
            substrings = [text[i:i+15] for i in range(0, len(text), 15)]
            p.text = '应：' + newLine.join(substrings)
            setFont(p, 34)
            p.space_before = Pt(10)
