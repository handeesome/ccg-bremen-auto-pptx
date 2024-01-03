from .helper import *


"""
第十九部分 阿们颂
"""


def partNineteen(prs):
    song = '阿们颂'
    lyrics = """阿 们
阿 们
阿 们
阿 们"""
    audioPath = 'docs/阿们颂.mp3'
    lyricsPages(prs, song, lyrics, audioPath, isOnePage=True)
