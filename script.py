import urllib.request, re
req = urllib.request.Request('https://dribbble.com/shots/4066708-Face-ID-glitch-effect', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
url = re.search(r'property=.og:image.\s*content=.([^.]+).', html).group(1)
urllib.request.urlretrieve(url.replace('&amp;', '&'), r'c:\Users\LENOVO\Desktop\crud\frontend\src\assets\hero-bg.gif')
