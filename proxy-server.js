var http = require('http');
const cluster = require('cluster');
const fs = require('fs');
var os = require("os");
var url = require("url");

const numCPU = os.cpus().length; 

if (cluster.isMaster) {
  for (let i = 0; i < numCPU-1; i++) cluster.fork();
  cluster.on('exit', (worker, code) => {
    console.log( `Worker ${worker.id} finished. Exit code: ${code}`);
  });
} else {
  http.createServer(onRequest).listen(3000);
  
  function onRequest(client_req, client_res) {
    console.log('serve: ' + client_req.url);

    var ip = client_req.connection.remoteAddress;
    var url_info  = url.parse(client_req.url);

    var options = {
      hostname: 'www.kremlin.ru',
      port: 80,
      path: client_req.url,
      method: client_req.method
    };

    var proxy = http.request(options, function (res) {
      client_res.writeHead(res.statusCode, res.headers)
      res.pipe(client_res, {
        end: true
      });
    });

    client_req.pipe(proxy, {
      end: true
    });

    var date = new Date();
        var date1 = date.getDate();
        if (date1 < 10){date1 = '0' + date1;}
        var curren_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date1);
        var hour1 = date.getHours();
        if (hour1 < 10){hour1 = '0' + hour1;}
        var min1 = date.getMinutes();
        if (min1 < 10){min1 = '0' + min1;}
        var sec1 = date.getSeconds();
        if (sec1 < 10){sec1 = '0' + sec1;}
        var current_time = (hour1) + ':' + (min1) + ':' + (sec1);
        var inf = '[' + curren_date + ' ' + current_time + '] ' + ip + ' ' + ` ${client_req.method}` + ' ' + client_req.url;
         fs.appendFile('log.txt', inf + '\n', function(err) {
      if (err) {
        return console.log(err);
      } else {
        console.log(`${inf} saved!`);
      }
    });
  }

} 