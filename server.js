const Express = require('express');
let app = new Express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let fs = require('fs')

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/data.json', function(req, res) {
    res.sendFile(__dirname + '/data.json');
});

app.use(Express.static(__dirname+'/public'));

io.on('connection', function(socket) {
    socket.on('review uploaded', function(fname, lname, experience, city, country, years, text) {
        io.emit('review uploaded', fname, lname, experience, city, country, years, text);

        fs.readFile('data.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
            obj = JSON.parse(data); //now it an object

            obj.table.push({
                "fname": fname,
                "lname": lname,
                "experience": experience,
                "city": city,
                "country": country,
                "years": years,
                "text": text
            });

            let callback = function(err, result) {
                if(err) console.log('error', err);
            };

            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile('data.json', json, 'utf8', callback); // write it back 
        }});
    });
});

http.listen(8080, function() {
    console.log('listening on 8080');
});