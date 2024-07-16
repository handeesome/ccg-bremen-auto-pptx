from .helper import *


"""
第十部分 回应诗歌
"""

def partTen(prs, songHuiying):
    slide = newSlide(prs, '回应诗歌')
    txBox = newCenterBox(slide, songHuiying)
    p = txBox.text_frame.paragraphs[0]
    setFont(p, 66)