# VINSETT Forge AI — estudo de caso

**Da ideia ao projeto organizado, com IA e aprovação humana.**

[Abrir aplicação](https://vinsett-forge-ai.netlify.app/) · [Ver código](https://github.com/Vinsett07/vinsett-forge-ai) · [Consultar validações](VALIDATION.md)

Versão pública: **0.6.2**. Revisão deste material: **12 de outubro de 2026**.

![Página inicial real do Forge, capturada em 12/10/2026](assets/forge-landing-2026-10-12.jpg)

## Por que o projeto foi criado

Uma ideia de software precisa virar um problema definido, requisitos verificáveis e tarefas acompanháveis. Quando esse contexto fica disperso, torna-se difícil explicar o que será entregue, por que uma decisão foi tomada e o que mudou ao longo do trabalho.

O Forge reúne esse processo em um workspace: do briefing ao acompanhamento da execução. A IA ajuda a propor o planejamento, enquanto a decisão sobre mudanças de escopo permanece com o proprietário do projeto.

O projeto demonstra a construção de um produto web completo: interface, autenticação, banco de dados, regras de domínio, integrações externas, testes e operação. Seu público inicial são pessoas que precisam estruturar e acompanhar seus próprios projetos de software.

## Como a pessoa usa

1. Cria uma conta e acessa seu workspace.
2. Descreve nome, problema, público e resultado esperado de um projeto.
3. Recebe um plano inicial com épicos, histórias, premissas, riscos e critérios de conclusão. O plano é salvo como snapshot V1.
4. Organiza requisitos e critérios de aceite; acompanha tarefas em um Kanban de cinco etapas.
5. Solicita uma proposta da IA e revisa seu conteúdo. A proposta fica salva como pendente até ser aprovada ou rejeitada.
6. Ao aprovar, o Forge atualiza o plano, registra uma nova versão e cria os requisitos e tarefas propostos em uma única transação.
7. Vincula um repositório GitHub público para consultar commits, issues, pull requests, execuções do Actions e verificações de prontidão de release.

O histórico registra a evolução do trabalho e as decisões. A integração GitHub é de leitura; o Forge não altera código nem faz deploy de aplicações do usuário.

## Decisões de engenharia

| Decisão | Resultado no produto |
| --- | --- |
| Next.js, React e TypeScript | Interface e API no mesmo projeto, com contratos tipados |
| PostgreSQL, Drizzle e quatro migrações SQL | Persistência de nove tabelas e evolução controlada do banco |
| Propriedade de projeto verificada no servidor | Cada usuário acessa somente seus projetos |
| `scrypt` com salt e sessão assinada em cookie HttpOnly | Senhas protegidas e autenticação sem expor o token ao JavaScript da interface |
| IA com saída estruturada e validação local | Respostas precisam atender ao contrato da aplicação antes de virar propostas |
| Aprovação atômica e planos versionados | Uma decisão aplica o conjunto de mudanças e preserva o histórico do planejamento |
| Planejamento determinístico disponível | Desenvolvimento e testes podem funcionar sem chamadas a um provedor externo |
| Netlify com banco gerenciado e AI Gateway | Aplicação publicada em endereço próprio, separado do Academy |

Na configuração externa, falhas da IA são informadas ao usuário; não há troca silenciosa por uma resposta determinística. O cookie usa `Secure` em produção e `SameSite=Lax`. Segredos ficam no servidor.

## Resultados comprovados

| Evidência | Resultado e data |
| --- | --- |
| [CI](https://github.com/Vinsett07/vinsett-forge-ai/actions/runs/38209873639) | 19 testes unitários e 3 testes Chromium passaram em 12/10; lint, tipos, build e migrações reaplicadas também passaram |
| [Saúde pública](evidence/public-check-2026-10-12.json) | HTTP 200, versão 0.6.2 e verificações de sessão/banco aprovadas em 12/10 |
| [Aceite de produção](PRODUCTION_2026-10-04.md) | Cadastro, persistência, GitHub e chamada real de IA com aprovação verificados por HTTP em 04/10 |
| [Recuperação do backup](BACKUP_RESTORE_2026-10-05.md) | Restauração real em ambiente isolado em 05/10; nove tabelas e estrutura equivalentes, 13 relações verificadas e zero registros órfãos |

Os testes Chromium do CI cobrem a jornada autenticada com um PostgreSQL descartável. A inspeção atual no domínio público confirmou a página inicial e a tela de entrada; a jornada completa pelo navegador nesse domínio ainda precisa ser concluída. Os números acima medem verificações técnicas, não adoção por clientes ou impacto comercial.

## Estado atual e limites

O Forge é um **MVP funcional publicado**. A [revisão atual](PROJECT_STATUS_2026-10-12.md) acompanha três pendências: publicar as seis tags históricas com permissão de workflows, limpar os recursos sintéticos do ensaio e concluir a jornada autenticada de navegador em produção. A restauração do backup já foi comprovada.

A versão atual tem propriedade individual de projetos, sem organizações, colaboração compartilhada ou recuperação de senha. As sessões são stateless e os limites de requisições são locais ao processo. Antes de ampliar o uso, precisam ser avaliados controles de abuso distribuídos e de custo de IA, recuperação de acesso e revogação de sessões.

## Texto curto para o novo portfólio

> VINSETT Forge AI é um workspace para transformar ideias de software em planos versionados, requisitos e tarefas. Combina Next.js, TypeScript e PostgreSQL com IA sujeita à aprovação humana e integração GitHub de leitura. O MVP está publicado na Netlify, com testes automatizados e recuperação de backup comprovada em ambiente isolado.

**Categoria:** aplicação web / planejamento e acompanhamento de software.

**Tecnologias:** Next.js, React, TypeScript, PostgreSQL, Drizzle, OpenAI Responses, GitHub REST, Netlify, Playwright.

**Botões sugeridos:** “Ver projeto” para a aplicação e “Ver código” para o repositório.

**Imagem de capa:** [captura real da aplicação](assets/forge-landing-2026-10-12.jpg).

Uma apresentação curta pode mostrar o briefing, o plano V1, o Kanban, a revisão de uma proposta e o plano V2 após a aprovação. Use apenas dados de demonstração e identifique quais ações chamam a IA externa.
