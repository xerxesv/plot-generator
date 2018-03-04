document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('container'); 
  var html = 'test';
  var child = document.createElement('div');
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'embed', true);

  xhr.onload = function () {
    if (xhr.status === 200) {
      try {              
        html = xhr.responseText;
      }
      catch (error) {
        console.log( 'bad json' );
        
      }            
    }
    else {           
     console.log('bad xhr request. status: ' + xhr.status);           
    }

    // console.log( html );
    // html = '<p>Just some <span>text</span> here</p>';
    child.innerHTML = html;
    child = child.firstChild;
    container.appendChild(child);
  }
  xhr.send();
})