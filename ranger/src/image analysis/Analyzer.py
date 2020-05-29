import numpy as np
import cv2
import Matcher
import Highlighter
import BasicImageActions as ImageAct
from TargetProcessor import Processor

class Analyzer:
    '''
    {Numpy.array} img - The image of the target to look for in the live video stream
    {tuple} bullseye - (
                          {Number} x coordinates of the target's bullseye point,
                          {Number} y coordinates of the target's bullseye point
                       )
    {Number} rings - Amount of rings in the target
    {Number} ring_diam - The diameter of the target's inner ring
    {Number} projectile_shade - The grayscale value of the projectile that hits the target [0-255]
    {String} stream_source - Video file path or URL
    '''

    def __init__(self, img, bullseye, rings, ring_diam, projectile_shade, stream_source):
        np.seterr(divide='ignore', invalid='ignore')

        self.model = img
        self.model_h, self.model_w, _ = self.model.shape
        self.warped_transform = img
        self.warped_vertices = []
        self.warped_edges = []
        self.model_bullseye = bullseye
        self.model_ring_diam = ring_diam
        self.model_rings = rings

        # set analysis components
        self.sift = cv2.xfeatures2d.SIFT_create()
        self.processor = None

        # calculate the model's keypoints and description
        # 1. get one live stream sample
        self.stream_url = stream_source
        self.cap = cv2.VideoCapture(self.stream_url)
        ret, test_sample = self.cap.read()
        
        # connection to URL is invalid
        if not ret:
            raise IOError 

        # 2. calculate model attributes
        self.anchor_points, self.pad_model = ImageAct.zero_pad_as(self.model, test_sample.shape)
        anchor_a = self.anchor_points[0]
        bullseye_anchor = (anchor_a[0] + bullseye[0],anchor_a[1] + bullseye[1])
        self.anchor_points.append(bullseye_anchor) # add bull'seye anchor point
        self.anchor_points = np.float32(self.anchor_points).reshape(-1, 1, 2)
        self.model_keys, self.model_desc = self.sift.detectAndCompute(self.pad_model, None)

        self.analyze() # start video stream and run analysis

    def create_image_processor(self, transform, frame_size): 
        '''
        Create a new image processor.

        Parameters:
            {Numpy.array} transform - The transformation of the image after applying the homography to it
            {tuple} frame_size - (
                                    {Number} The height of the filmed frame image,
                                    {Number} The width of the filmed frame image
                                 )

        Returns:
            {ImageProcessor} A new ImageProcessor object.
        '''

        self.warped_vertices, self.warped_edges = ImageAct.calc_vertices_and_edges(transform)
        return Processor(self.model.shape, frame_size, self.model_ring_diam,
                         self.model_rings, self.warped_vertices, self.warped_edges)

    def calc_score(self, hits, scale):
        '''
        Calculate the score of each detected hit in the frame.

        Parameters:
            {list} hits - [
                             {tuple} (
                                        {Number} x coordinates of the hit,
                                        {Number} y coordinates of the hit,
                                        {Number} The distance of the hit from the bull'seye
                                     )
                             ...
                          ]
            {tuple} scale - (
                               {Number} The percentage of the warped image's average horizontal edges' length
                                        out of the model's average horizontal edges' length,
                               {Number} The percentage of the warped image's average vertical edges' length
                                        out of the model's average vertical edges' length,
                               {Number} The size of the filmed target divided by the model target
                            )
        
        Returns:
            {list} [
                      {tuple} (
                                 {tuple} (
                                            {Number} x coordinates of the hit,
                                            {Number} y coordinates of the hit
                                         ),
                                 {Number} The hit's score according to the target's data
                              )
                      ...
                   ]
        '''

        scoreboard = []
        for hit in hits:
            hit_dist = hit[2]
            scaled_diam = self.model_ring_diam * scale[2]
            score = 10 - int(hit_dist / scaled_diam)

            # clamp score between 10 and minimum available score
            if score < 10 - self.model_rings + 1:
                score = 0
            elif score > 10:
                score = 10
            
            scoreboard.append(((int(hit[0]), int(hit[1])), score))

        return scoreboard
    
    def analyze(self):
        '''
        Start recording a live video stream and analyze it.
        If a target is detected, calculate and mark the hits on it,
        while also keeping track of their score value.
        '''

        while True:
            # read next captured frame
            self.cap = cv2.VideoCapture(self.stream_url)
            ret, frame = self.cap.read()

            if ret:
                frame_h, frame_w, _ = frame.shape

                # set default analysis meta-data
                scale_percent = 'NaN'
                scores = []

                # find a match between the model image and the stream shot
                matches, (train_keys, train_desc) = Matcher.ratio_match(self.sift, self.model_desc, frame, .7)

                # start calculating homography
                if len(matches) >= 4:
                    homography = Matcher.calc_homography(self.model_keys, train_keys, matches)

                    # check if homography succeeded and start warping the model over the detected object
                    if type(homography) != type(None):
                        warped_transform = cv2.perspectiveTransform(self.anchor_points, homography)
                        self.processor = self.create_image_processor(warped_transform, frame.shape)
                        
                        # check if homography is good enough to continue
                        if Matcher.is_true_homography(self.warped_vertices, self.warped_edges, (frame_w, frame_h)):
                            # detect hits on the filmed target
                            warped_img = cv2.warpPerspective(self.pad_model, homography, (frame_w, frame_h))
                            hits_data = self.processor.process(warped_img, frame)
                            scale = self.processor.get_scale()
                            scale_percent = scale[2]

                            # calculate hits and draw circles around them
                            scoreboard = self.calc_score(hits_data, scale)
                            Highlighter.mark_hits(frame, scoreboard)

                # display
                if scale_percent != 'NaN':
                    scale_percent = str(round(scale_percent, 2))

                Highlighter.draw_meta_data(frame, sum(scores), scale_percent)
                frame_resized = cv2.resize(frame, (1153, 648))
                cv2.imshow('Hits detection', frame_resized)

                # release memory
                self.cap.release()

                if cv2.waitKey(1) & 0xff == 27:
                    break
            else:
                print('Cannot connect to the video stream.')
                break
        
        # close window properly
        
        cv2.destroyAllWindows()
        cv2.waitKey(1)