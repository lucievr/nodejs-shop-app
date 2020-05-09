const http = require('http');
const fs = require('fs');

// called by node.js whenever a request reaches our server, arg is a request listener
const server = http.createServer((req, res) => {
  // console.log(req.url, req.method, req.headers);

  const url = req.url;
  const method = req.method;

  if (url === '/') {
    res.write('<html>');
    res.write('<head><title>My first page</title></head>');
    res.write(
      '<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></input></form></body>'
    );
    res.write('</html>');
    return res.end();
  }

  if (url === '/message' && method === 'POST') {
    const body = [];
    // listen on the data event, whenever a new chunk of data is ready to be read it is added to the body array
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    // after all chunks of data received
    return req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split('=')[1]; // message=novy+text+na+zkousku
      // fs.writeFileSync('message.txt', message); // synchronous, blocks execution of the code below until this file is created and written into
      fs.writeFile('message.txt', message, (err) => {
        // callback executes after message.txt is created
        res.writeHead(302, { Location: '/' }); // redirect to home, one liner or two lines as below
        // res.statusCode = 302;
        // res.setHeader('Location', '/');
        return res.end();
      });
    });
  }

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>My first page</title></head>');
  res.write('<body><h1>Hello from node.js server</h1></body>');
  res.write('</html>');
  res.end(); // at this point, node.js will send the response back to the client

  //to unregister event listener and exit the whole programme
  // process.exit();
});

// server listening for incoming requests on port 3000
server.listen(3000);
