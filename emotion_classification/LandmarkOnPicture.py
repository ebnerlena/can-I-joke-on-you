import cv2
import mediapipe as mp

# Initialize MediaPipe FaceMesh components
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

def extract_face_landmarks(image_path):
    # Load image
    image = cv2.imread(image_path)
    height, width, _ = image.shape

    # Convert BGR image to RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Initialize MediaPipe FaceMesh
    with mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        min_detection_confidence=0.5) as face_mesh:

        # Process the image
        results = face_mesh.process(image_rgb)

        # Draw landmarks on the image
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                mp_drawing.draw_landmarks(image, face_landmarks)

        # Convert BGR image back to RGB for displaying
        image_bgr = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Display the image
        cv2.imshow('Face Landmarks', image_bgr)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

# Example usage
extract_face_landmarks('Aaron_Eckhart_0001.jpg')
