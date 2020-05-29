import numpy as np
import cv2

class Processor:
    '''
    {tuple} model_shape - (
                             {Number} The height of the model image that this object processes,
                             {Number} The width of the model image that this object processes
                          )
    {tuple} frame_size - (
                            {Number} The height of the filmed frame image,
                            {Number} The width of the filmed frame image
                         )
    {Number} ring_diam - The diameter of the most inner ring of the target
    {Number} rings_amount - Amount of value rings the target has
    {tuple} vertices - A, B, C, D, E vertices (respectively) of the transformation
                       E.g: A ----------- B
                            |             |
                            |      E      |
                            |             |
                            D ----------- C

                       {tuple} (
                                  {Number} x coordinates of point A,
                                  {Number} y coordinates of point A
                               ),
                               ...,
    {tuple} edges - (
                       {Number} The length of AB edge,
                       {Number} The length of BC edge,
                       {Number} The length of CD edge,
                       {Number} The length of DA edge
                    )
    '''

    def __init__(self, model_shape, frame_size, ring_diam, rings_amount, vertices, edges):
        self.bullseye = vertices[5]
        self.ring_diam = ring_diam
        self.rings_amount = rings_amount
        self.vertices = vertices
        self.edges = edges
        self.scale = self._calc_scale(edges, model_shape)
        self.estimated_radius = rings_amount * ring_diam * self.scale[2]

        # calculate the distance of each point from the center
        dx = np.arange(frame_size[1])
        dy = np.arange(frame_size[0])
        x, y = self.bullseye[0], self.bullseye[1]
        mat_X, mat_Y = np.meshgrid(dx, dy)
        self.distances = ((mat_X, mat_Y), ((mat_X - x) ** 2 + (mat_Y - y) ** 2) ** .5)

    def _calc_scale(self, edges, model_shape):
        '''
        Calculate the scale of the warped homography transformation relative
        to the actual model's shape.

        Parameters:
            {tuple} edges - The AB, BC, CD and DA edges of the transformation
            {tuple} model_shape - (
                                     {Number} The height of the target model image that this object processes,
                                     {Number} The width of the target model image that this object processes
                                  )

        Returns:
            {tuple} (
                       {Number} The average size of the horizontal edges divided by
                                the average size of the vertical edges (width / height ratio),
                       {Number} The average size of the vertical edges divided by
                                the average size of the horizontal edges (height / width ratio),
                       {Number} The estimated size of the homography transformation
                                divided by the estimated size of the target model
                                (transformed size / actual size ratio)
                    )
        '''

        horizontal_edge = (edges[0] + edges[2]) / 2
        vertical_edge = (edges[1] + edges[3]) / 2
        hor_percent = horizontal_edge / vertical_edge
        ver_percent = vertical_edge / horizontal_edge
        hor_scale = horizontal_edge / model_shape[1]
        ver_scale = vertical_edge / model_shape[0]
        scale_percent = (hor_scale + ver_scale) / 2

        return hor_percent, ver_percent, scale_percent

    def _subtract_background(self, query, subtrahend, palette):
        '''
        Subtract the background from the target, so only the difference between them is left.

        Parameters:
            {Numpy.array} query - The image from which the background is subtracted [RGB]
            {Numpy.array} subtrahend - The background to subtract from the query [RGB]
            {list} palette - A list that consists of the grayscale values that should be remained
                             after the subtraction of the two images
        '''

        # convert to grayscale
        gray_query = cv2.cvtColor(query, cv2.COLOR_RGB2GRAY)
        gray_subtrahend = cv2.cvtColor(subtrahend, cv2.COLOR_RGB2GRAY)

        gray_q_resized = cv2.resize(gray_query, (769, 432))
        cv2.imshow('gray query', gray_q_resized)

        gray_f_resized = cv2.resize(gray_subtrahend, (769, 432))
        cv2.imshow('gray frame', gray_f_resized)

        # apply gaussian blur
        gray_query = cv2.GaussianBlur(gray_query, (3,3), 0)
        gray_subtrahend = cv2.GaussianBlur(gray_subtrahend, (3,3), 0)

        # cut the black area from the subtrahend image
        gray_subtrahend[gray_query == 0] = 0

        # calculate diff
        diff = cv2.absdiff(gray_subtrahend, gray_query)
        diff_h, diff_w = diff.shape

        # TEST
        diff_resized_0 = cv2.resize(diff, (769, 432))
        cv2.imshow('test bin 0', diff_resized_0)

        # leave only the correct grayscale values for each of the target's rings
        combined_diff = np.zeros((diff_h, diff_w), dtype=diff.dtype)
        # grayscale_threshold = 20

        # for i in range(len(palette)):
        #     grayscale_shade = palette[i]
        #     ring_img = diff.copy()

        #     # threshold only the color that fits the particular ring
        #     ring_img[self.distances[1] > (i + 1) * self.ring_diam] = 0
        #     ring_img[self.distances[1] < i * self.ring_diam] = 0
        #     minThresh = grayscale_shade - grayscale_threshold
        #     maxThresh = grayscale_shade + grayscale_threshold
        #     _, ring_img = cv2.threshold(ring_img, minThresh, maxThresh, cv2.THRESH_BINARY)
        #     combined_diff = np.maximum(combined_diff, ring_img)

        _, diff = cv2.threshold(diff, 0x46, 0xff, cv2.THRESH_BINARY)
        kernel = np.ones((5,5), np.uint8)
        diff = cv2.morphologyEx(diff, cv2.MORPH_OPEN, kernel)
        diff = cv2.morphologyEx(diff, cv2.MORPH_CLOSE, kernel)

        # TODO TEST
        diff_resized_1 = cv2.resize(diff, (769, 432))
        cv2.imshow('test bin 1', diff_resized_1)

        return diff

    def _filter_homogeneous_contours(self, samples, threshold):
        '''
        Filter out any duplicated contour that is just a continuation of another contour.
        If such two homogenous contours are detected, the one that's closer to the target's bull'seye remains.

        Parameters:
            {list} samples - [
                                {tuple} (
                                           {tuple} (
                                                      {Number} x coordinates of point A (from one edge of the contour),
                                                      {Number} y coordinates of point A (from one edge of the contour)
                                                   )
                                           {tuple} (
                                                      {Number} x coordinates of point B (from the other edge of the contour),
                                                      {Number} y coordinates of point B (from the other edge of the contour)
                                                   )
                                           {Number} The minimum distance of the contour from the target's bullseye
                                        )
                                ...
                             ]
            {Number} threshold - The smaller this number is, the more contours will be filtered

        Returns:
            {list} A list of the contours that remained after filtering out the homogenous ones.
        '''

        def _check_homogeneity(point_A, point_B, sample, threshold):
            '''
            Check if two contours are homogenous.

            Parameters:
                {tuple} point_A - (
                                     {Number} x coordinates of the first point from the first contours
                                     {Number} y coordinates of the first point from the first contours
                                  )
                {tuple} point_B - (
                                     {Number} x coordinates of the second point from the first contours
                                     {Number} y coordinates of the second point from the first contours
                                  )
                {tuple} sample - (
                                    {Number} x coordinates of the sample point from the second contours
                                    {Number} y coordinates of the sample point from the second contours
                                 )
                {Number} threshold - The maximum area of the triangle that's created
                                     between two points from one contour and one point from the other

            Returns:
                {Boolean} True if both contours are homogenous.
            '''

            Ax = point_A[0]
            Ay = point_A[1]
            Bx = point_B[0]
            By = point_B[1]
            Cx = sample[0]
            Cy = sample[1]
            AB = ((Ax - Bx) ** 2 + (Ay - By) ** 2) ** .5
            BC = ((Bx - Cx) ** 2 + (By - Cy) ** 2) ** .5
            AC = ((Ax - Cx) ** 2 + (Ay - Cy) ** 2) ** .5
            s = (AB + BC + AC) / 2
            triangle_area = (s * (s - AB) * (s - BC) * (s - AC)) ** .5

            return triangle_area < threshold
        
        res = []
        for contour in samples:
            is_homogeneous = False

            for sample in samples:
                if sample == contour:
                    continue

                elif _check_homogeneity(contour[0], contour[1], sample[0], threshold):
                    

                    # distance from this contour to the center
                    a_center_dist = ((contour[2][0] - self.bullseye[0]) ** 2 + (contour[2][1] - self.bullseye[1]) ** 2) ** .5

                    # distance from sample contour to the center
                    s_center_dist = ((sample[2][0] - self.bullseye[0]) ** 2 + (sample[2][1] - self.bullseye[1]) ** 2) ** .5

                    # maximal distance from this contour to sample contour
                    b_s_dist = ((contour[1][0] - sample[2][0]) ** 2 + (contour[1][1] - sample[2][1]) ** 2) ** .5
                    
                    # both contours are on the same side of the target,
                    # i.e represent the same projectile
                    if b_s_dist <= a_center_dist:
                        is_homogeneous = a_center_dist >= s_center_dist

                        # this contour is closer
                        if not is_homogeneous:
                            samples.remove(sample)

                        # sample contour is closer
                        else:
                            samples.remove(contour)
                            break
            
            if not is_homogeneous:
                res.append(contour[2])

        return res

    def _find_hit_distances(self, img):
        '''
        Detect all the hits on the target.

        Paramters:
            {Numpy.array} The target image with its background subtracted [grayscale]
        
        Returns:
            {list} [
                      {tuple} (
                                 {Number} x coordinates of the hit,
                                 {Number} y coordinates of the hit,
                                 {Number} The distance of the hit from the bull'seye
                              )
                      ...
                   ]
        '''

        # find the outer ring and delete everything outside of it
        img_color = None
        circles = cv2.HoughCircles(img, cv2.HOUGH_GRADIENT, 1, 20,
                                   param1=50, param2=30, minRadius=0, maxRadius=int(self.estimated_radius))

        if type(circles) != type(None):
            outerCircle = sorted(circles[0], key=lambda x: x[2])[::-1][0]
            radius = outerCircle[2]
            img_color = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
            xy = (self.bullseye[0], self.bullseye[1])
            cv2.circle(img_color, xy, radius, (0x0,0xff,0x0), thickness=5)
        # use an estimation of the target's radius as a fallback
        else:
            radius = self.estimated_radius

        img[self.distances[1] > radius] = 0

        if type(img_color) != type(None):
            img_color[self.distances[1] > radius] = 0

            # TODO TEST
            radius_clean = cv2.resize(img_color, (769, 432))
            cv2.imshow('radius clean', radius_clean)

        # find the straight segments in the image
        rho = 2
        theta = np.pi / 180
        threshold = 250
        lines = cv2.HoughLinesP(img, rho, theta, threshold)
        blank_img = np.zeros(img.shape, dtype=img.dtype)

        if type(lines) != type(None):
            for line in lines:
                for x1,y1,x2,y2 in line:
                    cv2.line(blank_img, (x1, y1), (x2, y2), (0xff,0xff,0xff), 5)

        img = blank_img

        # TODO TEST
        solo_lines = cv2.resize(blank_img, (769, 432))
        cv2.imshow('solo lines', solo_lines)
        
        # detect all contours inside the circle
        contours = cv2.findContours(img, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)[-2:]

        # detect the unconvex contours (true projectile contours)
        def _contour_distances_from(contour_points, point):
            '''
            calculate the distance of each point from the contour to another given point

            Parameters:
                {list} [
                          {tuple} (
                                     {Number} x coordinates of the hit,
                                     {Number} y coordinates of the hit,
                                     {Number} any value
                                  )
                          ...
                       ]
                {tuple} (
                           {Number} x coordinates of the point from which to measure the distance,
                           {Number} y coordinates of the point from which to measure the distance
                        )

            Returns:
                {list} [
                          {tuple} (
                                     {Number} x coordinates of the hit,
                                     {Number} y coordinates of the hit,
                                     {Number} The distance of the point from the given parameter point
                                  )
                          ...
                       ]
            '''

            for p in contour_points:
                p[2] = ((p[0] - point[0]) ** 2 + (p[1] - point[1]) ** 2) ** .5

            return sorted(points, key=lambda x: x[2])

        def _is_rect(cont, A, B, samples):
            '''
            Check if a contour is curved.

            Parameters:
                {Numpy.array} cont - The contour to check
                {tuple} A - Point from one edge of the contour
                            (
                                {Number} x coordinates of the point
                                {Number} y coordinates of the point
                            )
                {tuple} B - Point from the other edge of the contour
                            (
                                {Number} x coordinates of the point
                                {Number} y coordinates of the point
                            )
                {Number} samples - amount of samples to take.
                                   The more samples, the more precise and reliable is the result.
            '''

            x_distance = B[0] - A[0]
            y_distance = B[1] - A[1]
            x_step = x_distance / samples
            y_step = y_distance / samples

            # contour is a very small square
            if (x_step == 0 or y_step == 0):
                return False

            x_vals = np.arange(A[0], B[0], x_step)
            y_vals = np.arange(A[1], B[1], y_step)
            points = [(x,y) for x, y in zip(x_vals, y_vals)]

            for p in points:
                # check if point is outside the contour
                if cv2.pointPolygonTest(cont, p, False) < 0:
                    return False
            
            return True

        homogeneous_samples = []
        not_oval = []
        res = []
        for cont in contours[0]:
            # cont = cv2.convexHull(cont)

            # epsilon = cv2.arcLength(cont, True) * .2
            # cont = cv2.approxPolyDP(cont, epsilon, True)

            points = [[cont[m][0][0], cont[m][0][1], 0] for m in range(len(cont))]
            point_A = points[0] # some random point on the contour

            # find the two furthest points on the contour
            point_B = _contour_distances_from(points, point_A)[::-1][0]
            point_A = _contour_distances_from(points, point_B)[::-1][0]

            # calculate the point between the two
            point_C = ((point_A[0] + point_B[0]) / 2, (point_A[1] + point_B[1]) / 2)
            
            # if this point is outside the contour, it's convex,
            # if it's inside it, the contour is relatively straight
            # if cv2.pointPolygonTest(cont, point_C, False) >= 0:
            if _is_rect(cont, point_A, point_B, 5):
                not_oval.append(cont)
                hit = _contour_distances_from(points, self.bullseye)[0]
                res_x = (hit[0] - self.vertices[0][0]) * self.scale[0] + self.vertices[0][0]
                res_y = (hit[1] - self.vertices[0][1]) * self.scale[1] + self.vertices[0][1]
                res_dist = ((hit[0] - self.bullseye[0]) ** 2 + (hit[1] - self.bullseye[1]) ** 2) ** .5
                res_hit = (res_x,res_y,res_dist)
                res.append(res_hit)
                # homogeneous_samples.append((point_A, point_B, hit))

        # filter all the contours are actually of the same object
        # res = self._filter_homogeneous_contours(homogeneous_samples, 1000)

        # TODO TEST
        blank = np.zeros(img.shape, dtype=img.dtype)
        blank = cv2.cvtColor(blank, cv2.COLOR_GRAY2RGB)
        cv2.drawContours(blank, not_oval, -1, (0, 255, 0), 2)
        contour_homogenous_resize = cv2.resize(blank, (769, 432))
        cv2.imshow('homogenous lines', contour_homogenous_resize)

        # straighten the target's oval and find the real hit values
        # for hit in res:
        #     hit[0] = (hit[0] - self.vertices[0][0]) * self.scale[0] + self.vertices[0][0]
        #     hit[1] = (hit[1] - self.vertices[0][1]) * self.scale[1] + self.vertices[0][1]
        #     hit[2] = ((hit[0] - self.bullseye[0]) ** 2 + (hit[1] - self.bullseye[1]) ** 2) ** .5
            
        return res

    def process(self, warped_img, frame, grayscale_palette):
        '''
        Process the target image and find its exact hits.

        Parameters:
            {Numpy.array} warped_img - The model image applied with homography
            {Numpy.array} frame - The taken shot of the actual target
            {list} grayscale_palette - A list that consists of the grayscale values that should be remained
                                       after the subtraction of the actual target's image from the model image

        Returns:
            {list} A list of the detected hits on the target
                [
                   {tuple} (
                              {Number} x coordinates of the hit,
                              {Number} y coordinates of the hit,
                              {Number} The distance of the hit from the bull'seye
                           )
                   ...
                ]
        '''

        binary_target = self._subtract_background(warped_img, frame, grayscale_palette)
        hits_data = self._find_hit_distances(binary_target)
        return hits_data

    def get_scale(self):
        '''
        Returns:
            {tuple} (
                       {Number} The average size of the horizontal transformed edges divided by
                                the average size of the vertical transformed edges (width / height ratio),
                       {Number} The average size of the vertical transformed edges divided by
                                the average size of the horizontal transformed edges (height / width ratio),
                       {Number} The estimated size of the homography transformation
                                divided by the estimated size of the target model
                                (transformed size / actual size ratio)
                    )
        '''

        return self.scale