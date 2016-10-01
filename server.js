var unirest = require('unirest');
var express = require('express');
var events = require('events');

var app = express();

var getFromApi = function(endpoint, args) {
    var emitter = new events.EventEmitter();
    unirest.get('https://api.spotify.com/v1/' + endpoint)
           .qs(args)
           .end(function(response) {
                if (response.ok) {
                    emitter.emit('end', response.body);

                }
                else {
                    emitter.emit('error', response.code);
                }
            });
    return emitter;
};

var getRelatedArtist = function(ArtistId){
    var getRelatedArtistEmitter = new events.EventEmitter();
    unirest.get('https://api.spotify.com/v1/artists/' + ArtistId + '/related-artists')
        .end(function(response) {
              if (response.ok) {
                    getRelatedArtistEmitter.emit('end', response.body);


              }
              else {
                    getRelatedArtistEmitter.emit('error', response.code);
              }
        });
        return getRelatedArtistEmitter;
};


app.use(express.static('public'));

app.get('/search/:name', function(req, res) {
    var searchReq = getFromApi('search', {
        q: req.params.name,
        limit: 1,
        type: 'artist'
    });









    searchReq.on('end', function(item) {
        var artist = item.artists.items[0];
        var getRelatedArtistEmitter = getRelatedArtist(artist.id);
        getRelatedArtistEmitter.on('end', function(item) {
            artist.related = item.artists;
            res.json(artist);
            console.log(artist.related);
        });
    });

    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });

});

app.listen(process.env.PORT || 8080);
