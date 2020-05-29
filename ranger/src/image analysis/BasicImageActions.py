from PIL import Image
import numpy as np
import cv2

def zero_pad_as(img, padding_shape):
    '''
    Apply an image with zero padding, up to given size.
    The image is placed in the center of the new created one.

    Parameters:
        {Numpy.array} img - The image to which the zero padding should be applied
        {tuple} padding_shape - (
                                   {Number} The desired new height of the image,
                                   {Number} The desired new width of the image
                                )

    Returns:
        {tuple} (
                   {Numpy.array} An array consisting 5 of the small image's anchor points
                                 (in the center of the larger padded image).
                                 E.g: A ----------- B
                                      |             |
                                      |      E      |
                                      |             |
                                      D ----------- C

                                [
                                   (
                                      {Number} x coordinates of the point,
                                      {Number} y coordinates of the point
                                   ),
                                   ...
                                ],
                   {Numpy.array} The newly created padded image (with the orignal image in the center)
                )
    '''

    img_h, img_w, _ = img.shape
    p_h, p_w, _ = padding_shape
    vertical = int((p_h - img_h) / 2)
    horizontal = int((p_w - img_w) / 2)
    a = (horizontal,vertical)
    b = (horizontal + img_w,vertical)
    c = (horizontal + img_w,vertical + img_h)
    d = (horizontal,vertical + img_h)
    e = (int(horizontal + img_w / 2),int(vertical + img_h / 2))
    pad_img = cv2.copyMakeBorder(img, vertical, vertical, horizontal, horizontal, cv2.BORDER_CONSTANT)
    anchor_points = [a, b, c, d, e]

    return anchor_points, pad_img

def calc_vertices_and_edges(transform):
    '''
    Take a prespective transformation and extract the position of its vertices
    and the lengths of its edges.

    Parameters:
        {Numpy.array} transform - The prespective transform product of an image

    Returns:
        {tuple} (
                   {tuple} A, B, C, D, E vertices (respectively) of the transformation
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
                   {tuple} (
                              {Number} The length of AB edge,
                              {Number} The length of BC edge,
                              {Number} The length of CD edge,
                              {Number} The length of DA edge
                           )
                )
    '''

    vertices = [transform[m][0] for m in range(len(transform))]
    A = vertices[0]
    B = vertices[1]
    C = vertices[2]
    D = vertices[3]
    ab = (((A[0] - B[0]) ** 2) + ((A[1] - B[1]) ** 2)) ** .5
    bc = (((B[0] - C[0]) ** 2) + ((B[1] - C[1]) ** 2)) ** .5
    cd = (((C[0] - D[0]) ** 2) + ((C[1] - D[1]) ** 2)) ** .5
    da = (((D[0] - A[0]) ** 2) + ((D[1] - A[1]) ** 2)) ** .5

    return vertices, (ab, bc, cd, da)