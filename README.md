# FanGigs

FanGigs é uma plataforma que conecta criadores de conteúdo adulto com talentos profissionais como atores, editores e fotógrafos. O site permite publicar gigs, aplicar para jobs, e até criar contratos personalizados.
A versão inicial da plataforma já está no ar e acessível em:  [https://www.fan-gigs.com](https://www.fan-gigs.com)


- FUNCIONALIDADES CONCLUÍDAS

Tecnologias Utilizadas
• Next.js (App Router, arquivos .jsx)
• Supabase (autenticação, banco de dados PostgreSQL, armazenamento de imagens)
• Tailwind CSS (estilização)
• GitHub (repositório)
• Render (deploy)
• RSS Parser (importar notícias externas)


Páginas e Componentes Funcionais

1. Home (/)
• Hero Section 
• Scrollable cards
• Exibe as últimas notícias da indústria (via feed RSS e artigos manuais com prioridade).
• Botões principais:
• "Find Work" leva a lista de jobs postados por produtoras e criadores de conteudos
• “Find Talents” leva à lista de talentos (perfis que fizeram sign up como talent)
• “Post a Job” leva à criação de um job (requer login).
• Header com avatar do usuário logado e 'Hello Usuario', botao Dashboard e botao Sign Out.
• Footer com links básicos.

2. Modal de Login e Cadastro (SignInModal e JoinModal)
• Modal com blur de fundo.
• Alternância entre “Talent” e “Content Creator”.
• Cadastro cria o usuário no Supabase Auth e insere dados na tabela profiles.

3. Dashboards
• /talent-dashboard
Painel para modelos visualizarem jobs, editar perfil, histórico etc.
• /producer-dashboard
Painel para produtores visualizarem candidaturas, postar jobs etc.
• **** /admin-dashboard ****
Apenas para usuários com role “admin” listagem de usuários, jobs e artigos, criar artigo manual com prioridade, moderacao e seguranca, gestao financeira, estatisticas, envio de notificacoes/email marketing.
Comissoes de conteudo personalizado (ver solicitacoes em andamento, acompanhar contratos gerados entre produtor e talent, gerenciar taxas cobradas pela Plataforma). 

5. Editar Perfil (/edit-profile)
• Formulário para editar dados como:
• Nome, idade, orientação, altura, tipo de conta etc.
• Upload de fotos (rosto, corpo inteiro).
• Definir se perfil é público ou privado. (um campo de informacoes explicando os beneficios de manter o perfil publico)
• Redes sociais (Instagram, Twitter, etc).

6. Job Posting
• Criar job: título, descrição, localização, pagamento (confidencial ou não), data de expiração, tags para filtro.
• Jobs listados em “Find Work”.

7. Lista de Talentos (/find-talents)
• Filtro por tags.
• Lista de perfis públicos.

8. Sistema de Notícias
• RSS automático de sites como 'AVN', 'XBIX','LADbible Adult Industry'.
• Artigos manuais com priority de exibição.
• Página dinâmica para cada artigo via slug.



FUNCIONALIDADES PLANEJADAS (A FAZER)

Autorização de Rotas (Proteção por Tipo de Usuário)
• Usar HOC (Higher-Order Component) para impedir que talents acessem a dashboard de producers e vice-versa.

Mapa Interativo de Viagens na Home Page
• Criadores poderão indicar em que cidades estarão disponíveis.
• Exibição em um mapa interativo com datas e disponibilidade para colaborações.

Sistema de Comissões de Conteúdo
• Produtores poderão solicitar vídeos personalizados de modelos.
• Gerador de contrato com termos (pagamento, uso, expiração, nome artístico).
• FanGigs recebe uma porcentagem ou taxa fixa.
→ Na dashboard ou no perfil de um talento, o produtor clica em “Request Custom Content” e preenche: titulo do conteudo, descricao do que deseja (ex. "video solo de  minutos com tema especifico"), 
Valor oferecido (com opcao de de divider 50% na criacao e 50% na entrega), prazo de entrega, nome artistico, direitos de uso, expiracao de contrato (caso deseje limitar o uso). 
*Ao clicar em "Send Request" a proposta e enviada ao talent. 
→ Talento recebe notificacao e aceita ou recusa. *Aceitar gera contrato automaticamente *Recusar nitifica o produtor.
→ Um modelo de contrato é preenchido com os dados da proposta. Pode ser gerado em PDF com campos como: dados do produtor e talent, descricao de comissao, valor e forma de pagamento, direitos de uso de conteudo, assinaturas digitais, utilizar DocuSing API ou  HelloSign API. 
→ A Plataforma pode cobrar uma taxa fixa ou valor da comissao. O contrato só é ativado após o pagamento da comissão (via Stripe ou Juno).
→ Status e entrega: O produtor e o talento podem acompanhar o status: pendente, em andamento, entregue, concluído. Talento envia o conteúdo diretamente pela plataforma (upload seguro). Produtor confirma entrega. Dinheiro é liberado para o talento.

****Nota sobre o sistema de Comissões de Conteúdo Personalizado****
O sistema de "Solicitação de Conteúdo Personalizado" na FanGigs não se limita apenas à relação Creator → Talent.  Também permite Creator → Creator.
Exemplo prático:
Um grande estúdio  (usuário cadastrado como Creator) pode solicitar que uma criadora de conteúdo (tambem cadastrada como Creator e ativa em plataformas como OF) grave um video sob demanda. O conteúdo será usado no site do estúdio mediante contrato e pagamento acordado.

TIPOS DE USUARIOS
Talento → Usuários que estão em busca de oportunidades de trabalho (Gigs) na indústria do entretenimento adulto. Podem ser atores, atrizes, câmeras, editores, maquiadores, fotógrafos, produtores independentes, entre outros profissionais que oferecem seus serviços.
Content Creator → Usuários que produzem conteúdo adulto e buscam talentos para colaborar em seus projetos. Podem ser grandes estúdios ou criadores independentes ativos em plataformas como OnlyFans, Fanvue, Fansly, Privacy, entre outras.


Sistema de Assinatura
• Sistema de pagamento internacional com Stripe.
• Para o Brasil, Juno ou PagSeguro.
• Assinaturas como:
• R$ 10,00/mês para brasileiros.
• $10,00/mês para estrangeiros.
• Recursos premium: ver perfis ocultos, prioridade nos anúncios, relatórios avançados.

Painel Admin Avançado
• Editar usuários e conteúdos manualmente.
• Ver estatísticas.
• Criar/editar jobs e artigos direto do painel.

Mensagens entre Usuários
• Chat entre produtor e talento após aceitar uma proposta, ou para fazer uma proposta.


 Tabelas no Supabase
• profiles: perfil de usuário (id, nome, tipo, idade, fotos, etc).
• job_postings: anúncios de trabalho.
• news_articles: artigos manuais.
• applications: candidaturas aos jobs (a ser criada).
• subscriptions: plano ativo do usuário (a ser criada).
• custom_comissions: Requisições de conteúdo personalizado. (a ser criada).
• chat_messages: Chat entre usuários (aser criada).
• user_roles: Possibilidade de múltiplos níveis de permissão (admin, suporte, etc).
• content_uploads: Para upload e entrega dos vídeos de comissões personalizadas.
• contracts: Guarda o PDF do contrato gerado + status de assinatura.
• support_tickets: Sistema de atendimento/suporte dentro da plataforma.



 Design
• Visual clean com cores suaves (branco, pêssego, cinza).
• Tipografia moderna, modais com blur, botões arredondados.
• Layout adaptado a mobile e desktop.
• Scroll suave, modais centralizados.
