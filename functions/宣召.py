from .helper import *


"""
第四部分 宣召
"""


def partFour(prs, verseLines):

    chunks = parseVerses(verseLines)
    slide = newSlide(prs, '宣召')
    content = "\n".join([chunk[0] for chunk in chunks])

    newCenterBox(slide, content)
    for chunk in chunks:
        abbrName = chunk[1]
        title = '宣召（' + abbrName + '）'
        itemsPagesHasSpace(prs, title, chunk[2], charPerLine=15)
        # itemsPages(prs, title, chunk[2], fontSize=36)
