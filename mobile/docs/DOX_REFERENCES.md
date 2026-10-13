# 📚 Referência de Funcionalidades (Gap Analysis)

Este documento compara o estado atual do projeto com os mockups originais de alta fidelidade, servindo como guia para o desenvolvimento futuro.

## 1. SuperApp & Mini-Programs
**Arquivos de Referência:**
- `user-mini-programs.tsx`: Apps para usuário final (Dividir conta, Gastos).
- `superapp-marketplace.tsx`: Loja de apps de terceiros (iFood, Uber, etc).
- `mini-programs-mvp.tsx`: Apps de gestão para lojistas (Estoque, CRM).

**Funcionalidades Faltantes:**
- [ ] **Marketplace UI:** Grade de apps categorizada (Alimentação, Transporte, Serviços).
- [ ] **Apps de Utilidade:**
    - Calculadora de divisão de conta.
    - Rastreador de metas de economia.
    - Comparador de preços locais.
- [ ] **Apps de Negócio (Lojista):**
    - Controle simples de estoque.
    - Gestão de clientes (CRM básico).
    - Programa de fidelidade configurável.

## 2. Analytics & Inteligência
**Arquivos de Referência:**
- `analytics-screen-mvp.tsx`: Dashboard rico em dados.

**Funcionalidades Faltantes:**
- [ ] **Gráficos:** Vendas por hora e dias da semana.
- [ ] **Insights de Negócio:** "Melhor horário de vendas", "Ticket médio".
- [ ] **Ranking:** Produtos mais vendidos e clientes VIP.
- [ ] **Relatórios:** Exportação para PDF/Excel (simulada).

## 3. Perfil & Gamificação
**Arquivos de Referência:**
- `user-profile-settings.tsx`: Configurações avançadas de usuário.
- `profile-settings-mvp.tsx`: Perfil de estabelecimento.

**Funcionalidades Faltantes:**
- [ ] **Níveis de Usuário:** Sistema Bronze/Prata/Ouro com cashback progressivo.
- [ ] **Segurança Avançada:** Configuração de limites diários, biometria e PIN.
- [ ] **Gestão de Chaves PIX:** Adicionar/Remover chaves.
- [ ] **Modo Escuro:** Toggle de tema no perfil.

## 4. Histórico & Transações
**Arquivos de Referência:**
- `transaction-history-mvp.tsx`
- `user-transaction-history.tsx`

**Funcionalidades Faltantes:**
- [ ] **Filtros Avançados:** Por período, valor e categoria.
- [ ] **Comprovantes:** Tela de detalhe da transação com opção de compartilhamento.
- [ ] **Categorização:** Auto-categoria (Restaurante, Transporte) para gastos.

## 5. Onboarding & Fluxos
**Arquivos de Referência:**
- `onboarding-flow-mvp.tsx`: Fluxo passo-a-passo inicial.
- `shimopay-landing.html`: Landing page conceitual.

**Funcionalidades Faltantes:**
- [ ] **Tutorial Inicial:** Slides explicando "Pagamento Offline" no primeiro acesso.
- [ ] **Setup Wizard:** Configuração guiada de perfil e segurança.

---

## 🚀 Próximos Passos Prioritários
1. Implementar **SuperApp Marketplace** (Menu "Lojas").
2. Implementar **Analytics Detalhado** no Dashboard do Lojista.
3. Melhorar **Histórico de Transações** com filtros e detalhes.
