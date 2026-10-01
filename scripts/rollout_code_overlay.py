"""Compact syntax-highlighted code card drawn directly into the video overlay."""
import io, keyword, token, tokenize
from functools import lru_cache
from PIL import ImageDraw, ImageFont

@lru_cache(maxsize=40)
def font(size,kind='mono'):
 return ImageFont.truetype('C:/Windows/Fonts/'+{'mono':'consola.ttf','sans':'segoeui.ttf','bold':'segoeuib.ttf'}[kind],size)

def draw_instruction(image,instruction,accent):
 face=font(25,'sans');max_width=1580
 lines=[];line=''
 for word in instruction.split():
  proposed=(line+' '+word).strip()
  if line and face.getlength(proposed)>max_width:lines.append(line);line=word
  else:line=proposed
 if line:lines.append(line)
 assert 1<=len(lines)<=2,(instruction,lines)
 text_width=max(face.getlength(line) for line in lines)
 x,y=48,124;height=30*len(lines)+26
 width=max(400,int(text_width)+202)
 assert x+width<=1868,(instruction,width)
 d=ImageDraw.Draw(image)
 d.rounded_rectangle((x,y,x+width,y+height),11,fill=(7,15,26,184))
 d.text((x+18,y+17),'INSTRUCTION',font=font(17,'bold'),fill=accent)
 for i,line in enumerate(lines):d.text((x+176,y+10+i*30),line,font=face,fill='#F1F5FA')
 return {'x':x,'y':y,'width':width,'height':height,'lines':lines}

def draw_code_card(image,code,phase,total,accent):
 lines=code.splitlines();n=len(lines)
 size=20
 while max(font(size).getlength(line) for line in lines)>642 and size>17:size-=1
 face=font(size);cw=face.getlength('M');lh=size+6
 width=max(520,int(max(face.getlength(line) for line in lines))+84)
 assert width<=752,(width,lines)
 height=54+n*lh+16
 x=48;y=1035-height
 d=ImageDraw.Draw(image)
 d.rounded_rectangle((x,y,x+width,y+height),14,fill=(8,15,24,229),outline=(94,116,137,150),width=1)
 d.rounded_rectangle((x,y+14,x+3,y+height-14),1,fill=accent)
 d.text((x+20,y+13),'CODE',font=font(16,'bold'),fill=accent)
 d.text((x+91,y+13),f'SLICE {phase+1:02d} / {total:02d}',font=font(16,'mono'),fill='#DFE8F1')
 d.line((x+18,y+40,x+width-18,y+40),fill=(111,134,157,70),width=1)
 token_colors={}
 items=list(tokenize.generate_tokens(io.StringIO(code).readline))
 useful=[a for a in items if a.type not in [token.INDENT,token.DEDENT,token.NEWLINE,tokenize.NL,token.ENDMARKER]]
 for i,a in enumerate(useful):
  color='#DCE5EF'
  if a.type==token.STRING:color='#AAD89A'
  elif a.type==token.NUMBER:color='#E6BC83'
  elif a.type==tokenize.COMMENT:color='#8E9AA9'
  elif a.type==token.NAME:
   if keyword.iskeyword(a.string):color='#C9A2E9'
   elif i+1<len(useful) and useful[i+1].string=='(':color='#88C6EA'
   elif a.string=='robot':color='#D8E7F2'
  if a.start[0]==a.end[0]:
   for col in range(a.start[1],a.end[1]):token_colors[(a.start[0]-1,col)]=color
 for row,line in enumerate(lines):
  yy=y+51+row*lh
  d.text((x+17,yy+1),f'{row+1:02d}',font=font(size-3),fill='#68798A')
  for col,ch in enumerate(line):
   d.text((x+57+col*cw,yy),ch,font=face,fill=token_colors.get((row,col),'#DCE5EF'))
 return {'x':x,'y':y,'width':width,'height':height,'font_size':size,'lines':n}
