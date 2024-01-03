from .helper import *
"""
第三部分 主在圣殿中
"""


def partThree(prs):
    # 中心Title
    # slide = newSlide(prs, '主在圣殿中')
    # newCenterBox(slide, '主在圣殿中')

    # 歌词
    slide = newSlide(prs, '主在圣殿中')
    txBox = addTextBox(slide, 3.33, 4.5, 18.73, 14.49)
    p = txBox.text_frame.paragraphs[0]
    p.text = '主在圣殿中\n主在圣殿中\n普天下的人\n在主面前都应当肃静\n肃静 肃静 应当肃静\n阿们'
    setFont(p, 48)
    p.alignment = PP_ALIGN.CENTER
    audioPath = 'docs/主在圣殿中.mp3'
    addAudio(slide, audioPath)
