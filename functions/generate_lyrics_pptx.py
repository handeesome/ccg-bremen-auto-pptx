from pptx import Presentation
from .helper import *

def generate_lyrics_pptx(templatePath, pages, songName):
    title = songName
    prs = Presentation(templatePath)

    # insert [page 1] and [page 2] to the beginning of pages in loop
    for i in range(len(pages)):
        pages[i] = f"[Page {i+1}]\n{pages[i]}"
    # concatenate pages with pages
    pages = "\n".join(pages)

    lyricsPages(prs, title, pages)
    fileName = f"{title}.pptx"
    prs.save(os.path.join("static/temp", fileName))
    return fileName
