# Prova Pratica P1 - Arquitetura de Microsservicos (Node.js + MongoDB)

Projeto base para a atividade pratica de E-commerce com 5 microsservicos obrigatorios, com foco em:

- Baixo acoplamento
- Alta coesao
- Isolamento de dados por servico
- Comunicacao HTTP via API REST

## Servicos Implementados

1. Catalog Service (`3001`): gerencia produtos
2. User Service (`3002`): gerencia usuarios
3. Order Service (`3003`): orquestra criacao de pedidos
4. Inventory Service (`3004`): controla estoque
5. Payment Service (`3005`): simula processamento de pagamento
6. Frontend (`8080`): interface web para operar os fluxos

Cada servico possui seu proprio banco MongoDB dedicado (containers separados no `docker-compose.yml`).

## Arquitetura e Fluxo

Fluxo principal de criacao de pedido:

1. Cliente chama `POST /orders` no Order Service
2. Order Service valida usuario no User Service
3. Order Service consulta produto no Catalog Service
4. Order Service consulta estoque no Inventory Service
5. Order Service cria pedido com status `CRIADO`
6. Order Service chama `POST /payments` no Payment Service
7. Se pagamento `APROVADO`, baixa estoque e atualiza pedido para `PAGO`
8. Se pagamento `RECUSADO`, atualiza pedido para `CANCELADO`

Essa modelagem segue a narrativa solicitada na prova e a separacao de responsabilidades da imagem de referencia (Cliente/Admin -> Interface/Backend -> microsservicos).

## Contratos REST Minimos

### Catalog Service

- `GET /products`
- `GET /products/:id`
- `POST /products`

Exemplo de criacao:

```json
{
	"name": "Smartphone X",
	"description": "128GB",
	"price": 800,
	"sku": "PHONE-X-128"
}
```

Observacao: o catalogo faz seed automatico com celulares e marcas aleatorias na primeira execucao.

### User Service

- `POST /users`
- `GET /users/:id`

Exemplo de criacao:

```json
{
	"name": "Jean",
	"email": "jean@example.com"
}
```

### Inventory Service

- `GET /inventory/:productId`
- `PUT /inventory/:productId`

Endpoint auxiliar (bootstrap de dados):

- `POST /inventory`

Exemplo de atualizacao:

```json
{
	"quantityChange": -1
}
```

### Payment Service

- `POST /payments`

Retorno esperado:

- `status: APROVADO`
- `status: RECUSADO`

### Order Service

- `POST /orders`
- `GET /orders/:id`

Exemplo de criacao:

```json
{
	"userId": "USER_ID",
	"items": [
		{
			"productId": "PRODUCT_ID",
			"quantity": 1
		}
	]
}
```

## Estrutura do Projeto

```text
.
├── docker-compose.yml
├── frontend/
├── requests.http
└── services/
		├── catalog-service/
		├── user-service/
		├── order-service/
		├── inventory-service/
		└── payment-service/
```

## Como Executar

### Opcao 1 (recomendada): Docker Compose

```bash
docker compose up --build
```

Depois acesse o frontend em:

`http://localhost:8080`

### Opcao 2: Local por servico

Em cada pasta de servico:

```bash
npm install
npm run dev
```

### Rodando com Mongo local sem autenticacao

Com MongoDB local em `localhost:27017` sem usuario/senha, use os bancos separados:

- `catalog_db`
- `user_db`
- `order_db`
- `inventory_db`
- `payment_db`

Os arquivos `.env.example` de cada servico ja estao configurados para esse cenario. Basta copiar para `.env` em cada servico e iniciar as APIs.

Comando unico para iniciar tudo (5 APIs + frontend):

```powershell
pwsh -ExecutionPolicy Bypass -File .\start-local.ps1
```

Comando unico para encerrar tudo (5 APIs + frontend):

```powershell
pwsh -ExecutionPolicy Bypass -File .\stop-local.ps1
```

Para usar frontend sem Docker, rode um servidor estatico na pasta `frontend`.

## Evidencia de Funcionamento (cenarios)

Use o arquivo `requests.http` para reproduzir:

1. Cenario de sucesso
2. Cenario de falha controlada (pagamento recusado)

Sequencia sugerida:

1. Criar produto
2. Criar usuario
3. Criar estoque para o produto
4. Criar pedido com pagamento aprovado
5. Consultar pedido finalizado
6. Criar pedido forcando pagamento recusado

## Regras Arquiteturais Atendidas

- Banco proprio por servico: atendido (MongoDB isolado por container)
- Isolamento de dados: atendido (sem acesso direto entre bancos)
- Comunicacao exclusiva por API HTTP: atendido
- Independencia de execucao: atendido (servicos separados)

## Observacoes

- Ha uma interface grafica simples para executar o fluxo fim a fim
- O foco esta na modelagem dos servicos e integracao minima validavel
- A partir daqui podemos evoluir com testes automatizados, logs estruturados e documentacao OpenAPI

## Por que usar docker-compose?

O `docker-compose.yml` existe para facilitar execucao e padronizar ambiente.

- Sobe todos os 5 microsservicos, os 5 bancos MongoDB e o frontend com um unico comando
- Garante o isolamento de dados por servico (cada container de banco e dedicado)
- Evita problemas de "na minha maquina funciona"
- Mantem portas e variaveis de ambiente consistentes para o grupo todo

Sem compose, cada integrante teria que iniciar manualmente 11 processos (frontend + 5 APIs + 5 bancos), aumentando chance de erro.