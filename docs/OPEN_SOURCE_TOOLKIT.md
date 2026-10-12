# Biblioteca de codigo aberto — VINSETT

> Cadastro de referencias externas. **Este documento nao copia, faz fork, executa ou instala os dez projetos.**
> Objetivo: consultar a biblioteca sempre que um recurso corresponder a uma necessidade tecnica real.

Ultima verificacao de existencia dos repositorios: 2026-10-12.

## Fontes catalogadas

| # | Repositorio original | Funcao | Aplicacao preferencial |
| --- | --- | --- | --- |
| 1 | [Awesome](https://github.com/sindresorhus/awesome) | Diretorio de listas curadas de ferramentas e bibliotecas | VINSETT Forge AI, VINSETT Academy, VINSETT Trader |
| 2 | [Public APIs](https://github.com/public-apis/public-apis) | Catalogo de APIs externas para integracoes | VINSETT Trader, VINSETT Academy, VINSETT Forge AI |
| 3 | [Ollama](https://github.com/ollama/ollama) | Execucao de modelos de IA em infraestrutura propria | VINSETT Forge AI, VINSETT Academy |
| 4 | [Langflow](https://github.com/langflow-ai/langflow) | Construcao e orquestracao visual de fluxos/agentes de IA | VINSETT Forge AI, VINSETT Academy |
| 5 | [Awesome LLM Apps](https://github.com/Shubhamsaboo/awesome-llm-apps) | Exemplos e referencias de agentes e aplicativos com LLMs | VINSETT Forge AI, VINSETT Academy |
| 6 | [Free for Dev](https://github.com/ripienaar/free-for-dev) | Diretorio de servicos para desenvolvedores com camadas gratuitas | VINSETT Forge AI, VINSETT Academy, VINSETT Trader |
| 7 | [OpenDesign](https://github.com/nexu-io/open-design) | Ambiente colaborativo de agentes para design e prototipagem | VINSETT Academy, VINSETT Forge AI |
| 8 | [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers) | Catalogo de servidores MCP para conectar agentes a ferramentas | VINSETT Forge AI, VINSETT Academy, VINSETT Trader |
| 9 | [OpenHands](https://github.com/OpenHands/OpenHands) | Plataforma de agentes de desenvolvimento e automacoes de codigo | VINSETT Forge AI |
| 10 | [Scrapling](https://github.com/D4Vinci/Scrapling) | Ferramentas Python para coleta e extracao de paginas web | VINSETT Forge AI, VINSETT Academy |

## Procedimento para novas tarefas

1. Definir requisito, contexto de dados, stack e criterios de aceitacao.
2. Consultar `OPEN_SOURCE_CATALOG.json` ou esta lista para filtrar repositorios aderentes.
3. Comparar a alternativa com recursos ja existentes e com solucoes mais simples.
4. Antes de sugerir instalacao: verificar licenca do projeto e de dependencias, manutencao, vulnerabilidades conhecidas, privacidade, permissoes, compatibilidade, custos de API/infraestrutura e eventuais limitacoes comerciais.
5. Isolar prova de conceito, registrar versao/tag/commit e documentar razao tecnica de adocao.
6. Executar testes automatizados, inspecionar logs e proteger segredos antes de integrar ao produto.
7. Em operacoes sensiveis (financeiras, administracao de contas, deploy e codigo com execucao de comandos), exigir revisao e aprovacoes apropriadas.
8. Se nenhum projeto atender, **nao adotar artificialmente** so porque faz parte da lista.

## Regras praticas por familia

### [Awesome](https://github.com/sindresorhus/awesome)
- Quando considerar: pesquisa de tecnologias; comparacao de alternativas.
- Ponto de atencao: Links e listas nao equivalem a auditoria de seguranca.

### [Public APIs](https://github.com/public-apis/public-apis)
- Quando considerar: prototipos com dados externos; consulta de fornecedores de API.
- Ponto de atencao: Verificar autenticacao, SLAs, licenca, limites e preco de cada API antes do uso.

### [Ollama](https://github.com/ollama/ollama)
- Quando considerar: inferencia local; testes de privacidade e custo.
- Ponto de atencao: Requer maquina/servidor com memoria e computacao adequadas; analisar modelos individualmente.

### [Langflow](https://github.com/langflow-ai/langflow)
- Quando considerar: prototipos de agentes; integracao entre ferramentas.
- Ponto de atencao: Conferir custo de hospedagem, controle de acesso e exposicao de credenciais.

### [Awesome LLM Apps](https://github.com/Shubhamsaboo/awesome-llm-apps)
- Quando considerar: projetos de referencia; prototipos de RAG e agentes.
- Ponto de atencao: Revisar licencas por componente e nao copiar segredos ou codigo de exemplo sem testes.

### [Free for Dev](https://github.com/ripienaar/free-for-dev)
- Quando considerar: hospedagem e deploy; monitoramento e banco de dados.
- Ponto de atencao: Termos, cotas e precos mudam; validar diretamente no fornecedor.

### [OpenDesign](https://github.com/nexu-io/open-design)
- Quando considerar: interfaces; exploracao de UX e prototipos.
- Ponto de atencao: Avaliar limites de planos, creditos, licencas e politica de dados antes da integracao.

### [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
- Quando considerar: descoberta de conectores; integracoes de ferramentas.
- Ponto de atencao: Servidores terceiros podem executar operacoes sensiveis; auditar codigo e permissoes.

### [OpenHands](https://github.com/OpenHands/OpenHands)
- Quando considerar: programacao assistida; revisao e manutencao de codigo.
- Ponto de atencao: Executar em sandbox com permissao minima; controlar custos, tokens e acesso a repositorios.

### [Scrapling](https://github.com/D4Vinci/Scrapling)
- Quando considerar: coleta autorizada de dados publicos; integracao de fontes sem API.
- Ponto de atencao: Respeitar leis, privacidade, termos dos sites e limites de acesso; priorizar APIs oficiais.


## Fit inicial por produto

- **VINSETT Forge AI:** OpenHands e Langflow para POCs controladas; Awesome LLM Apps como referencia; MCP para integracoes com principio de menor privilegio.
- **VINSETT Academy:** OpenDesign para UX, Free for Dev para comparar servicos e Langflow para recursos educacionais assistidos por IA.
- **VINSETT Trader:** Public APIs para descobrir fontes, Free for Dev para infraestrutura e MCP apenas quando a seguranca permitir. **Nunca permitir ordens reais apenas por haver integracao; priorizar simulacao, validacao de dados e controles de risco.**

## Limites e atribuicao

- Os projetos sao de terceiros e mantem seus autores, licencas e governanca.
- Nenhum item foi incorporado ao codigo de producao por este cadastro.
- "Gratuito" pode significar apenas acesso ao codigo ou uma faixa gratuita limitada; infraestrutura, chamadas de API e creditos podem gerar despesas.
- Uso futuro exige revalidar condicoes tecnicas e legais na data da implementacao.
- Origem do catalogo: material compartilhado pelo proprietario da conta em 2026-10-12.

## Formato para automacao

O inventario estruturado esta em [`OPEN_SOURCE_CATALOG.json`](OPEN_SOURCE_CATALOG.json), para permitir buscas, filtros e futura integracao a agentes de planejamento.
