# Plano — Frequência de turmas do Goiás Esporte Clube

## Escopo aprovado

Reaproveitar o site existente e transformá-lo em uma ferramenta interna, sem cadastro de professor ou aluno e sem login de aplicativo. A entrada mostra o escudo do Goiás Esporte Clube com uma animação curta e leva a dois caminhos: **Chamada** e **Frequência de alunas**.

A chamada permite escolher as turmas de terça e quinta, abrir a lista de alunas da turma, marcar cada aluna como **Presente** ou **Faltou** e salvar a chamada do dia. A consulta de frequência mostra os registros salvos no navegador enquanto a integração externa não estiver configurada.

A integração planejada com Google Drive e Gmail será feita por um endpoint separado do front-end. Ao salvar, ele deverá gerar um PDF da turma e armazená-lo em `Frequência de turmas do Goiás Esporte Clube / Terça-feira ou Quinta-feira / DD-MM-AAAA /`. Ao finalizar a última turma do dia, deverá enviar um único e-mail informando que as frequências foram atualizadas e listar os PDFs salvos.

## Decisões de primeira versão

- Sem login de professor ou aluna.
- Sem fotos, posições, escalação, chat ou cadastro de novos usuários.
- Turmas atuais: VAG-01 a VAG-04, com VAG-05 reservado como pendente até sua lista ser confirmada.
- Categorias e horários seguem as folhas fornecidas.
- O front-end não armazenará credenciais do Google.
- O backend de Drive/e-mail ficará separado em `google-apps-script/Code.gs` e será ativado somente depois da autorização/configuração do proprietário.

## Estrutura

- `index.html`: shell, splash, navegação e áreas de chamada/frequência.
- `styles.css`: identidade visual verde/amarela e layout responsivo para iPhone.
- `app.js`: estado local, lista de turmas, marcação, salvamento e histórico.
- `data.js`: dados das turmas e alunas transcritos das folhas.
- `config.js`: configuração não secreta do endpoint do backend.
- `google-apps-script/Code.gs`: endpoint opcional para PDFs, Drive e e-mail.
- `manus-routes.json`: manifesto da rota inicial.
