# Configurar o backend no Google Apps Script

## 1. Abrir o projeto vinculado à planilha

1. Abra a planilha **Goiás Esporte Clube — Banco do aplicativo de chamadas**.
2. No menu superior, escolha **Extensões → Apps Script**.
3. Apague o conteúdo de `Código.gs`.
4. Abra o arquivo `google-apps-script/Code.gs` deste projeto, copie tudo e cole no editor.
5. Clique em **Salvar** e dê ao projeto o nome `Goiás Esporte Clube — Backend de frequência`.

## 2. Autorizar Drive e Gmail

1. No seletor de funções do editor, escolha `doGet`.
2. Clique em **Executar**.
3. Escolha **Revisar permissões**.
4. Selecione a conta `professorjoaogec@gmail.com`.
5. Se aparecer o aviso de aplicativo não verificado, escolha **Avançado → Ir para Goiás Esporte Clube — Backend de frequência (não seguro)**.
6. Clique em **Permitir** para acesso ao Drive, Documentos e envio de e-mail.

O primeiro teste retorna `Endpoint ativo.`. Essa execução também autoriza os serviços usados para criar as pastas e os PDFs.

## 3. Publicar como Web App

1. Clique em **Implantar → Nova implantação**.
2. Em tipo de implantação, escolha **Aplicativo da Web**.
3. Em **Executar como**, escolha **Eu** (`professorjoaogec@gmail.com`).
4. Em **Quem tem acesso**, escolha **Qualquer pessoa** para o site sem login conseguir enviar a chamada.
5. Clique em **Implantar** e copie a URL que termina em `/exec`.

A opção “Qualquer pessoa” torna o endpoint acessível pela internet. Não compartilhe a URL publicamente fora do seu site; em uma etapa posterior podemos adicionar uma chave de integração.

## 4. Ligar o site ao backend

No arquivo `config.js`, troque somente o valor vazio:

```js
window.FREQUENCIA_CONFIG = {
  apiUrl: 'COLE_AQUI_A_URL_QUE_TERMINA_EM_EXEC',
  apiMode: 'cors'
};
```

Depois salve, publique o site novamente e faça um teste com uma turma.

## 5. Resultado esperado

Ao salvar uma turma, será criado um PDF dentro de:

`Frequência de turmas do Goiás Esporte Clube / Terça-feira ou Quinta-feira / AAAA-MM-DD`

Quando todas as turmas daquele dia forem concluídas, o Apps Script enviará um e-mail para `professorjoaogec@gmail.com` com a confirmação e os links dos arquivos.

A VAG-05 e códigos de turmas criadas no aplicativo também são aceitos pelo backend.
