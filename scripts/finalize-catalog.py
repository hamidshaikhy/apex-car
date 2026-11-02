from pathlib import Path
import json, hashlib
p=Path('src/data/vehicles.json');cars=json.loads(p.read_text(encoding='utf8'))
replacements={
 '٫':'.','٬':',','کامپتیشن':'Competition',
 '5.2-litre supercharged 90-degree cross-plane V8':'V8 سوپرشارژ 5.2 لیتری با زاویهٔ 90 درجه و میل‌لنگ cross-plane',
 'Premium petrol':'بنزین سوپر',
 'TREMEC TR-9070 7-speed dual-clutch automatic':'دوکلاچهٔ 7 سرعتهٔ TREMEC TR-9070',
 'Rear-wheel drive; 3.73:1 TORSEN differential':'محور عقب؛ دیفرانسیل TORSEN با نسبت 3.73:1',
 'Double-ball-joint MacPherson strut front; independent integral-link rear; MagneRide adaptive damping':'مک‌فرسون دواتصالی جلو؛ عقب مستقل integral-link با دمپر تطبیقی MagneRide',
 'Unitized steel, front-engine architecture':'بدنهٔ یکپارچهٔ فولادی با آرایش موتور جلو',
 'Length (approx.)':'طول تقریبی','Width, excluding mirrors (approx.)':'عرض تقریبی بدون آینه',
 'Height (approx.)':'ارتفاع تقریبی','Wheelbase (approx.)':'فاصلهٔ محوری تقریبی','Brake manufacturer':'سازندهٔ ترمز',
 '3.8 s ? 0?100 KM/H':'3.8 s · 0–100 km/h','3.9 s ? 0?100 KM/H':'3.9 s · 0–100 km/h',
 '250 کیلومتر/ساعت; 290 کیلومتر/ساعت with M Driver’s Package':'250 km/h استاندارد؛ 290 km/h با M Driver’s Package',
}
def fix(v):
 if isinstance(v,str):
  for a,b in replacements.items():v=v.replace(a,b)
  return v
 if isinstance(v,list):return [fix(x) for x in v]
 if isinstance(v,dict):return {k:fix(x) for k,x in v.items()}
 return v
cars=fix(cars)
for c in cars:
 if c['id']=='ghost':
  c['colors'][2]={'name':'نقره‌ای ساتن','hex':'#abb3b6'}
 if c['id']=='challenger':
  c['glassMaterials']=['Material__288']
  c['modelYaw']=0
  c.update({'name':'Dodge Challenger','englishName':'Dodge Challenger','model':'Challenger','shortName':'Challenger','year':2009,'price':64500,'image':'assets/editorial/challenger-2009.webp','engine':'6.1 لیتری V8 HEMI تنفس طبیعی','transmissionShort':'6 سرعتهٔ دستی','weight':'1,892 kg (estimated curb)','headline':'قدرت آمریکایی، با حضور بی‌رقیب','tag':'یک Muscle Car تمام‌عیار','storyTitle':'شخصیتی که به چشم می‌آید','description':'Challenger نسل سوم، فرم عضلانی و چهار چراغ گرد را به معماری مدرن منتقل می‌کند. مرجع مشخصات این صفحه، نسخهٔ SRT8 مدل 2009 با موتور 6.1 لیتری HEMI است؛ مدل سه‌بعدی، جزئیات ظاهری تیونینگ‌شده دارد.','highlights':['پیشرانهٔ V8 HEMI','محور عقب','گیربکس دستی TREMEC'],'power':{'value':'425','unit':'SAE hp','sortValue':425},'specNote':'مشخصات مرجع، SRT8 مدل 2009 بر اساس سند رسمی Dodge است. قدرت و گشتاور در این سند برآورد SAE net و وزن برآورد curb هستند. مدل سه‌بعدی دارای تغییرات ظاهری است و تریم دقیق آن از فایل سازنده مشخص نمی‌شود. زمان شتاب و سرعت نهایی تأییدشده‌ای در این منبع درج نشده است.','sources':[{'title':'Dodge — 2009 Challenger specifications','url':'https://s3.amazonaws.com/chryslermedia.iconicweb.com/mediasite/specs/2009DodgeChallengerSpecifications_Reveal.pdf'}], 'specs':[{'title':'پیشرانه و عملکرد','items':[['پیشرانه','6.1 لیتری HEMI V8'],['حجم موتور','6,059 cc'],['بیشینهٔ توان','425 SAE hp در 6,200 rpm'],['بیشینهٔ گشتاور','569 Nm در 4,800 rpm'],['سوخت','بنزین سوپر']]},{'title':'انتقال قدرت و شاسی','items':[['گیربکس','6 سرعتهٔ دستی TREMEC TR-6060؛ 5 سرعتهٔ خودکار نیز عرضه شده'],['محور محرک','محور عقب با دیفرانسیل لغزش محدود'],['ساختار','کوپهٔ موتور جلو']]},{'title':'ابعاد و وزن','items':[['وزن','1,892 کیلوگرم؛ برآورد curb'],['طول','5,023 میلی‌متر'],['عرض','1,923 میلی‌متر'],['ارتفاع','1,449 میلی‌متر'],['فاصلهٔ محوری','2,946 میلی‌متر'],['تعداد صندلی','5']]},{'title':'ترمز و چرخ‌ها','items':[['نسخهٔ مرجع','SRT8 مدل 2009'],['تجهیزات مدل سه‌بعدی','رینگ، کاپوت و بدنه با تغییرات ظاهری'],['یادداشت','تجهیزات هنری مدل لزوماً مشخصات کارخانه نیستند']]}]})
 if c['id'] in ['one77','tourbillon']:
  c['glassMaterials']=[]
 if c['id']=='audi':
  c['paintMaterials']=['Paint']
 if c['id']=='gtr':
  c['colors'][1]={'name':'آبی متالیک','hex':'#194d88'}
 if c['id']=='amg':
  c['glassMaterials']=['マテリアル.234','マテリアル.212','マテリアル.051']
  c['rubberMaterials']=['Material_#25']
p.write_text(json.dumps(cars,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
old=json.loads(Path('public/assets/models/manifest.json').read_text(encoding='utf8'))
counts={c['id']:c['triangles'] for c in old}
counts.update({c['id']:c['triangles'] for c in json.loads(Path('docs/imported-models.json').read_text(encoding='utf8'))})
manifest=[]
for c in cars:
 file=Path('public/assets/models')/c['modelFile'];raw=file.read_bytes()
 manifest.append({'id':c['id'],'vehicle':c['name'],'file':c['modelFile'],'bytes':len(raw),'triangles':counts[c['id']],'paintMaterials':c['paintMaterials'],'author':c['modelAuthor'],'source':c['modelSource'],'license':c['modelLicense'],'simplified':False,'sha256':hashlib.sha256(raw).hexdigest()})
Path('public/assets/models/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
