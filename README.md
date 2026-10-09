# Culinária

## Sobre

**Culinária** é um caderno de receitas.


## Como correr localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 22.12.0
- [npm](https://www.npmjs.com/)

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/joaonunovalente/culinaria.git

# Aceder à pasta
cd culinaria

# Instalar as dependências
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

## Autor

João Nuno Valente
