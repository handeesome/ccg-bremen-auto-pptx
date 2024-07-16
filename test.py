dynamicDaogaoJiaohui = """1. 请为北德生活营祷告，求神带领一切的筹备工作、营会的流程，求神赐上头来的智慧给讲道的牧者，恩膏牧者的口，并借此触动每位参会人员，让每位弟兄姐妹灵命更加长进，让慕道朋友认识并接受福音，成为神的儿女。
2. 请继续为患病的弟兄姐妹及其家人祷告，求神亲自医治，给患病者力量和勇气，安慰他们的家人，帮助他们照顾病人。让病人病情尽快好转，恢复力量和健康。
3. 请为教会的执事及牧者祷告。求神带领帮助他们，用爱心和信心服事教会，并带领教会的众弟兄姊妹，同心合一，荣神益人，广传福音。
4. 求神保守与看顾教会的每一位弟兄姊妹，帮助我们跟神建立亲密的关系，做虔诚的祷告者，也渴慕神的话语。帮助我们学习谦卑并渴慕圣洁，合神心意，为主做美好的见证。
5. 请为教会的各项事工祷告。愿圣灵引导感动弟兄姊妹积极参与教会的各项侍奉，特别是福音宣教事工，求神帮助教会成为不莱梅及周边地区福音的管道，爱的出口，让在这里的华人朋友都有机会接触福音。
6. 请为教会的诗班祷告，特别为带领诗班的负责人祷告，求主赐给他们智慧及爱心，帮助他们教导组织诗班各项事工，求主保守诗班员彼此相爱，在事奉中追求和睦，一同长进，让诗班透过音乐传扬福音，领人归主。
7. 请为近期有回国行程和已经在国内的弟兄姊妹祷告。愿神看顾他们的脚步，保守他们在国内的时间，赐他们出入有平安。愿神赐福他们与国内的亲人朋友相聚的时间并有机会向他们分享福音。
"""

# # Split the string into a list based on the pattern of numbered points
# items = dynamicDaogaoJiaohui.split('\n')

# # Clean up any leading or trailing whitespace
# items = [item.strip() for item in items if item.strip()]

# Further split by the numbered points
import re
pattern = r'\d+\.\s'
split_items = re.split(pattern, dynamicDaogaoJiaohui)

# Remove any empty strings that may result from the split
split_items = [item.strip() for item in split_items if item.strip()]

print(split_items)
