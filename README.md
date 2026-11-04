# Frequência — Goiás Esporte Clube

Site interno para registrar a frequência das turmas de voleibol de terça e quinta-feira.

A primeira tela exibe o escudo com uma animação curta e oferece somente dois caminhos: **Chamada** e **Frequência de alunas**. A chamada permite escolher VAG-01 a VAG-04, marcar cada aluna como presente ou faltou e salvar o resultado do dia. A VAG-05 fica indicada como pendente até a lista de alunas ser confirmada.

Dentro da chamada, a lista também permite adicionar uma nova aluna, transferir uma aluna para outra turma — sem oferecer a turma atual na seleção — e excluir uma aluna da turma. Essas alterações ficam persistidas no navegador do aparelho.

Depois que uma chamada é salva, o calendário avança automaticamente para a próxima terça ou quinta-feira. Para corrigir uma chamada anterior, basta tocar no campo de data e selecionar novamente a terça ou quinta desejada; as chamadas salvas continuam disponíveis para edição.

## Rodar localmente

Na raiz do projeto, execute um servidor estático, por exemplo `python3 -m http.server 4173`, e abra `http://localhost:4173`.

## Drive e e-mail

A interface já envia um payload estável para a URL definida em `config.js`. O backend de referência está em `google-apps-script/Code.gs`. Ele deve ser implantado pelo proprietário da conta Google como Web App, com a pasta raiz e o e-mail configurados dentro do Apps Script. Depois da implantação, copie somente a URL `/exec` para `config.js`.

O backend organiza os arquivos nesta estrutura:

`Frequência de turmas do Goiás Esporte Clube / Terça-feira ou Quinta-feira / DD-MM-AAAA / PDF da turma`

Ao receber o fechamento do dia, envia um e-mail único com a data, as turmas e os links dos PDFs. Não coloque senha, token ou segredo no GitHub. O endpoint sem autenticação é adequado apenas para um teste controlado; para uso real, deve ser protegido por autenticação do Google ou por um backend privado.

## Dados atuais

As listas VAG-01 a VAG-04 foram transcritas das folhas enviadas e estão em `data.js`. A base contém 84 alunas. Nomes manuscritos e a VAG-05 aguardam confirmação. A logo foi corrigida para JPEG binário válido e é usada na animação, no cabeçalho e no favicon.
