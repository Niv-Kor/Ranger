import numpy as np
import cv2

def ratio_match(matcher, query_desc, train, ratio):
    '''
    Find feature matches between two images.

    Parameters:
        {Object} matcher - The matcher to use in order to detect keypoints and compute the train image's description
        {list} query_desc - The computed description of the query image
        {Numpy.array} train - Train image
        {Number} ratio - The percentage above which all matches are ignored [0-1]

    Returns:
        {tuple} (
                   {list} A list of the best found matches (under the ratio condition),
                   {tuple} (
                              {list} The keypoints of the train image,
                              {list} The description of the train image
                           )
                )
    '''

    train_keys, train_desc = matcher.detectAndCompute(train, None)
    bf = cv2.BFMatcher(crossCheck=False)
    best_match = []
    
    if type(train_desc) != type(None):
        # apply ratio test
        matches = bf.knnMatch(query_desc, train_desc, k=2)

        try:
            for m1, m2 in matches:
                if m1.distance < ratio * m2.distance:
                    best_match.append(m1)
        except ValueError:
            return [], ([], [])

    return best_match, (train_keys, train_desc)

def calc_homography(query_keys, train_keys, matches):
    '''
    Calculate the homography of a query image over a train image.

    Parameters:
        {list} query_keys - The keypoints of the query image
        {list} query_desc - The computed description of the query image
        {list} matches - The detected matches between the query and the train images

    Returns:
        {Numpy.array} A 3x3 array representing the query image's homography, or None if no matches exist.
    '''

    if not len(matches):
        return None

    # reshape keypoints
    src_pts = np.float32([query_keys[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
    dst_pts = np.float32([train_keys[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

    # find homography and apply transformation
    H, _ = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5)
    return H

def is_true_homography(vertices, edges, img_size):
    '''
    Check if an homography is good enough or rather relying on too many outliers.

    Parameters:
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
                                   ...
        {tuple} edges - (
                           {Number} The length of AB edge,
                           {Number} The length of BC edge,
                           {Number} The length of CD edge,
                           {Number} The length of DA edge
                        )
        {tuple} img_size - (
                              {Number} The height of the image the was applied with homography,
                              {Number} The width of the image the was applied with homography
                           )
    '''

    A = vertices[0]
    B = vertices[1]
    C = vertices[2]
    D = vertices[3]
    E = vertices[4]
    upsidedown = B[0] < A[0]

    if upsidedown:
        c_ordered = C[0] < D[0] and C[1] < B[1]
        d_ordered = D[1] < A[1]
        e_ordered = E[0] < D[0] and E[0] > B[0]
    else:
        c_ordered = C[0] > D[0] and C[1] > B[1]
        d_ordered = D[1] > A[1]
        e_ordered = E[0] > D[0] and E[0] < B[0]

    ab = edges[0]
    bc = edges[1]
    cd = edges[2]
    da = edges[3]

    strech_threshold = .2
    unstretched_hor = ab / cd >= 1 - strech_threshold and ab / cd <= 1 + strech_threshold
    unstretched_ver = bc / da >= 1 - strech_threshold and bc / da <= 1 + strech_threshold

    unstretched = unstretched_hor and unstretched_ver
    all_ordered = c_ordered and d_ordered and e_ordered
    vals_arr = np.array([A[0],A[1],B[0],B[1],C[0],C[1],D[0],D[1],E[0],E[1]])
    out_of_bounds = (vals_arr < 0).any() or (vals_arr > max(img_size[0], img_size[1])).any()

    return unstretched and all_ordered and not out_of_bounds