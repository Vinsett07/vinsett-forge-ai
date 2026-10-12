# Revisão do VINSETT Forge AI — 12/10/2026

O Forge está publicado na versão **0.6.2** e pode ser apresentado no portfólio como um MVP funcional de planejamento e acompanhamento de projetos com IA. A restauração do backup já foi comprovada. O encerramento operacional ainda depende dos acessos e verificações descritos abaixo.

[Aplicação](https://vinsett-forge-ai.netlify.app/) · [Código](https://github.com/Vinsett07/vinsett-forge-ai) · [Estudo de caso](PORTFOLIO_CASE_STUDY.md)

## O que foi conferido nesta revisão

| Item | Resultado | Evidência |
| --- | --- | --- |
| Saúde de produção | HTTP 200, v0.6.2, configuração de sessão e banco aprovados | [JSON de 12/10](evidence/public-check-2026-10-12.json) |
| Limite de acesso anônimo | `/dashboard` redireciona para `/auth`; API de projetos retorna 401 | Mesmo JSON |
| Interface pública | Página inicial, âncora de arquitetura e navegação para entrada conferidas no navegador | [Captura real](assets/forge-landing-2026-10-12.jpg) |
| CI do código recebido | 19 testes unitários, 3 Chromium, lint, tipos, build e quatro migrações reaplicadas passaram | [Execução 38209873639](https://github.com/Vinsett07/vinsett-forge-ai/actions/runs/38209873639), commit `97fa0736b9819eb4eaf39fa7ab223a21db755d44` |
| Histórico Git | Os seis objetos de tags anotadas e seus commits passaram na verificação local; nenhuma tag estava publicada | `scripts/publish-historical-tags.sh --verify` e consulta aos refs do GitHub |
| Administração Netlify | A conexão requer reautenticação; CLI sem sessão | `oauth_token_invalid_grant` / `NOT_LOGGED_IN` |

Datas e horários dos arquivos de evidência usam UTC. A checagem pública não acessou dados de usuários nem criou contas.

## Entregas anteriores preservadas

- **04/10:** cadastro, persistência, sincronização GitHub e resposta real da IA externa com aprovação humana verificados por HTTP em produção. [Relatório](PRODUCTION_2026-10-04.md).
- **05/10:** backup existente restaurado em branch isolada. As nove tabelas, estrutura e 13 relações foram comparadas com produção; zero registros órfãos, e produção permaneceu inalterada. [Relatório](BACKUP_RESTORE_2026-10-05.md).
- **12/10:** catálogo de dez referências de código aberto incorporado anteriormente e preservado nesta revisão. Nenhuma dessas ferramentas foi instalada por esta atualização. [Catálogo](OPEN_SOURCE_TOOLKIT.md).

## Correções desta atualização

README, roadmap e validação ainda descreviam a publicação e a recuperação do backup como pendentes. Esses estados foram corrigidos, com datas e links de evidência. A arquitetura passou a incluir as duas tabelas e o módulo GitHub já implementados, distinguindo-os de recursos futuros.

O estudo de caso agora está em português e explica o propósito, o fluxo de uso, as decisões técnicas e os resultados comprovados. Inclui uma captura real e um texto curto que pode ser usado no novo portfólio. A descrição da IA foi corrigida: a proposta pendente é persistida, mas mudanças no escopo ativo só são aplicadas após aprovação.

Esta atualização é de documentação e evidências. A aplicação permanece na versão 0.6.2; não houve novo deploy ou mudança de dados nesta revisão.

## Pendências com critérios de conclusão

| Pendência | Bloqueio atual | Para considerar concluída |
| --- | --- | --- |
| Seis tags históricas | Falta uma credencial Git utilizável com escrita e permissão de workflows; o conector disponível não publica tags | Executar `bash scripts/publish-historical-tags.sh --push` em cliente Git autorizado e conferir os seis objetos anotados e commits remotos |
| Duas branches do ensaio | Exclusão exige o painel Netlify autenticado; acesso atual expirou | Confirmar e remover somente `restore-rehearsal-20261005` e `old-restore-rehearsal-20261005`, preservando produção e snapshots |
| Conta/projeto sintéticos de aceite | Último inventário indicava dados presentes; acesso de implantação indisponível | Conferir o projeto `fe9cd4f4-ac99-4d4f-b18c-a0f37d49b5a3` e seu proprietário sintético; testar e publicar migração de limpeza com proteções e validar o resultado |
| Jornada autenticada no navegador público | Não há sessão autenticada disponível para essa verificação | Em conta de demonstração autorizada, conferir criação/persistência, Kanban, decisões de IA, contexto GitHub e saída/nova entrada no domínio publicado |

O estado das branches e do fixture foi observado pela última vez em 05/10 e não foi reconsultado no painel em 12/10. Não há confirmação de limpeza nesta revisão. A credencial anterior de Actions não tinha permissão de workflows; os commits e objetos originais continuam preservados em `history/recovered-v0.6.0.bundle`.

## Escopo para o portfólio

Apresentar como **MVP publicado com IA sujeita a aprovação humana, integração GitHub de leitura, testes e restauração de backup comprovados**. Evitar promessas de geração/publicação automática de código, colaboração entre organizações ou resultados comerciais que não foram medidos.

Recuperação de senha, revogação de sessões e limites de uso distribuídos são evoluções do produto, não funcionalidades entregues. Essas limitações e as pendências operacionais devem permanecer visíveis no estudo de caso técnico.
