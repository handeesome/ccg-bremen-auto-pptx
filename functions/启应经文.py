from .helper import *

"""
第六部分 启应经文
"""


def partSeven(prs, verseLines):
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
            # newline every 15 characters
            substrings = newLines(content[0])
            newLine = '\n    '
            p.text = '启：' + newLine.join(substrings)
            setFont(p, 34, isBlue=True)

            p = txBox.text_frame.add_paragraph()
            substrings = newLines(content[1])
            p.text = '应：' + newLine.join(substrings)
            setFont(p, 34)
            p.space_before = Pt(10)

def newLines(text):
    delimiters = ['，', '。', '：', '；', '？']
    substrings = []
    i = 0
    while i < len(text):
            line = text[i:i+15]
            if substrings and line[0] in delimiters:
            # If the first character of the line is a delimiter, append it to the previous line
                    substrings[-1] += line[0]
                    i += 1  # Move to the next character
            else:
            # Otherwise, add the line as a new entry
                    substrings.append(line)
                    i += 15  # Move to the next line
    return substrings