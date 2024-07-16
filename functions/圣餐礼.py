from .helper import *
import textwrap


"""
第十六部分 圣餐礼
"""
baoJiaQingYing = {"songName": '宝架清影', "audioPath":"docs/宝架清影.mp3", "lyrics":textwrap.dedent("""
        [Page 1]
        在主宝架清影中
        我愿脚步立定
        好像炎暑远行辛苦
        投进磐石荫影

        [Page 2]
        好像旷野欣逢居处
        长途喜见凉亭
        到此得息肩头重担
        养力奔赴前程

        [Page 3]
        神圣庄严的十架
        我常抬头仰望
        双眼如见宝血倾流
        为我忍受死亡
                                 
        [Page 4]
        热泪满眶寸心如裂
        两事仔细思量
        思量我身不配受恩
        思量主爱非常

        [Page 5]
        神圣十架的荫下
        是我安乐之乡
        主面光华辉煌照耀
        何须别有光亮
                                 
        [Page 6]
        世界虚荣不足贪图
        得失非所计较
        但将罪恶看为羞耻
        宝架看为荣耀
        """)}
kaoJinShiJia = {"songName":"靠近十架", "audioPath":"docs/靠近十架.mp3", "lyrics":textwrap.dedent("""
        [Page 1]
        求主使我近十架
        在彼有生命水
        由各各他山流下
        白白赐人洗罪

        [Page 2]
        十字架 十字架
        永是我的荣耀
        我众罪都洗清洁
        惟靠耶稣宝血

        [Page 3]
        我与主同钉十架
        和他同葬同活
        今基督居住我心
        不再是我活着 
                                 
        [Page 4]
        十字架 十字架
        永是我的荣耀
        我众罪都洗清洁
        惟靠耶稣宝血

        [Page 5]
        我立志不传别的
        只传耶稣基督
        并他为我钉十架
        复活作救赎主
                                 
        [Page 6]
        十字架 十字架
        永是我的荣耀
        我众罪都洗清洁
        惟靠耶稣宝血
                                 
        [Page 7]
        我愿意别无所夸
        但夸救主十架
        世界对我已钉死
        我以死对待它 

        [Page 8]
        十字架 十字架
        永是我的荣耀
        我众罪都洗清洁
        惟靠耶稣宝血
        """)}
poSui = {"songName":"破碎", "audioPath":"docs/破碎.mp3", 
         "lyrics":textwrap.dedent
         ("""
        [Page 1]
        怀着虔敬的心
        我们来到你的座前
        单单依靠你的怜悯
        数算你慈爱无限
        多少次远离 多少次的归回 
        你深知我们的软弱 
        求你施恩典
        [Page 2]
        求用破碎的身体
        来拥抱我们的破碎
        以倾注的宝血
        来挽回我们的心
        你奇妙的救恩
        我们永远无法完全体会
        [Page 3]
        求用钉痕的双手
        来缠裹我们的伤痕
        将倒空的生命
        来滋润我们的干渴
        亲爱的救主 亲爱的救主
        亲爱的救主 愿一生相随
        [Page 4]
        怀着疲惫的灵
        我们回到你的身边
        默默听你温柔声音
        仰望你慈爱荣面
        多少次冷淡 多少次的懊悔
        你深知我们的伤痛 
        求你来安慰
        [Page 5]
        求用破碎的身体
        来拥抱我们的破碎
        以倾注的宝血
        来挽回我们的心
        你奇妙的救恩
        我们永远无法完全体会
        [Page 6]
        求用钉痕的双手
        来缠裹我们的伤痕
        将倒空的生命
        来滋润我们的干渴
        亲爱的救主 亲爱的救主
        亲爱的救主 愿一生相随
        [Page 7]
        求用破碎的身体
        来拥抱我们的破碎
        以倾注的宝血
        来挽回我们的心
        你奇妙的救恩
        我们永远无法完全体会
        [Page 8]
        求用钉痕的双手
        来缠裹我们的伤痕
        将倒空的生命
        来滋润我们的干渴
        亲爱的救主 亲爱的救主
        亲爱的救主 愿一生相随
""")}

def partSixteen(prs, choice):
    slide = newSlide(prs, '圣礼')
    newCenterBox(slide, '圣餐礼')
    slide = newSlide(prs, '圣餐礼')
    if choice=='宝架清影':
        songName = baoJiaQingYing.get('songName')
        lyrics = baoJiaQingYing.get('lyrics')
        audioPath = baoJiaQingYing.get('audioPath')
    elif choice=='靠近十架':
        songName = kaoJinShiJia.get('songName')
        lyrics = kaoJinShiJia.get('lyrics')
        audioPath = kaoJinShiJia.get('audioPath')
    elif choice=='破碎':
        songName = poSui.get('songName')
        lyrics = poSui.get('lyrics')
        audioPath = poSui.get('audioPath')
    newCenterBox(slide, songName)
    lyricsPages(prs, songName, lyrics, audioPath)
    
    title = '读经(林前 11:23-29)'
    verseLines = ['23 我当日传给你们的，原是从主领受的，就是主耶稣被卖的那一夜，拿起饼来，', '24 祝谢了，就擘开，说：这是我的身体，为你们舍的，你们应当如此行，为的是记念我。', '25 饭后，也照样拿起杯来，说：这杯是用我的血所立的新约，你们每逢喝的时候，要如此行，为的是记念我。', '26 你们每逢吃这饼，喝这杯，是表明主的死，直等到他来。', '27 所以，无论何人，不按理吃主的饼，喝主的杯，就是干犯主的身、主的血了。', '28 人应当自己省察，然后吃这饼、喝这杯。', '29 因为人吃喝，若不分辨是主的身体，就是吃喝自己的罪了。']
    itemsPagesHasSpace(prs, title, verseLines, charPerLine=15)
    slide = newSlide(prs, title='')
    newCenterBox(slide, '认罪祷告')

    txBox = newSlideWithTitleAndContent(prs, '宣誓', "我们若认自己的罪，神是信实的，是公义的，必要赦免我们的罪，洗净我们一切的不义。")
    p = txBox.text_frame.add_paragraph()
    p.text = "约壹 1:9"
    setFont(p, 34)
    p.alignment = PP_ALIGN.RIGHT

    newSlideWithTitleAndContent(prs, '感恩祷告', "圣洁、全能、永在的父神啊，我们何时何地也当乐意感谢赞美祢，祢赐下圣灵安慰我们，坚固我们，引领我们，借我们彰显耶稣基督的作为。\n\n大有仁爱的父神，我们赞美祢！祢怜悯我们这些沉沦的罪人，赐下祢独生子耶稣基督，叫一切信祂的，不至灭亡，反得永生。我们感谢祢的大恩，借耶稣基督拯救我们。")
    newSlideWithTitleAndContent(prs, '感恩祷告', "求祢现在差派祢的圣灵，进到我们心里，好叫我们以活泼的信，借着所领受的圣餐，让耶稣住在我们里面。阿们。")

    txBox = newSlideWithTitleAndContent(prs, '召请', "耶稣说：“凡劳苦担重担的人可以到我这里来，我就使你们得安息。”")
    p = txBox.text_frame.add_paragraph()
    p.text = "太 11:28\n"
    setFont(p, 34)
    p.alignment = PP_ALIGN.RIGHT
    p = txBox.text_frame.add_paragraph()
    p.text = "圣餐是耶稣所设立的，凡信而受洗的基督徒，无论来自那个地方的信徒，也欢迎来领受恩筵，圣餐使信徒联合在基督内，使我们确信罪得赦免，借着耶稣基督救赎的功劳，我们与神，与人都复和了。"
    setFont(p, 34)

    newSlideWithTitleAndContent(prs, '施餐：分饼', "我主耶稣被出卖的那一夜，拿起饼来，祝谢了，就擘开递给门徒说：你们拿着吃，这是我的身体，为你们舍的；你们当如此行，为的是记念我。\n\n(存感恩的心领受)")
    addAudio(prs.slides[-1], audioPath)
    newSlideWithTitleAndContent(prs, '施餐：分杯', "晚饭后，也照样拿起杯来，祝谢了，递给门徒说：你们都喝这个；这杯是我立新约的血，为你们流出来的，使罪得赦；每逢喝的时候，你们当如此行，为的是记念我。\n\n(存感恩的心领受)")
    addAudio(prs.slides[-1], audioPath)
    newSlideWithTitleAndContent(prs, '分饼、杯以后问安', "我拿什么报答主向我所赐的一切厚恩？我要举起救恩的杯，称扬主耶稣基督的名。\n愿你们平安！阿门！")
def newSlideWithTitleAndContent(prs, title, content):
    slide = newSlide(prs, title)
    txBox = addTextBox(slide, 1.72, 4.5, 22.18, 14.55)
    p = txBox.text_frame.paragraphs[0]
    p.text = content
    setFont(p, 34)
    return txBox

