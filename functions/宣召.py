from .helper import *


"""
第四部分 宣召
"""


def partFour(prs, verseLines):
    slide = newSlide(prs, '宣召')
    verseNames = '\n'.join(verses["fullName"] for verses in verseLines)
    newCenterBox(slide, verseNames)
    for verses in verseLines:
        verse = parseVerses(verses)
        title = '宣召（' + verses["abbrName"] + '）'
        itemsPagesHasSpace(prs, title, verse, charPerLine=15)
        # itemsPages(prs, title, chunk[2], fontSize=36)
