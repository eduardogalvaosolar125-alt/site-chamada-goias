# Configurar o backend no Google Apps Script

## 1. Abrir o projeto vinculado à planilha

1. Abra a planilha **Goiás Esporte Clube — Banco do aplicativo de chamadas**.
2. No menu superior, escolha **Extensões → Apps Script**.
3. Apague o conteúdo de `Código.gs`.
4. Abra o arquivo `google-apps-script/Code.gs` deste projeto, copie tudo e cole no editor.
5. Clique em **Salvar** e dê ao projeto o nome `Goiás Esporte Clube — Backend de frequência`.

## 2. Autorizar Drive e Gmail

1. No seletor de funções do editor, escolha `authorizeServices`.
2. Clique em **Executar**.
3. Escolha **Revisar permissões**.
4. Selecione a conta `professorjoaogec@gmail.com`.
5. Se aparecer o aviso de aplicativo não verificado, escolha **Avançado → Ir para Goiás Esporte Clube — Backend de frequência (não seguro)**.
6. Clique em **Permitir** para acesso ao Drive, Documentos e envio de e-mail.

Essa execução solicita os serviços usados para criar pastas, documentos/PDFs e enviar e-mails. Ela cria e envia para a lixeira um documento temporário de autorização.

## 3. Publicar como Web App

1. Clique em **Implantar → Nova implantação**.
2. Em tipo de implantação, escolha **Aplicativo da Web**.
3. Em **Executar como**, escolha **Eu** (`professorjoaogec@gmail.com`).
4. Em **Quem tem acesso**, use a opção mais restritiva compatível com o ambiente. A opção **Qualquer pessoa** deixa o endpoint acessível pela internet e só deve ser usada temporariamente, durante testes controlados.
5. Clique em **Implantar** e copie a URL que termina em `/exec`.

A opção “Qualquer pessoa” torna o endpoint acessível pela internet e não deve ser considerada autenticação. Antes de uso real, adicione autenticação ou um backend privado. Não compartilhe a URL publicamente fora do site.

## 3.1 Propriedades do script

Em **Configurações do projeto → Propriedades do script**, configure somente o que for necessário:

- `DESTINATION_EMAIL`: habilita o envio de e-mail. Sem essa propriedade, o fechamento permanece pendente e nenhum e-mail é enviado.
- `ALLOW_CUSTOM_CLASSES`: use `true` somente com autorização do responsável. O padrão é bloqueado.

O backend valida datas, códigos de turma, quantidade de alunas e situações antes de criar arquivos.

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

Quando todas as turmas daquele dia forem concluídas e `DESTINATION_EMAIL` estiver configurado, o Apps Script enviará um único e-mail para o endereço configurado com a confirmação e os links dos arquivos.

A VAG-05 só deve ser liberada depois de confirmar seu status na planilha oficial. Códigos de turmas criadas no aplicativo ficam bloqueados por padrão; para habilitá-los, configure `ALLOW_CUSTOM_CLASSES=true` somente após revisar a segurança e a sincronização com a planilha.
