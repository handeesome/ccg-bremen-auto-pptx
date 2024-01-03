from .helper import *


"""
第二十部分 默祷
"""


def partTwenty(prs):
    slide = newSlide(prs, '')
    slide.shapes.add_picture('docs/默祷.jpg', 0, 0)
    addAudio(slide, 'docs/默祷.mp3')
    return slide
