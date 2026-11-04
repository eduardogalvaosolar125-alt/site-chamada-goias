# Entregas

- [ ] Remover login, cadastro e seleção de professor/aluna.
  Critérios: a abertura mostra a animação do escudo e, depois, somente os botões Chamada e Frequência de alunas; nenhuma senha é solicitada.

- [ ] Implementar a seleção das turmas de terça e quinta.
  Critérios: VAG-01, VAG-02, VAG-03 e VAG-04 aparecem com horários, categorias e dias corretos; VAG-05 fica sinalizada como pendente até a lista ser confirmada.

- [ ] Implementar a chamada por turma.
  Critérios: a tela mostra somente as alunas da turma selecionada e permite marcar cada uma como Presente ou Faltou; o estado fica visível e pode ser alterado antes de salvar. A lista permite adicionar, transferir e excluir uma aluna.

- [ ] Implementar o histórico de frequência.
  Critérios: a opção Frequência de alunas mostra as chamadas salvas neste dispositivo, agrupadas por data e turma, com contagem de presentes e faltas.

- [ ] Preparar o salvamento externo.
  Critérios: o front-end envia um payload estável para o endpoint configurável; o backend de Apps Script cria a hierarquia de pastas, gera o PDF da turma e envia o e-mail quando a última turma é finalizada; nenhuma credencial fica no repositório.

- [ ] Validar layout e código.
  Critérios: navegação funciona em tela de iPhone, logo e imagens carregam, arquivos estáticos carregam, manifesto de rotas responde corretamente e o repositório não contém senhas ou tokens.
