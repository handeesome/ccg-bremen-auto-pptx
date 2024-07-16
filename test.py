from pptx import Presentation
from functions.圣餐礼 import partSixteen
from functions.helper import *
from functions.日期 import partTwo
import textwrap

birthdaySong = {"songName": "赐福于你", "audioPath":"docs/生日歌.mp3", "lyrics":textwrap.dedent("""
        [Page 1]
        愿主的恩惠慈爱与你同在
        愿主的灵时时围绕
        恩典降下 赐福于你
        平安喜乐天天充满你
                                                                                         
        [Page 2]
        赐福于你 赐福于你
        平安喜乐天天充满你
        赐福于你 赐福与你                                                                    
        平安喜乐天天充满你
        """)}
prs = Presentation("docs/template.pptx")
slide = prs.slides[1]
value = "靠近十架"
partTwo(slide, "2024", "7", "1", communion=value!="None")
songName = birthdaySong.get("songName")
lyrics = birthdaySong.get("lyrics")
audioPath = birthdaySong.get("audioPath")
lyricsPages(prs, songName, lyrics, audioPath)
fileName = 'test.pptx'
prs.save(fileName)