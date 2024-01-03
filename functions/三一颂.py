from .helper import *


"""
第十七部分 三一颂
"""


def partSeventeen(prs):
    slide = newSlide(prs, '齐唱')
    newCenterBox(slide, '三一颂')
    song = '三一颂'
    lyrics = """赞美天父爱世慈仁
赞美耶稣代赎洪恩
赞美圣灵开我茅塞
赞美三位合一真神
阿们"""
    audioPath = 'docs/三一颂.mp3'
    lyricsPages(prs, song, lyrics, audioPath, isOnePage=True)
    return slide
