const video = document.getElementById('video')
let result
let name
let expression
let angry
let disgusted
let fearful
let happy
let neutral
let sad
let surprised

Promise.all([

  //For face recognition, a ResNet-34 like architecture is implemented to compute a face descriptor
  // (a feature vector with 128 values) from any given face image, which is used to describe the characteristics of a persons face. 
  faceapi.nets.faceRecognitionNet.loadFromUri('/capstone/models'),

  //This package implements a very lightweight and fast, yet accurate 68 point face landmark detector.
  faceapi.nets.faceLandmark68Net.loadFromUri('/capstone/models'),

  //The neural net will compute the locations of each face in an image and will return the bounding boxes together with it's probability for each face.
  faceapi.nets.ssdMobilenetv1.loadFromUri('/capstone/models'), // Single Shot Multibox Detector.
    
  //The Tiny Face Detector is a very performant, realtime face detector, which is much faster, smaller 
  //and less resource consuming compared to the SSD Mobilenet V1 face detector, in return it performs slightly less well on detecting small faces.
  faceapi.nets.tinyFaceDetector.loadFromUri('/capstone/models'),

  //The face expression recognition model is lightweight, fast and provides reasonable accuracy.
  faceapi.nets.faceExpressionNet.loadFromUri('/capstone/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

//play live video
video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  //const labeledFaceDescriptors = loadLabeledImages()
  setInterval(async () => {
    
    //To perform face recognition, one can use faceapi.FaceMatcher to compare reference face descriptors to query face descriptors.
    const labeledFaceDescriptors = await loadLabeledImages() 
    
    // create FaceMatcher with automatically assigned labels
    // from the detection results for the reference image
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()
    
    // resize the detected boxes and landmarks in case your displayed image has a different size than the origi
    
    const detectionsWithExpressions = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detectionsWithExpressions, displaySize)

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))


    


    let flag1 = 0
    let flag2 = 0
    
    try {
      resizedDetections[0].expressions
      flag1=1
    }
    catch{
        console.log("Expression not found")
    }
    if (flag1==1) {
      expression = resizedDetections[0].expressions
      console.log(resizedDetections[0].expressions)
      angry = expression.angry
      disgusted = expression.disgusted
      fearful = expression.fearful
      happy = expression.happy
      neutral = expression.neutral
      sad = expression.sad
      surprised = expression.surprised
  

      if(angry >= 0.50){
        express = "Angry"
      } else if(disgusted >= 0.50){
        express ="Disgusted"
      } else if(fearful >= 0.50){
        express = "Fearful"
      } else if(happy>=0.50){
        express = "Happy"
      } else if(neutral>=0.50){
        express = "Neutral"
      } else if(sad>=0.50){
        express = "Sad"
      } else if(surprised>=0.50){
        express = "Surprised"
      }
      else{
        express = "Unknown"
      }
    }
    try {
      results[0].toString()
      flag2=1
    } catch {
      console.log("Face not found")
    }
    if (flag2==1) {
      name = results[0].toString()
      console.log(results[0].toString())
    }
    if (flag1 == 1 && flag2 == 1){
      insert(name,express,angry,disgusted,fearful,happy,neutral,sad,surprised)
    }

    
  }, 500)
})

function loadLabeledImages() {
  const labels = ['Rabbi', 'Ruhul','Shadman'] //add new lebeled folder here
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 3; i++) {
        //fetching data from online. you can replace this with local directory
        const img = await faceapi.fetchImage(`/capstone/labeled_images/${label}/${i}.jpg`) 
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
        console.log("Training...")
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

function insert(name,express,angry,disgusted,fearful,happy,neutral,sad,surprised) {
  $.ajax({
    type: 'POST',
    url: 'insert.php',
    data: {
        name:name,
        express:express,
        angry:angry,
        disgusted:disgusted,
        fearful:fearful,
        happy:happy,
        neutral:neutral,
        sad:sad,
        surprised:surprised
    },
    error: function (xhr, status) {
        // alert(status);
    },
    success: function(response) {
        // alert(response);
        //alert("Status Accepted");
        //alert(response);
        //location.reload();
    }
  });
  }
