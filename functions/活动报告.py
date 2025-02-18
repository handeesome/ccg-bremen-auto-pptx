from .helper import *
import textwrap


"""
第十二部分 活动报告
"""
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

def partTwelve(prs, items, isBirthday=False, birthdayList='None'):
    slide = newSlide(prs, '')
    txBox = newCenterBox(slide, '活动报告')
    txBox.text_frame.paragraphs[0].font.color.rgb = RGBColor(0x2E, 0x75, 0xB6)

    title = '活动报告'

    # itemsPagesHasSpace(prs, title, items, 18, fontSize=30, isNumber=True)
    itemsPages(prs, title, items, fontSize=30,
               isNumber=True, character_limit=150)
    # add birthday page
    if isBirthday:
        slide = newSlide(prs, title)
        txBox = addTextBox(slide, 1.72, 4.5, 21.8, 14.55)
        p = txBox.text_frame.paragraphs[0]
        p.text = '本月寿星：' + birthdayList
        setFont(p, 30)
        songName = birthdaySong.get("songName")
        lyrics = birthdaySong.get("lyrics")
        audioPath = birthdaySong.get("audioPath")
        lyricsPages(prs, songName, lyrics, audioPath)
