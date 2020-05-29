import cv2

def draw_meta_data(img, total_score, target_scale):
    '''
    Draw some data about the algorithm's process on the filmed frame.
    This function draws the total detected score and the scale ratio of the frame,
    relative to the input model image.

    Parameters:
        {Numpy.array} img - The frame image on which to draw the data
        {Number} total_score - The sum of all scores detected in the frame
        {Number} target_scale - The size of the filmed target divided by the model target
    '''

    text_outline = (0xff,0xff,0xff)
    text_foreground = (0x0,0x0,0x0)
    cv2.putText(img, 'Total Score: ' + str(total_score), (30, 80), cv2.FONT_HERSHEY_SIMPLEX, 2, text_outline, thickness=12)
    cv2.putText(img, 'Total Score: ' + str(total_score), (30, 80), cv2.FONT_HERSHEY_SIMPLEX, 2, text_foreground, thickness=4)
    cv2.putText(img, 'Target scale: ' + str(target_scale), (1300, 80), cv2.FONT_HERSHEY_SIMPLEX, 2, text_outline, thickness=12)
    cv2.putText(img, 'Target scale: ' + str(target_scale), (1300, 80), cv2.FONT_HERSHEY_SIMPLEX, 2, text_foreground, thickness=4)

def mark_hits(img, hits):
    '''
    Mark a hit on the filmed frame.

    Parameters:
        {Numpy.array} img - The frame image on which to draw the hit
        {tuple} hits - (
                            {Number} x coordinates of the hit,
                            {Number} y coordinates of the hit,
                            {Number} The hit's score according to the target's data
                        )
    '''

    outline = (0x0,0x0,0x0)
    forground = (0xff,0xff,0xff)

    for hit in hits:
        x, y = hit[0][0], hit[0][1]
        score_string = str(hit[1]) if (hit[1] > 0) else 'miss'
        cv2.circle(img, (x,y), 15, outline, 13)
        cv2.circle(img, (x,y), 10, forground, 10)
        cv2.putText(img, score_string, (x,y - 20), cv2.FONT_HERSHEY_PLAIN, 5, outline, thickness=15)
        cv2.putText(img, score_string, (x,y - 20), cv2.FONT_HERSHEY_PLAIN, 5, forground, thickness=5)