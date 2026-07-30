# ListaFácil 🛒✨

O **ListaFácil** é um aplicativo moderno e elegante de gestão de listas de compras, focado em uma experiência de usuário (UX) premium e colaboração em tempo real. Diga adeus às mensagens de texto desorganizadas e ao papel amassado no fundo do carrinho de supermercado!

## 🚀 Funcionalidades Principais

* **👨‍👩‍👧‍👦 Compartilhamento Familiar em Tempo Real:** Conecte contas diferentes através de Códigos de Convite. Quando sua esposa(o) marcar um item no supermercado, ele será riscado na tela do seu celular no mesmo segundo (sincronização via Supabase Realtime).
* **📲 Exportação para WhatsApp:** Vai pedir pra alguém passar no mercado? Clique em "Compartilhar" e o app formata toda a sua lista com emojis e caixinhas de marcação `[ ]`, abrindo direto no WhatsApp.
* **🏠 Múltiplas Listas:** Separe as compras da sua "Casa" das compras do "Condomínio" (ou qualquer outra organização que precisar).
* **✏️ Edição Descomplicada:** Interface *in-place*. Clique no lápis, edite o nome do item e aperte Enter. Simples assim.
* **🌓 Dark Mode Nativo:** Uma interface de vidro (glassmorphism) que fica deslumbrante tanto no modo claro quanto no modo escuro.
* **📱 Progressive Web App (PWA):** O aplicativo pode ser instalado diretamente na tela inicial do seu celular, parecendo e agindo como um aplicativo nativo.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as melhores e mais modernas ferramentas do ecossistema front-end:

* **React + Vite:** Para uma performance de interface absurdamente rápida.
* **Tailwind CSS:** Para uma estilização utilitária e componentes 100% responsivos (Mobile-first).
* **Framer Motion:** Responsável por todas as micro-interações, animações de entrada/saída e transições suaves que dão a sensação "premium" ao aplicativo.
* **Supabase:** O "cérebro" do backend. Gerencia autenticação de usuários e banco de dados PostgreSQL com atualizações *Realtime* via WebSockets.

## ⚙️ Como rodar o projeto localmente

Caso queira clonar o projeto e rodar na sua máquina, siga os passos:

1. Clone este repositório:
   ```bash
   git clone https://github.com/pedrotercio14/Lista-Facil.git
   ```
2. Entre na pasta do projeto:
   ```bash
   cd Lista-Facil
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Crie um arquivo `.env` na raiz do projeto com as chaves do seu Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_aqui
   ```
5. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---
*Feito com foco na melhor experiência de usuário. Aproveite suas compras!*
