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
	let data = {
		fields:res.locals.fields
	};
	data.PUBLIC_URL = process.env.PUBLIC_URL;
	res.render('index', data);
});

// embed route
app.get('/embed', getFields, (req, res, next) => {
	let data = {
		fields: res.locals.fields
	};
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


app.get('/generatorHtml', getFields, (req, res, next) => {
	let data = {
		fields: res.locals.fields
	};
	data.PUBLIC_URL = process.env.PUBLIC_URL;

	res.render('partials/generator', res.data, (err, html) => {
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
	res.send( {fields:res.locals.fields} );
});


// generate route
app.use('/generate', getFields, (req, res, next) => {
	const CSV_URL = process.env.CSV_URL;
	const fields = res.locals.fields; // array of fields, e.g., :["SETTING","PROTAGONIST","CHARACTER DETAIL","INCITING INCIDENT"]
	let isTopRow = true;
	https.get( CSV_URL, (response) => {
		let objectOfCategories = {};
		Papa.parse( response, {
			encoding:'utf8',
			// header:true,
			// do not use fastMode
			// fastMode: true
			step: (row) => {
				if (isTopRow) {
					isTopRow = false; 
					return;
				}
				// no way to avoid going thru each row to get rid of empty cells
				let rowOfColumns = row.data && row.data[0];
				if (NODE_ENV==='development') {
					console.log('row object with metadata:');
					console.log(row);
					console.log('row of columns');
					console.log( rowOfColumns )
				}

				rowOfColumns.forEach( (column, index) => {
					if ( column && column.trim ) {
						column = column.trim();
						objectOfCategories[ fields[index] ] = (objectOfCategories[ fields[index] ] || []).concat( column )
					}
				});
				// for (const field in rowObject) {
				// 	// if (NODE_ENV === 'development') {
				// 	// 	console.log('row:');
				// 	// 	console.log( row );
				// 	// 	console.log('rowObject: ');
				// 	// 	console.log(rowObject);
				// 	// }
				// 	if ( rowObject[ field ] ) {
				// 		data[ field ] = (data[field] || []).concat( rowObject[ field ] );
				// 	}
				// }
			},
			complete: (results, file) => {
				res.locals.objectOfCategories = objectOfCategories;
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
	const objectOfCategories = res.locals.objectOfCategories;
	const fields = res.locals.fields;
	res.data = fields.reduce( (accumulator, field) => {
		let random = Math.floor( Math.random() * objectOfCategories[ field ].length );
		accumulator[ field ] = objectOfCategories[field][ random ];
		return accumulator;
	}, {})
	res.send(res.data);
});

app.get('/generate/:type', (req, res, next) => {
	const objectOfCategories = res.locals.objectOfCategories;
	// do not really need to trim and replace, since the 'types' should be created from the transformed 'fields' in the csv file already
	const type = req.params.type.trim().replace(/[^a-zA-Z\d]/g, '_');
	let random = null;
	if (!objectOfCategories[ type ]) {
		let err = new Error('no such type');
		err.httpStatusCode = 400;
		next( err );
	}
	else {
		random = Math.floor( Math.random() * objectOfCategories[ type ].length );
		res.data = {
			[ type ] : objectOfCategories[ type ][ random ]
		}
		res.send(res.data);
	}
});


// custom error handler middleware whoa 
app.use( (err, req, res, next) => {
	console.log('ERRORRR!!');
	console.log(err);
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