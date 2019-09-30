const Express = require('express');
let app = new Express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let fs = require('fs')

const MAX_REVIEWS = 20;
const JSON_FILE = 'data.json'

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get(JSON_FILE, function(req, res) {
    res.sendFile(__dirname + JSON_FILE);
});

app.use(Express.static(__dirname+'/public'));

let initial_load = () => {
    fs.readFile(JSON_FILE, 'utf8', (err, data) => {
        let obj;

        if (err){
            console.log(err);
        } else {
            obj = JSON.parse(data);
        }

        if (obj.table.length > MAX_REVIEWS)
        {
            obj.table = obj.table.slice(0, MAX_REVIEWS);
        }

        io.emit('initial load', obj.table);

        return false;
    });
}

let append_to_json = function(fname, lname, experience, city, country, years, text)
{
    fs.readFile(JSON_FILE, 'utf8', (err, data) => {
        let obj;

        if (err){
            console.log(err);
        } else {
            obj = JSON.parse(data);
        }

        if (obj.table.length > MAX_REVIEWS)
        {
            obj.table = obj.table.slice(0, MAX_REVIEWS);
        }

        obj.table.unshift({
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
        fs.writeFile(JSON_FILE, json, 'utf8', callback); // write it back

        io.emit('initial load', obj.table);

        return false;
    });
};

io.on('connection', function(socket) {

    initial_load();
    socket.on('review uploaded', function(fname, lname, experience, city, country, years, text) {

        fname = fname.toLowerCase().replace(/^\w/, c => c.toUpperCase());
        lname = lname.toLowerCase().replace(/^\w/, c => c.toUpperCase());
        experience = experience;
        city = city.toLowerCase().replace(/^\w/, c => c.toUpperCase());
        country = country.toLowerCase().replace(/^\w/, c => c.toUpperCase());

        io.emit('review uploaded', fname, lname, experience, city, country, years, text);

        append_to_json(fname, lname, experience, city, country, years, text);
    });
});

http.listen(8080, function() {
    console.log('listening on 8080');
});