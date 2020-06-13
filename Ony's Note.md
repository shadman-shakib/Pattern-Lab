Intro:
--------
Real time facial expression analysis of students to capture their attentiveness during classes.Also this can be use to help teacher if he or she needs to redesign their lecture or not so that students can easily understand the lectures more mannerly.
Machine learning gives computers the ability to make decisions from experience and improve itself without being explicitly coded while image processing is a procedure to extract information from an image by using machine learning algorithms and expression recognition is a way of categorizing images into different sections based on a.person’s facial expression and let computers sense human emotion
Using webcams, we will capture students’ expression and we will divide those facial expressions into two categories–attentive and inattentive. Both happy and neutral faces can be considered as the attentive face which we will determine using prior data(training data)

For this project we are learning MTCNN. 

What is MTCNN ?
---
MTCNN is a python (pip) library written by Github user ipacz, which implements the paper Zhang, Kaipeng et al. “Joint Face Detection and Alignment Using Multitask Cascaded Convolutional Networks.” IEEE Signal Processing Letters 23.10 (2016): 1499–1503. Crossref. Web.  [Source](https://towardsdatascience.com/face-detection-using-mtcnn-a-guide-for-face-extraction-with-a-focus-on-speed-c6d59f82d49)

MTCNN (Multi-task Cascaded Convolutional Neural Networks) is an algorithm consisting of 3 stages, which detects the bounding boxes of faces in an image along with their 5 Point Face Landmarks [link to the paper](https://kpzhang93.github.io/MTCNN_face_detection_alignment/paper/spl.pdf). Each stage gradually improves the detection results by passing it’s inputs through a CNN, which returns candidate bounding boxes with their scores, followed by non max suppression.

In **stage 1** the input image is scaled down multiple times to build an image pyramid and each scaled version of the image is passed through it’s CNN. In **stage 2 and 3** we extract image patches for each bounding box and resize them (24x24 in stage 2 and 48x48 in stage 3) and forward them through the CNN of that stage. Besides bounding boxes and scores, stage 3 additionally computes 5 face landmarks points for each bounding box.

After fiddling around with some MTCNN implementations, it turns out that you can actually get quite solid detection results at much lower inference times compared to SSD Mobilenet v1, even by running inference on the CPU. As an extra bonus, from the 5 Point Face Landmarks we get face alignment for free! This way we don’t have to perform 68 Point Face Landmark detection as an intermediate step before computing a face descriptor.[Source](https://itnext.io/realtime-javascript-face-tracking-and-face-recognition-using-face-api-js-mtcnn-face-detector-d924dd8b5740?gi=43e1bed025ca#:~:text=MTCNN%20%E2%80%94%20Simultaneous%20Face%20Detection%20%26%20Landmarks,(link%20to%20the%20paper).)

It's a Simultaneous Face Detection which runs faster on a CPU. Let's Deep Dive to those 3 stages.
![3 Stage of MTCNN](https://miro.medium.com/max/1400/1*ICM3jnRB1unY6G5ZRGorfg.png " 3 Stage of MTCNN ")

Stage-1:
 ----
1. Pass in image
2. Create multiple scaled copies of the image
3. Feed scaled images into P-Net
4. Gather P-Net output
5. Delete bounding boxes with low confidence
6. Convert 12 x 12 kernel coordinates to “un-scaled image” coordinates
7. Non-Maximum Suppression for kernels in each scaled image
8. Non-Maximum Suppression for all kernels
9. Convert bounding box coordinates to “un-scaled image” coordinates
10. Reshape bounding boxes to square

Stage-2:
----
1. Pad out-of-bound boxes
2. Feed scaled images into R-Net
3. Gather R-Net output
4. Delete bounding boxes with low confidence
5. Non-Maximum Suppression for all boxes
6. Convert bounding box coordinates to “un-scaled image” coordinates
7. Reshape bounding boxes to square

Stage-3:
---
1. Pad out-of-bound boxes
2. Feed scaled images into O-Net
3. Gather O-Net output
4. Delete bounding boxes with low confidence
5. Convert bounding box and facial landmark coordinates to “un-scaled image” coordinates
6. Non-Maximum Suppression for all boxes
