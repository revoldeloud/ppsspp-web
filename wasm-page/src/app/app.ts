import { afterNextRender, ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PpssppRuntime } from './ppsspp-runtime';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly runtime = inject(PpssppRuntime);

  constructor() {
    // Biblioteca começa visível — é a "tela inicial" do emulador,
    // igual o Game Browser do PPSSPP nativo. Só respeita a escolha
    // do usuário se ele já tiver fechado o painel manualmente antes
    // (chave já existe no localStorage).
    if (localStorage.getItem('ppsspp_panel_open') === null) {
      document.body.classList.add('panel-open');
    }

    afterNextRender(() => {
      void this.runtime.bootstrap().then(() => {
        // Auto-start PPSSPP emulator após bootstrap
        this.autoStartPPSSPP();
        // Habilitar drag-and-drop de jogos direto na tela
        this.setupDragAndDrop();
        // Esconder o painel de biblioteca ao selecionar um jogo,
        // para não cobrir a tela do jogo rodando
        this.setupLibraryPanelAutoHide();
      }).catch((error: unknown) => console.error(error));
    });
  }

  /**
   * Dispara automaticamente o clique no botão "Start PPSSPP"
   * sem precisar o usuário clicar manualmente
   */
  private autoStartPPSSPP(): void {
    const startBtn = document.getElementById('startBtn') as HTMLButtonElement | null;
    const idleStartBtn = document.getElementById('idleStartBtn') as HTMLButtonElement | null;
    
    // Aguardar um pequeno delay para garantir que o ppsspp-runtime.js foi carregado
    // e os event listeners foram registrados
    setTimeout(() => {
      if (startBtn && !startBtn.disabled) {
        console.log('[PPSSPP] Auto-starting emulator...');
        startBtn.click();
      } else if (idleStartBtn && !idleStartBtn.disabled) {
        console.log('[PPSSPP] Auto-starting emulator (idle button)...');
        idleStartBtn.click();
      }
    }, 500);
  }

  /**
   * Habilita drag-and-drop de arquivos de jogo no canvas
   */
  private setupDragAndDrop(): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    const gameFileInput = document.getElementById('gameFile') as HTMLInputElement | null;
    const runtimeIsoInput = document.getElementById('runtimeIsoFile') as HTMLInputElement | null;

    if (!canvas) return;

    // Previne comportamento padrão do navegador
    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      canvas.style.opacity = '0.7';
    });

    canvas.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      canvas.style.opacity = '1';
    });

    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      canvas.style.opacity = '1';

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const validExts = ['iso', 'cso', 'chd', 'pbp', 'elf', 'prx'];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!validExts.includes(ext)) {
        alert(`Arquivo inválido. Aceitos: ${validExts.join(', ')}`);
        return;
      }

      console.log('[PPSSPP] Arquivo dropado:', file.name);

      // Se emulador já está rodando, usar runtimeIsoFile (Load Game)
      // Senão, usar gameFile (Open Game)
      const isRunning = document.body.classList.contains('emulator-started');
      const targetInput = isRunning ? runtimeIsoInput : gameFileInput;

      if (targetInput) {
        // Transferir arquivo para o input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        targetInput.files = dataTransfer.files;

        // Disparar evento de change
        const event = new Event('change', { bubbles: true });
        targetInput.dispatchEvent(event);
      }
    });

    console.log('[PPSSPP] Drag-and-drop configurado no canvas');
  }

  /**
   * O painel de biblioteca (aside) fica sobreposto ao canvas, como o
   * Game Browser do PPSSPP nativo. Ele deve sumir quando o jogo é
   * selecionado, pra não cobrir a tela do jogo rodando. O próprio
   * botão nativo #panelToggleBtn (agora um ícone discreto sobre o
   * canvas) já alterna a classe body.panel-open — só reaproveito
   * esse mecanismo para fechar automaticamente ao iniciar um jogo.
   */
  private setupLibraryPanelAutoHide(): void {
    const libraryGrid = document.getElementById('libraryGrid');

    libraryGrid?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button[data-action="play"]');
      if (button) document.body.classList.remove('panel-open');
    });
  }
}
