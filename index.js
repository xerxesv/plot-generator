require('dotenv').config();
const path = require('path');
const PORT = process.env.PORT || 2000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const express = require('express');
const cors = require('cors');
const https = require('https');
const Papa = require('papaparse');

const getFields = require('./services/get-fields');

const app = express();

app
	.use(cors())
	.use(express.static(path.join(__dirname, 'public')))
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'ejs');


// index route
app.get('/', getFields, (req, res, next) => {
	let data = res.data;
	data.PUBLIC_URL = process.env.PUBLIC_URL;
	res.render('index', data);
});

// embed route
app.get('/embed', getFields, (req, res, next) => {
	let data = res.data;
	data.PUBLIC_URL = process.env.PUBLIC_URL;

	res.render('embed', res.data, (err, html) => {
		var maybejson = {
			html: html
		};
		if (NODE_ENV==='development') {
			console.log('sending embed');
			console.log(html);			
		}
		res.send(html);
	});
});

// fields route
app.get('/fields', getFields, (req, res, next) => {
	res.send(res.data);
});


// generate route
app.use('/generate', (req, res, next) => {
	const CSV_URL = process.env.CSV_URL;
	https.get( CSV_URL, (response) => {
		let data = {};
		Papa.parse( response, {
			encoding:'utf8',
			header:true,
			fastMode:true,
			step: (row) => {
				// no way to avoid going thru each row to get rid of empty cells
				let rowObject = row.data && row.data[0];
				for (const field in rowObject) {
					if ( rowObject[ field ] ) {
						data[ field ] = (data[field] || []).concat( rowObject[ field ] );
					}
				}
			},
			complete: () => {
				res.data = data;
				next();
			},
			error: (err) => {
				console.log('parser had an error');
				console.log(err);
				next(err)
			}
		})
	})
	.on('error', (err) => {
		next(err);
	})
})

app.get('/generate', (req, res) => {
	const fields = Object.keys(res.data);
	res.data = fields.reduce( (accumulator, field) => {
		let random = Math.floor( Math.random() * res.data[ field ].length );
		accumulator[ field ] = res.data[field][ random ];
		return accumulator;
	}, {})
	res.send(res.data);
});

app.get('/generate/:type', (req, res, next) => {
	const type = req.params.type.replace(/_/g, ' ');
	let random = null;
	if (!res.data[ type ]) {
		let err = new Error('no such type');
		err.httpStatusCode = 400;
		next( err );
	}
	else {
		random = Math.floor( Math.random() * res.data[ type ].length );
		res.data = {
			[ type ] : res.data[ type ][ random ]
		}
		res.send(res.data);
	}
});


// custom error handler middleware whoa 
app.use( (err, req, res, next) => {
  if (res.headersSent) {
		// here, pass to default express error handling mechanism
    return next(err)
  }
  let httpStatusCode = err.httpStatusCode || 500;
  let message = err.message || 'I am error.';
  res.status(httpStatusCode);
  res.send(message);
})


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