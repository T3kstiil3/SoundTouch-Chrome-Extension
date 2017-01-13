var gulp = require('gulp');
 var request = require('superagent');
 var fs = require('fs');
 var https = require('https');
 var util = require('util');

 var config = require('../config').deploy;

 gulp.task('deploy', function(cb) {
     // Get token
     request
         .post(config.OAuth.token_uri)
         .send("client_id="+config.OAuth.client_id+"&client_secret="+config.OAuth.client_secret+"&refresh_token="+config.OAuth.refresh_token+"&grant_type=refresh_token")
         .accept("application/json")
         .end(function(err, res){
             if (err)
                return cb(err);
             if (!res.body.access_token)
                return cb('Token not found in response');
             var $token = res.body.access_token;

             // Upload zip (superagent doesn't work well with attach)
             var req = https.request({
                 method: 'PUT',
                 host: 'www.googleapis.com',
                 path: util.format('/upload/chromewebstore/v1.1/items/%s', config.appID),
                 headers: {
                 'Authorization': 'Bearer ' + $token,
                 'x-goog-api-version': '2'
                 }
             }, function(res) {
                 res.setEncoding('utf8');
                 var response = '';
                 res.on('data', function (chunk) { response += chunk; });
                 res.on('end', function () {
                     var obj = JSON.parse(response);
                     if( obj.uploadState !== "SUCCESS" ) {
                         var err = [];
                         obj.itemError.forEach(function(item){ err.push('<'+item.error_code + '> ' + item.error_detail); });
                         return cb(err.join("\n"));
                     }

                     // Publish
                     request
                         .post("https://www.googleapis.com/chromewebstore/v1.1/items/"+config.appID+"/publish")
                         .set('x-goog-api-version', '2')
                         .set('Authorization', 'Bearer ' + $token)
                         .set('Content-Length', '0')
                         .end(function(err, res) {
                             if (err)
                             return cb(err);

                             if (!res.body.status || res.body.status[0] != 'OK')
                             return cb(res.body);

                             return cb(null);
                         });
                 });
             }).on('error', function(e){ return cb(e); });
             var readStream = fs.createReadStream(config.packageName);
             readStream.on('end', function(){ req.end(); });
             readStream.pipe(req);
         });
 });
