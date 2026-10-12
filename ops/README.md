# Limpeza operacional do Forge

## Migração preparada, ainda não aplicada

[`pending-migrations/20261012063000_cleanup-acceptance-fixture/migration.sql`](pending-migrations/20261012063000_cleanup-acceptance-fixture/migration.sql) remove somente o projeto sintético do aceite de 04/10 e sua conta. O arquivo fica fora de `netlify/database/migrations`, portanto um deploy normal não o executa.

A migração valida UUID, nome do projeto, domínio reservado `@example.test`, datas, quantidades de registros, versões do plano, tarefa concluída, proposta aprovada e repositório GitHub. Interrompe a operação se houver atividade posterior ao inventário, outro projeto do mesmo usuário ou referências que poderiam afetar dados externos. Se o projeto já estiver ausente, não altera nenhuma linha e não tenta descobrir ou excluir contas pelo domínio do e-mail.

As verificações e exclusões são atômicas. Um lock temporário nas nove tabelas impede mudanças concorrentes durante a checagem e as cascatas; leituras continuam disponíveis. O limite de espera pelo lock é cinco segundos. Divergências ou bloqueios exigem revisão, sem relaxar as proteções para forçar a limpeza.

Os testes em [`tests/cleanup-fixture.test.ts`](../tests/cleanup-fixture.test.ts) verificam exclusão restrita, repetição segura, preservação de outros projetos e interrupção diante de alterações. Usam transações revertidas e aceitam somente banco descartável em loopback. No CI, usam o PostgreSQL 17 já provisionado; para execução local, configure `FORGE_CLEANUP_TEST_DATABASE_URL` com um banco de teste contendo as quatro migrações existentes e execute `npm test`.

## Aplicação em produção

1. Autenticar o painel/cliente de implantação do projeto Netlify `vinsett-forge-ai`. O conector de consulta estar conectado não autentica a CLI ou o navegador.
2. Confirmar no painel a presença do projeto sintético e de um backup recuperável. Comparar seu estado com o [inventário do ensaio](../docs/BACKUP_RESTORE_2026-10-05.md). Se os dados mudaram, revisar o plano de limpeza.
3. Mover o SQL testado para uma nova pasta em `netlify/database/migrations/<timestamp-atual>_cleanup-acceptance-fixture/migration.sql`, com prefixo superior às migrações aplicadas, e ajustar o caminho no teste. Não editar migrações anteriores.
4. Submeter a alteração ao CI e publicar pelo fluxo de deploy autorizado. A Netlify aplica a DML antes de publicar. Não executar exclusões por SQL avulso ou editar linhas pelo painel como agente.
5. Verificar a ausência do fixture, a preservação dos demais dados e a saúde do site. Registrar a evidência sem expor linhas pessoais ou credenciais.

## Branches descartáveis do ensaio

A exclusão continua restrita ao painel autenticado, no projeto Forge. Confirmar os nomes e remover somente `restore-rehearsal-20261005` e `old-restore-rehearsal-20261005`. Preservar `production` e os snapshots existentes. O SQL acima não altera branches ou backups.

## Tags históricas

O comando `bash scripts/publish-historical-tags.sh --verify` valida os seis objetos originais sem modificar o remoto. A publicação usa `--push`, de forma atômica e sem force, e exige um cliente Git autenticado com escrita no repositório e permissão de workflows. Não recriar tags leves ou alterar os commits históricos para contornar essa permissão.
