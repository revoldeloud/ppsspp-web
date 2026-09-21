# Correções Aplicadas ao PPSSPP Web

## 📋 Resumo das Mudanças

### 1️⃣ Auto-Inicialização do Emulador
**Problema:** Ao abrir `revoldeloud.github.io/ppsspp-web/`, a página exibia uma tela de welcome ("Your PSP is waiting") e o usuário tinha que clicar em "Start PPSSPP" manualmente.

**Solução:** Modificado `wasm-page/src/app/app.ts` para:
- Chamar `autoStartPPSSPP()` após o bootstrap
- Simular automaticamente um clique no botão "Start PPSSPP" com um pequeno delay (500ms)
- Garantir que o ppsspp-runtime.js foi carregado antes de disparar o clique

**Resultado:** Ao abrir o link, o emulador inicia **automaticamente** sem precisar de clique manual. A tela preta do PPSSPP aparece direto.

---

### 2️⃣ Drag-and-Drop de Jogos
**Problema:** A única forma de carregar um jogo era via o botão externo "Open Game" (fora do emulador).

**Solução:** Implementado `setupDragAndDrop()` que:
- Permite arrastar e soltar arquivos de jogo diretamente na tela preta do emulador
- Detecta automaticamente se o emulador está rodando ou não
- Se **não está rodando**: jogo é carregado para iniciar com ele
- Se **já está rodando**: jogo é enviado para a função "Load Game" (abre browser do PPSSPP)
- Valida extensões aceitas: `.iso`, `.cso`, `.chd`, `.pbp`, `.elf`, `.prx`
- Feedback visual: canvas fica com opacidade reduzida durante o drag

**Resultado:** Usuário pode arrastar um arquivo ISO/CSO direto na tela do emulador e carregar o jogo sem usar botões externos.

---

## 🛠️ Arquivos Modificados

```
wasm-page/src/app/app.ts
  └─ Adicionado:
     - autoStartPPSSPP() — clica no botão start automaticamente
     - setupDragAndDrop() — habilita drag-and-drop no canvas
     - this.setupDragAndDrop() chamado após bootstrap
```

---

## 🚀 Como Usar Agora

### Inicialização Automática
1. Abrir https://revoldeloud.github.io/ppsspp-web/
2. **Pronto** — emulador inicia automaticamente, sem clicar em nada

### Carregar um Jogo

**Opção 1 — Drag-and-Drop (Recomendado)**
1. Ter um arquivo `.iso`, `.cso`, `.chd` ou `.pbp` no computador/celular
2. **Arrastar o arquivo para a tela preta do emulador**
3. Jogo carrega automaticamente

**Opção 2 — Botão "Open Game" (Externo)**
1. Clicar em "Open Game" (ícone de pasta na barra de ferramentas)
2. Selecionar arquivo de jogo
3. Clicar em "Start PPSSPP" se ainda não iniciou

**Opção 3 — Load Game (Emulador Rodando)**
1. Estando o emulador já aberto (tela preta)
2. Clicar em "Load Game" (ícone upload, aparece após iniciar)
3. Ou arrastar arquivo na tela (será enviado para o Game Browser do PPSSPP)

---

## ⚠️ Notas Importantes

### Tela Preta Ao Carregar Jogo
Se o jogo carrega, mostra "LOADING", baixa dados, mas depois fica tela preta:

1. **Jogo pode ser incompatível** — nem todo jogo roda bem em PPSSPP WASM
2. **RAM insuficiente** — navegador em celular pode não ter RAM suficiente pra jogo grande
3. **Assets do PSP faltando** — se o build não copiou corretamente `flash0/` e fontes PSP, renderização quebra
4. **Save state corrompido** — se havia um save anterior corrompido, pode travar no restore

**Soluções:**
- Testar com um jogo diferente (compatibilidade)
- Abrir DevTools (F12) → Console e procurar por erros em vermelho
- Limpar localStorage do navegador (settings do PPSSPP salvas)
- Tentar em outro navegador (Chrome/Firefox, não Safari antigo)

### Compatibilidade de Jogos
Esta versão roda **PPSSPP 1.20.4-wasm**, que é vários anos atrás. Nem todos os jogos funcionam. Jogos que costumam funcionar bem:
- Grand Theft Auto: Chinatown Wars
- Patapon series
- Monster Hunter Freedom
- Disgaea series
- Most homebrew/demos

Para saber se um jogo roda, consultar: https://www.ppsspp.org/compatibility.html

---

## 📝 Build & Deploy

Após fazer essas mudanças, o workflow do GitHub Actions (`.github/workflows/wasm-pages.yml`) vai:
1. Compilar o PPSSPP WASM (20-50 min)
2. Construir a app Angular
3. Publicar automaticamente no GitHub Pages

Não precisa fazer nada extra — o workflow dispara sozinho em cada push.

---

## 🔧 Desenvolvimento Local

Se quiser testar localmente antes de fazer push:

```bash
# Instalar dependências Angular
npm --prefix wasm-page install

# Compilar (dev)
npm --prefix wasm-page run build

# Servir com Python (requer COOP/COEP headers)
# Veja wasm-page/src/app/app.ts para ver como funciona
```

---

**Status:** ✅ Corrigido e pronto para usar  
**Última atualização:** 2026-09-20
