const https = require('https');
const Papa = require('papaparse');

const getFields = function (req, res, next) {
  const CSV_URL = process.env.CSV_URL;
  https.get( CSV_URL, (response) => {
    let fields = [];
    Papa.parse( response, {
      encoding:'utf8',
      // do not use fastMode here
      // fastMode: true,
      step: (row, parser) => {
        fields = row.data[0].map( (field) => {return field.trim().replace(/[^a-zA-Z\d]/g, '_') } );
        if (process.env.NODE_ENV === 'development') {
            console.log('row:');
            console.log( row );
            console.log('rowObject (row.data[0]): ');
            console.log(row.data[0]);          
        }
        parser.abort();
      },
      complete: () => {
        // console.log('all done');
        // console.log(fields);
        res.locals.fields = fields;
        // res.data = {
        //   fields: fields
        // };
        next();
      },
      error: (err) => {
        console.log('fields parser had an error');
        console.log(err);
        next(err);
      }
    })
  })
  .on('error', (err) => {
    next(err);
  });
}

module.exports = getFields;