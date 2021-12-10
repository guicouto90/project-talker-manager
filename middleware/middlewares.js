const fs = require('fs').promises;

// ================= FUNCOES =====================
// Funcao leitura documento talker.json
const readTalkers = async () => {
  const dataTalkers = await fs.readFile('./talker.json');
  return JSON.parse(dataTalkers);
};

// Funcao para gerar token aleatorio com 16 caracteres:
// Fonte: https://stackoverflow.com/questions/8532406/create-a-random-token-in-javascript-based-on-user-details
const generateToken = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let index = 0; index < 16; index += 1) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
};

//= ================= MIDDLEWARES =====================
// Middleware requisito 1, endpoint /talker com metodo GET:
const registeredTalkers = async (req, res) => {
  const talkers = await readTalkers();
  if (talkers.length === 0) return res.status(200).json([]);

  return res.status(200).json(talkers);
};

// Middleware requisito 2, endpoint /talker/:id metodo GET:
const talkersId = async (req, res) => {
  const { id } = req.params;
  const talkers = await readTalkers();
  const talkerId = talkers.find((talk) => talk.id === Number(id));

  if (!talkerId) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });

  res.status(200).json(talkerId);
};

// Middlewares requisito 3, endpoint /login metodo POST. Veriricao do Login:
// Verificacao email:
const emailVerification = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!email.includes('@') || !email.includes('.com')) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }

  next();
};

// Verificacao password:
const passwordVerification = (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }

  next();
};

// Gerar o token: 
const tokenOk = (req, res) => res.status(200).json({ token: generateToken() });

// Middlewares verificacao para os requisitos 4 ao 7:
// Verifica o token:
const tokenVerification = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ message: 'Token não encontrado' });
  if (authorization.length !== 16) return res.status(401).json({ message: 'Token inválido' });

  next();
};

// Verificar "name":
const nameVerification = (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  }
  if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }

  next();
};

// Verificar "age":
const ageVerification = (req, res, next) => {
  const { age } = req.body;
  if (!age || typeof age !== 'number') {
    return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  }
  if (age < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }

  next();
};

// Verificar campo "talk": 
const talkVerification = (req, res, next) => {
  const { talk } = req.body;
  if (!talk || talk === '') {
    return res.status(400).json(
      { message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios' },
    );
  }

  next();
};

// Verificar campo "talk: { watchedAt }":
// Fonte Regex Data: https://stackoverflow.com/questions/10194464/javascript-dd-mm-yyyy-date-check
const dateVerification = (req, res, next) => {
  const { talk: { watchedAt } } = req.body;
  const regexDate = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
  if (watchedAt === '' || !watchedAt) {
    return res.status(400).json(
      { message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios' },
    );
  }
  if (!watchedAt.match(regexDate)) {
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }

  next();
};

// Verificar campo "talk: { rate }":
const rateVerification = (req, res, next) => {
  const { talk: { rate } } = req.body;
  if (rate === undefined) {
    return res.status(400).json(
      { message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios' },
    );
  }
  if (rate < 1 || rate > 5 || typeof rate !== 'number') {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }

  next();
};

// Middleware requisito 4, endpoint /talker com metodo POST:
const addTalker = async (req, res) => {
  const { name, age, talk } = req.body;
  const talkers = await readTalkers();
  const id = talkers.length + 1;
  const newTalker = {
    id,
    name,
    age,
    talk,
  };
  talkers.push(newTalker);
  const newArray = JSON.stringify(talkers);
  fs.writeFile('./talker.json', newArray);

  res.status(201).json(newTalker);
};

// Middleware requisito 5, endpoint /talker/:id com metodo PUT:
const editTalker = async (req, res) => {
  const { name, age, talk } = req.body;
  const { id } = req.params;
  const talkers = await readTalkers();
  const talkerIndex = talkers.findIndex((index) => index.id === Number(id));
  if (!talkerIndex || talkerIndex < 0 || talkerIndex > talkers.length) {
    return res.status(400).json({ message: 'Palestrante não existente ' });
  }
  const editedTalker = {
    id: Number(id),
    name,
    age,
    talk,
  };
  talkers[talkerIndex] = editedTalker;
  const newArray = JSON.stringify(talkers);
  fs.writeFile('./talker.json', newArray);

  res.status(200).json(editedTalker);
};

// Middleware requisito 6, endpoint /talker/:id com metodo DELETE:
const deleteTalker = async (req, res) => {
  const talkers = await readTalkers();
  const { id } = req.params;
  const talkerIndex = talkers.findIndex((index) => index.id === Number(id));

  if (!talkerIndex || talkerIndex < 0 || talkerIndex > talkers.length) {
    return res.status(400).json({ message: 'Palestrante não existente ' });
  }

  talkers.splice(talkerIndex, 1);
  const newArray = JSON.stringify(talkers);
  fs.writeFile('./talker.json', newArray);

  res.status(200).json({ message: 'Pessoa palestrante deletada com sucesso' });
};

// Middleware requisito 7, endpoint /talker/search com metodo GET:
const findByName = async (req, res) => {
  const { name } = req.query;
  const talkers = await readTalkers();
  if (!name || name === '') return res.status(200).json(talkers);
  const filteredTalkers = talkers.filter((talker) => talker.name.includes(name));
  if (filteredTalkers.length === 0) return res.status(200).json([]);

  res.status(200).json(filteredTalkers);
};

module.exports = {
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
};