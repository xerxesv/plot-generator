// function parse_csv (csv) {
// 	csv = csv || '';
// 	let rows = csv.split(/\r/);
// 	let columns = null;
// 	// if that doesn't work (we only have one line), try [\r\n]. This may not give the right number of lines, but should work
// 	if (rows.length == 1) {
// 		rows = csv.split(/[\r\n]/);
// 	}
// 	columns = rows[0];
// }

// module.exports = parse_csv;