import cv2
import time
import imutils

# Start webcam
camera = cv2.VideoCapture(0)

time.sleep(2)  # Camera warm-up

first_frame = None

while True:
    # Read frame
    ret, frame = camera.read()

    # Resize frame
    frame = imutils.resize(frame, width=500)

    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian Blur
    gray = cv2.GaussianBlur(gray, (21, 21), 0)

    # Store first frame
    if first_frame is None:
        first_frame = gray
        continue

    # Find difference between first frame and current frame
    frame_diff = cv2.absdiff(first_frame, gray)

    # Convert difference to black & white
    thresh = cv2.threshold(frame_diff, 25, 255, cv2.THRESH_BINARY)[1]

    # Dilate image to fill gaps
    thresh = cv2.dilate(thresh, None, iterations=2)

    # Find contours
    contours, _ = cv2.findContours(
        thresh.copy(),
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    # Draw rectangle around moving object
    for contour in contours:

        # Ignore small movements
        if cv2.contourArea(contour) < 1000:
            continue

        (x, y, w, h) = cv2.boundingRect(contour)

        cv2.rectangle(
            frame,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            2
        )

    # Show webcam
    cv2.imshow("Motion Detection", frame)

    # Press q to quit
    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break

# Release camera
camera.release()
cv2.destroyAllWindows()