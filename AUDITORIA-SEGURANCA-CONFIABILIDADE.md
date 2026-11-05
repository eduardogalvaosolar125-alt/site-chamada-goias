# Auditoria de segurança e confiabilidade

## Escopo

A análise foi feita em uma cópia isolada do repositório `site-chamada-goias`. Nenhuma planilha, pasta do Drive, histórico, publicação ou configuração externa foi alterada.

## Riscos encontrados

1. O endpoint do Apps Script é documentado como público, o que permite requisições externas sem autenticação.
2. A validação do backend aceitava qualquer código com formato válido, mesmo fora da lista de turmas autorizadas.
3. Datas com formato correto, mas calendário inválido, poderiam passar pela validação.
4. O backend usava um e-mail padrão embutido no código quando a propriedade de configuração não existia.
5. O front-end recebia o link do PDF, mas não o preservava no registro local; o fechamento diário tentava usar um campo diferente (`url`).
6. O estado do `localStorage` não validava os tipos dos dados carregados e podia quebrar fluxos após corrupção ou edição manual.
7. O histórico não oferecia acesso direto ao PDF confirmado pelo backend.
8. A fonte oficial de turmas e alunas ainda não está integrada ao fluxo do Apps Script. A planilha deve ser alinhada antes de considerar a sincronização completa.

## Correções implementadas na cópia de trabalho

- Preservação de `fileId`, `url` e `folderUrl` retornados pelo Apps Script.
- Fechamento diário usando os links e IDs reais dos PDFs.
- Validação defensiva dos objetos carregados do `localStorage`.
- Link “Abrir PDF” no histórico quando o backend confirmar o arquivo.
- Validação real do calendário no Apps Script.
- Bloqueio de códigos de turma fora de `ALLOWED_CLASSES`, salvo autorização explícita por `ALLOW_CUSTOM_CLASSES=true`.
- Remoção do e-mail padrão implícito; o envio só ocorre quando `DESTINATION_EMAIL` estiver configurado.
- Documentação de implantação atualizada para não tratar “Qualquer pessoa” como autenticação.

## O que não foi alterado

- Dados das planilhas oficiais.
- Registros históricos do Drive.
- PDFs existentes.
- Publicação do site ou do Apps Script.
- Status da VAG-05.
- Integração de gravação nas abas `Chamadas` e `Presencas`.

## Aprovações ainda necessárias

- Confirmar se a VAG-05 está pendente ou ativa.
- Definir a fonte oficial e o ID da planilha que o Apps Script deve usar.
- Decidir o método de autenticação do endpoint.
- Autorizar a implementação da sincronização com `Chamadas` e `Presencas`.
- Definir o e-mail oficial em `DESTINATION_EMAIL`.
- Definir se turmas personalizadas poderão ser criadas pelo aplicativo.

## Resultado

A cópia de trabalho está pronta para validação técnica local. As correções feitas são reversíveis e não modificam dados externos. A próxima etapa recomendada é implementar a leitura e gravação controlada no Google Sheets, depois de confirmar a VAG-05 e a autenticação.
