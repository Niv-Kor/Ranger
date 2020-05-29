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

def get_projectile_complement_palette(target_img, bullseye, diam, amount, proj_color):
    '''
    Find the exact grayscale colors that are a product of subtracting the projectile
    image from the target image.
    Each of the target's rings returns a different color,
    according to its absolute difference from the projectile's color at its specific location.

    E.g: a target with 10 rings will return a list of 10 grayscale colors (valued 0-255),
    where the first color refers to the difference inside the most inner ring, and so on.

    Paremeters:
        {Numpy.array} target_img - The image from which to extract the palette
        {tuple} bullseye - (
                              {Number} x coordinates of the target's bullseye point,
                              {Number} y coordinates of the target's bullseye point
                           )
        {Number} diam - The diameter of the target's inner ring
        {Number} amount - The amount of colors to extract from the image
        {Number} proj_color - The grayscale value of the projectile that hits the target [0-255]

    Returns:
        {list} A list of the projectile's complementary grayscale shades over the target.
    '''

    def _extract_grayscale_palette(target, bullseye, diam, rings):
        '''
        Get a list of an image's most dominant colors.

        Parameters:
            {Numpy.array} target - The image from which to extract the colors [RGB]
            {tuple} bullseye - (
                                  {Number} x coordinates of the target's bullseye point,
                                  {Number} y coordinates of the target's bullseye point
                               )
            {Number} diam - The diameter of the target's inner ring
            {Number} rings - Amount of rings in the target

        Returns:
            {list} A list of the image's most dominant colors.
        '''

        blurred = cv2.GaussianBlur(target, (7,7), 10)

        # calculate distance of each pixel from the bullseye point
        h, w, _ = blurred.shape
        dx = np.arange(w)
        dy = np.arange(h)
        X, Y = np.meshgrid(dx, dy)
        distances = ((X - bullseye[0]) ** 2 + (Y - bullseye[1]) ** 2) ** .5
        palette = []
        
        for i in range(rings):
            # isolate the relevant ring
            ring_img = blurred.copy()
            ring_img[distances > (i + 1) * diam] = 255
            ring_img[distances < i * diam] = 255
            
            # convert to PIL image and calculate the most dominant color of the ring
            pil_img = Image.fromarray(ring_img, 'RGB')
            pil_img = pil_img.quantize(2)
            wide_palette = pil_img.getpalette()
            palette.append(wide_palette[3:6])
        
        return palette

    arr = []
    palette = _extract_grayscale_palette(target_img, bullseye, diam, amount)
    arr.append(palette)
    palette = np.array(arr)

    # convert to an actual cv2 image
    palette_img = np.ndarray((3, 1, amount), dtype=int)
    palette_img = palette_img.astype(np.uint8)
    palette_img_r, palette_img_g, palette_img_b = palette_img
    palette_img = np.dstack([palette_img_r, palette_img_g, palette_img_b])

    for i in range(len(palette_img[0])):
        palette_img[0][i] = palette[0][i]

    # convert all colors in the palette to grayscale
    palette_img = cv2.cvtColor(palette_img, cv2.COLOR_RGB2GRAY)

    # subtract the colors in the pallete from the projectile's color
    subtracted_colors = []
    for gray in palette_img[0]:
        subtracted_colors.append(abs(proj_color - gray))
        
    return subtracted_colors