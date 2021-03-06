var PUBLIC_URL = PUBLIC_URL || '';
var loading = false;
var plot = {};

function requestAll (attempts) {
	attempts = attempts || 0;

  var xhr = new XMLHttpRequest();
  // var error = false;
  // var attempts = 0;
  var newPlot = {};
  xhr.open('GET', PUBLIC_URL+'/generate', true);

  xhr.onload = function () {
    
    if (xhr.status === 200) {
      try {              
        newPlot = JSON.parse(xhr.responseText);
        plot = newPlot;
      }
      catch (error) {
        handleError( new Error('bad json') );
        // error = true;
      }            
    }
    else {           
     handleError(new Error('bad xhr request. status: ' + xhr.status));
     // error = true;
    }
    // stop animating plot fields one by one
    // set field text to the appropriate key in plot (or placeholder)
    // bad requests/bad json will just use the old value
    // console.log( newPlot );          
  }

  xhr.send();

  attempts++;

  animateAll();

  function animateAll () {
    // hack - assumes xhr response is available by the time animation is done or it restarts
    $('.plotElement').each( function (index) {
      var $fieldText = $(this).find('.fieldText');
      var delayPerField = index * 200;
      var fieldName = $fieldText.attr('id');

      $fieldText
        .velocity({ rotateX: 1080 }, {
          delay: delayPerField,
          duration:1500, 
          easing:'ease-in-out'
        })
        .velocity('reverse', {easing:'spring', duration:3000});

      $fieldText
        .children('.inner')
        .velocity({opacity:0}, {
          delay: delayPerField + 1500,
          duration:800,
          // queue:false,
          complete:function (elements) {
            var fieldText = newPlot[fieldName];
            if (fieldText) {
              $(elements).removeClass('placeholder').children('.text').text(fieldText)
            }
            else {
              $(elements).text('').removeClass('placeholder').children('.text').text('')
            	requestOne( fieldName, attempts );
            }
          }
        })
        .velocity('reverse', {
          delay:1200,
          duration:100,
          complete:null
        })          

    });
  }
}

function requestOne (fieldName, attempts) {
	attempts = attempts || 0;
	var maxAttempts = 2;
	if (!fieldName) return;
	// if (attempts >= maxAttempts) return;
	const id = fieldName;

  var xhr = new XMLHttpRequest();

  var oneField = {};

  xhr.open('GET', PUBLIC_URL+'/generate/'+id, true);

  xhr.onload = function () {
    
    if (xhr.status === 200) {
      try {              
        oneField = JSON.parse(xhr.responseText);
        plot[fieldName] = oneField[fieldName];
      }
      catch (error) {
        handleError( new Error('bad json') );
        // error = true;
      }            
    }
    else {           
     handleError(new Error('bad xhr request. status: ' + xhr.status));
     // error = true;
    }
    // stop animating plot fields one by one
    // set field text to the appropriate key in plot (or placeholder)
    // bad requests/bad json will just use the old value
    // console.log( oneField );          
  }

  xhr.send();

  // console.log('requestOne attempts: ', attempts);
  animateOne();

  function animateOne () {
    // hack - assumes xhr response is available by the time animation is done or it restarts
    $elementToAnimate = $('#'+id);
    $elementToAnimate
      .velocity({ rotateX: 1080 }, {
        duration:1000, 
        easing:'ease-in-out'
      }) 
      .velocity('reverse', {easing:'spring', duration:3000});

    $elementToAnimate
      .children('.inner')
      .velocity({opacity:0}, {
        delay: 500,
        duration:500
        // queue:false,

      })
      .velocity('reverse', {
        delay:1900,
        duration:100,
        begin:function (elements) {
          // var $text = $(elements).children('text');
          var fieldText = oneField[fieldName];
          attempts++;
          if (fieldText) {
            $(elements).removeClass('placeholder').children('.text').text(fieldText);
          }
          else {
            if (attempts <= maxAttempts) {
              $(elements).removeClass('placeholder').children('.text').text('');
              animateOne( fieldName, attempts);
            }
            else {
              $(elements).addClass('placeholder').children('.text').text('??');
            }
          }
        }
      })     
  }

}

function handleError (err) {
  console.log(err.message || 'I am error');
  console.log(err);
}