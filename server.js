const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();

const path = require('path');
const multer = require('multer');

const bodyParser = require('body-parser')

/*
	HOME
*/
app.get('/', (req, res) => {
	return res.send('Homepage');
});

/*
	LOGIN
	The correct value for key "user" is "test"
	The correct value for key "password" is "1234"
*/
var jwt = require('jsonwebtoken')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json({limit:'10mb'}))

app.post('/login', (req, res) => {
	var username = req.body.user
	var password = req.body.password
	if( !(username === 'test' && password === '1234')){
		res.status(401).send({
		error: 'Invalid username or password'
		})
		return
	}
	var tokenData = { username: username }
	var token = jwt.sign(tokenData, 'secret', {
		expiresIn: 60 * 60 * 24
	})
	res.send({
		token
	})
})

app.get('/auth', (req, res) => {
    var token = req.headers['authorization']
    if(!token){
        res.status(401).send({
          error: "You need the token."
        })
        return
    }

    token = token.replace('Bearer ', '')

    jwt.verify(token, 'secret', function(err, user) {
      if (err) {
        res.status(401).send({
          error: 'Invalid token.'
        })
      } else {
        res.send({
          message: 'Correct token.'
        })
      }
    })
})

/*
	UPLOAD AN IMAGE
	All images are saved in the "uploads" folder
*/
let storage = multer.diskStorage({
	destination:(req, file, cb) => {
		cb(null, './uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/upload-image', upload.single('file'), (req, res) => {
	console.log(`Storage location is ${req.hostname}/${req.file.path}`);
	return res.send(req.file.path);
});

/*
	CREATE A FOLDER
	The key "name" receive the name of the file
*/
const fs = require('fs');
app.use(express.json());
app.use(express.static('public'));
	
app.post('/create-folder', upload.single('file'), (req, res) => {
	var dir = req.body.name;
	console.log(dir);
	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
	fs.rename('./uploads','./'+ dir, (error) => { 
		if (error) { 
		  console.log(error); 
		} 
		else { 
			console.log(`Storage location is ${req.hostname}/${req.file.path}`);
		} 
	  }); 
	return res.send(req.file.path);
});

/*
	PORT
*/
app.listen(PORT, ()=> console.log(`Server is up on port: ${PORT}`));

/*
x-www-form-urlencoded
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
 app.use(bodyParser.json());
app.post('/post-test', (req, res) => {
    console.log('Got body:', req.body);
    res.sendStatus(200);
});
*/

