const express = require('express');
const bodyParser = require('body-parser');
const {
  registeredTalkers,
  talkersId,
  emailVerification,
  passwordVerification,
  tokenOk,
  tokenVerification,
  nameVerification,
  ageVerification,
  talkVerification,
  dateVerification,
  rateVerification,
  addTalker,
  editTalker,
  deleteTalker,
  findByName,
} = require('./middleware/middlewares');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// Req1
app.get('/talker', registeredTalkers);

// Req7
app.get('/talker/search', tokenVerification, findByName);

// Req2
app.get('/talker/:id', talkersId);

// Req3
app.post('/login', emailVerification, passwordVerification, tokenOk);

// Req4
app.post(
  '/talker', 
tokenVerification, 
nameVerification, 
ageVerification,
talkVerification,
dateVerification, 
rateVerification, 
addTalker,
);

// Req5
app.put(
  '/talker/:id', 
tokenVerification, 
nameVerification, 
ageVerification, 
talkVerification,
dateVerification, 
rateVerification, 
editTalker,
);

// Req6
app.delete('/talker/:id', tokenVerification, deleteTalker);

app.listen(PORT, () => {
  console.log('Online');
});
