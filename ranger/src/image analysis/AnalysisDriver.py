from Analyzer import Analyzer
import cv2
import os

# hardcoded input
dir_path = os.path.dirname(os.path.realpath(__file__))
img_path = os.path.join(dir_path, 'tester.jpg')
img = cv2.imread(img_path)
bullseye = (206,202)
diam = 19
rings = 10
proj_shade = 44
stream_url = 'http://10.100.102.9:8080/shot.jpg'

try:
    analyzer = Analyzer(img, bullseye, rings, diam, proj_shade, stream_url)
except IOError:
    print('Cannot properly connect to', stream_url)