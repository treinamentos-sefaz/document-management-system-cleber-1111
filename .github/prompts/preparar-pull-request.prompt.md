---
description: "Prepare título, descrição e checklist de prontidão de um pull request com base nas alterações do workspace."
name: "Preparar Pull Request"
argument-hint: "contexto adicional ou issue relacionada (opcional)"
agent: agent
---

# Preparar Pull Request

Prepare um pull request para as alterações atuais do workspace. Considere o contexto adicional: `${input:contexto:sem contexto adicional}`.

Antes de redigir:

- Leia as instruções aplicáveis do repositório e procure um template de pull request existente; siga-os sem duplicar regras já documentadas.
- Inspecione a branch atual, o estado do working tree e o diff em relação à branch-base apropriada. Se a base não estiver clara, pergunte ou declare a suposição.
- Entenda o propósito das mudanças pelo código, testes e contexto fornecido. Não invente motivação, resultados de testes, impactos ou referências a issues.
- Identifique mudanças não relacionadas ou arquivos gerados que possam precisar de revisão, sem descartá-los nem alterá-los.
- Verifique os testes ou validações relevantes disponíveis para as mudanças. Execute apenas verificações apropriadas e seguras; registre exatamente o que foi executado e o resultado. Não afirme que algo passou sem evidência.

Entregue:

1. Um título conciso, específico e orientado à mudança, sem ponto final.
2. Uma descrição pronta para revisão, cobrindo contexto/problema, solução e impacto observável. Inclua decisões ou limitações importantes quando sustentadas pelo código.
3. Uma seção de testes com comandos e resultados reais; diferencie claramente o que não foi executado.
4. Uma checklist de prontidão com itens relevantes, como documentação, testes, migrações, segurança, acessibilidade ou screenshots, conforme o tipo de mudança. Não marque itens sem evidência.
5. Bloqueios, riscos, dúvidas ou informações que faltam, se houver.

Use Markdown, linguagem direta e detalhes suficientes para uma revisão eficiente. Omita seções que não se aplicam. Não altere arquivos, não crie commits, não faça push e não abra o pull request; apresente a proposta para revisão do usuário.