# Especificação - Document Management System

## 1. Objetivo

Oferecer uma aplicação web para enviar, listar e baixar documentos armazenados localmente, associando os metadados de cada documento a um usuário.

## 2. Escopo

### Dentro do escopo

- Envio de um documento por requisição.
- Listagem dos documentos associados ao usuário informado.
- Download de um documento pelo identificador, respeitando o proprietário.
- Registro do proprietário nos metadados.
- Armazenamento dos arquivos no filesystem local e dos metadados em memória.
- Interface web para envio, listagem e download.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Versionamento de documentos.
- Persistência de metadados em banco de dados.
- Cadastro de usuários, autenticação e autorização completas.
- Exclusão de documentos.
- Busca, paginação e edição de metadados.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo usando `multipart/form-data`, no campo `file`. |
| RF-02 | O envio exige um identificador de usuário informado no cabeçalho `X-User-Id`. |
| RF-03 | O sistema valida a presença do arquivo e aplica o limite de tamanho configurado. |
| RF-04 | Ao armazenar o arquivo, o sistema gera um nome interno único; o nome original não é usado como caminho no filesystem. |
| RF-05 | Após um envio bem-sucedido, o sistema registra e retorna os metadados públicos do documento. |
| RF-06 | O usuário pode listar os documentos associados ao `X-User-Id` informado. |
| RF-07 | A listagem apresenta primeiro os documentos mais recentes. |
| RF-08 | O usuário pode baixar um documento pelo identificador, desde que ele pertença ao `X-User-Id` informado. |
| RF-09 | Um documento inexistente ou pertencente a outro usuário retorna a mesma resposta de não encontrado. |
| RF-10 | A interface permite enviar documentos, visualizar a lista do usuário e iniciar o download de um documento. |
| RF-11 | A interface informa erros de validação ou falhas da API sem interromper o uso das demais funções. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos são gravados no filesystem local por meio de `multer` com `diskStorage`, por padrão em `backend/storage`. |
| RNF-02 | Os metadados são mantidos em memória e podem ser perdidos ao reiniciar o processo. |
| RNF-03 | A configuração operacional é obtida de variáveis de ambiente, incluindo porta, diretório de armazenamento e limite de upload. |
| RNF-04 | O limite padrão de upload é 10 MiB e pode ser alterado por configuração. |
| RNF-05 | O backend usa Node.js, Express, CommonJS e JavaScript; os testes usam `node:test`. |
| RNF-06 | O frontend usa React, Vite e `fetch`, acessando a API pelo prefixo `/api` via proxy do Vite. |
| RNF-07 | Erros HTTP têm resposta JSON consistente, exceto respostas de download bem-sucedidas, que são binárias. |
| RNF-08 | Nenhum caminho absoluto ou nome interno de armazenamento é exposto pela API. |

## 5. Modelo de dados

### Metadados públicos do documento

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único usado nas operações de listagem e download. |
| `originalName` | string | Nome original fornecido no envio. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do envio em formato ISO 8601. |
| `owner` | string | Identificador do usuário associado ao documento. |

### Dados internos de armazenamento

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `storageName` | string | Nome interno único usado para localizar o arquivo no diretório de armazenamento. |
| `mimeType` | string | Tipo de mídia recebido, usado quando disponível para servir o download. |

`storageName` e o caminho físico do arquivo são internos e não fazem parte das respostas públicas. O valor de `owner` é obtido de `X-User-Id`; como a autenticação está fora do escopo, esse identificador não deve ser tratado como prova de identidade em ambientes expostos.

## 6. Contratos de API

Todas as rotas abaixo são disponibilizadas pelo backend. No frontend, são acessadas pelo prefixo `/api` configurado no proxy do Vite.

### Formato de erro

```json
{
  "error": {
    "code": "FILE_REQUIRED",
    "message": "Envie um arquivo para continuar."
  }
}