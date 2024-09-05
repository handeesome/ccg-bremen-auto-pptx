from functions.helper import *
from pptx import Presentation
from functions.奉献回应礼 import partEleven

prs = Presentation('docs/template.pptx')
partEleven(prs, '林后 9:6-7')
prs.save('test.pptx')
