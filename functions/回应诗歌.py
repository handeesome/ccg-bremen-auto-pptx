from .helper import *


"""
第十部分 回应诗歌
"""

def partTen(prs, songHuiying, songHuiyingPages):
    slide = newSlide(prs, '回应诗歌')
    txBox = newCenterBox(slide, songHuiying)
    p = txBox.text_frame.paragraphs[0]
    setFont(p, 66)
    # insert [page 1] and [page 2] to the beginning of pages in loop
    pages = songHuiyingPages
    for i in range(len(pages)):
        pages[i] = f"[Page {i+1}]\n{pages[i]}"
    # concatenate pages with pages
    pages = "\n".join(pages)
    lyricsPages(prs, songHuiying, pages)