<div align="center">
  <img src="preview.webp" alt="Culinária - Pré-visualização" width="700" />

# 🍽️ Culinária

[![Astro](https://img.shields.io/badge/Astro-7.1.3-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)

**Um blog de receitas simples.**
</div>

---

## Sobre

**Culinária** é um blog pessoal de receitas criado por [João Nuno Valente](https://github.com/joaonunovalente). Aqui encontras receitas de pratos que eu fiz, com ingredientes de qualidade e passos claros — feito para quem gosta de cozinhar sem complicações.

---

## Tecnologias

- [Astro](https://astro.build/) — Framework moderno para sites rápidos

---

## Como correr localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 22.12.0
- [npm](https://www.npmjs.com/) (vem incluído no Node)

### Instalação

```bash
# Clona o repositório
git clone https://github.com/joaonunovalente/culinaria.git

# Acede à pasta
cd culinaria

# Instala as dependências
npm install
```

### Comandos disponíveis

| Comando                | Descrição                                                       |
| ---------------------- | --------------------------------------------------------------- |
| `npm run dev`          | Inicia o servidor de desenvolvimento em `http://localhost:4321` |
| `npm run build`        | Gera a versão estática para produção na pasta `dist/`           |
| `npm run preview`      | Pré-visualiza a versão final localmente                         |
| `npm run check`        | Verifica os tipos com Astro Check                               |
| `npm run format`       | Formata o código com Prettier                                   |
| `npm run format:check` | Verifica se o código está formatado                             |

---

## Estrutura do projeto

```text
culinaria/
├── public/        # Ficheiros estáticos (imagens, ícones, etc.)
├── src/
│   ├── components/ # Componentes reutilizáveis
│   ├── config/     # Configurações do site
│   ├── content/    # Conteúdo em Markdown/MDX (receitas)
│   ├── layouts/    # Esquemas das páginas
│   ├── lib/        # Utilitários e auxiliares
│   ├── pages/      # Rotas do Astro
│   └── styles/     # Estilos globais
├── astro.config.mjs # Configuração do Astro
└── package.json     # Dependências e scripts
```

---

## Autor

Mantido por **[João Nuno Valente](https://joaonunovalente.com)**.
