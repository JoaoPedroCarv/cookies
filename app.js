//importando o framework express
const express = require('express')

//importando as bibliotecas de sessão e cookies
const session = require('express-session')
const cookieParser = require('cookie-parser')

//inicializar o express
const app = express();

//configurando os cookies
app.use(cookieParser())

//configurando as sessões
app.use(
    session({
        secret: 'minhachave', //chave secreta para assinar os cookies da sessão
        resave: false, //evita regravar sessões sem alteraçoes
        saveUninitialized: true, // salva sessões não inicializadas 
    })
)

const produtos = [
    { id: 1, nome: 'Arroz', preco: 25 },
    { id: 2, nome: 'Feijão', preco: 15 },
    { id: 3, nome: 'Bife', preco: 40 }
]

const usuarios = [
    { id: 1, nome: 'João', cpf: '908766499-45', nascimento: '11/01/2004', email: 'joao@gmail.com', senha: 'minhasenha', },
    { id: 2, nome: 'Test', cpf: '886593874-34', nascimento: '08/11/2015', email: 'tester@gmail.com', senha: 'senhateste' },
]

// Rota inicial para exibir produtos
app.get('/produtos', (req, res) => {
    res.send(`
    <h1>lista de Produtos</h1>
    <ul>
        ${produtos.map(
        (produto) => `<li>${produto.nome} - ${produto.preco} <a href="/adicionar/${produto.id}">Adicionar ao carrinho</a></li>`
    ).join("")
        }
    </ul>
    <a href="/carrinho">Ver Carrinho</a>
    `)
});

//Rota de adiconar
app.get('/adicionar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const produto = produtos.find((p) => p.id === id);

    if (produto) {
        if (!req.session.carrinho) {
            req.session.carrinho = [];
        }
        req.session.carrinho.push(produto);
    }

    res.redirect('/produtos')
});

//Rota do carrinho

app.get('/carrinho', (req, res) => {
    const carrinho = req.session.carrinho || [];
    const total = carrinho.reduce((acc, produto) => acc + produto.preco, 0);

    res.send(`
        <h1>Carrinho de Compras</h1>
        <ul>
        ${carrinho.map(
        (produto) => `<li>${produto.nome} - ${produto.preco}</li>`
    ).join("")
        }
    </ul>
    <p>Total: ${total}</p>
    <a href="/produtos">Continuar Comprando</a>
    `);
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    const usuario = usuarios.find((user) => user.email === email && user.senha === senha);

    if (usuario) {

        res.cookie('userId', usuario.id, { maxAge: 900000, httpOnly: true });
        res.send('Login realizado com sucesso!');
    } else {
        res.send('Credenciais inválidas. Tente novamente.');
    }
});

app.get('/perfil', (req, res) => {
    const userId = req.cookies.userId;

    if (userId) {
        const usuario = usuarios.find((user) => user.id === parseInt(userId, 10));

        if (usuario) {
            res.send(`
          <h1>Perfil do Usuário</h1>
          <p>ID: ${usuario.id}</p>
          <p>Nome: ${usuario.nome}</p>
          <p>Email: ${usuario.email}</p>
          <a href="/logout">Sair</a>
        `);
        } else {
            res.send('Usuário não encontrado.');
        }
    } else {
        res.send('Usuário não está logado!');
    }
});


app.get('/logout', (req, res) => {
    res.clearCookie('userId');
    res.redirect('/perfil');
});


app.listen(3000, () => {
    console.log('Tamo on nospedar da bike')
})
