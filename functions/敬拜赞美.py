from .helper import *


"""
第五部分 敬拜赞美
"""

def partFive(prs, songOne, songTwo, songThree, songs):
    songNames = [songOne, songTwo, songThree]
    for i in range(3):
        slide = newSlide(prs, '敬拜赞美')
        txBox = addTextBox(slide, 2.91, 6.4, 22.49, 9.33)
        p = txBox.text_frame.paragraphs[0]
        p.text = "1.  " + songOne
        setFont(p, 48, isBlue=False)
        p = txBox.text_frame.add_paragraph()
        p.text = "2.  " + songTwo
        setFont(p, 48, isBlue=False)
        p = txBox.text_frame.add_paragraph()
        p.text = "3.  " + songThree
        setFont(p, 48, isBlue=False)
        p = txBox.text_frame.paragraphs[i]
        setFont(p, 48, isBlue=True)
        # insert [page 1] and [page 2] to the beginning of pages in loop
        pages = songs[i]
        for i in range(len(pages)):
            pages[i] = f"[Page {i+1}]\n{pages[i]}"
        # concatenate pages with pages
        pages = "\n".join(pages)
        lyricsPages(prs, songNames[i], pages)
