const path = require('path');
const PORT = process.env.PORT || 2000;
const express = require('express');
const https = require('https');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
  // .set('views', path.join(__dirname, 'views'))
  // .set('view engine', 'ejs')
  // .get('/', (req, res) => res.render('pages/index'))
  // .get('/cool', (req, res) => res.send( cool() ) )
	// .get('/times', function(request, response) {
	//     var result = ''
	//     var times = process.env.TIMES || 5
	//     for (i=0; i < times; i++)
	//       result += i + ' ';
	//   response.send(result);
	// })

app.get('/generate', (req, res) => {
	 res.send('Birds home page');
});
app.get('/generate/:type', (req, res) => {
	res.send('generate ' + req.params.type)
});
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

/*
path.join():
		var path = require('path');
		var x = path.join('Users', 'Refsnes', '..', 'demo_path.js');
		console.log(x);

		output:
		C:\Users\My Name>node demo_met_path_join2.js
		Users\demo_path.js
*/